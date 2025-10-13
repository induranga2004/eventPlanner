const router = require('express').Router();
const User = require('../models/User');
const requireAuth = require('../auth/middleware/requireAuth');

const SERVICE_TOKEN = process.env.VENDOR_SERVICE_TOKEN || process.env.SERVICE_VENDOR_TOKEN;
const ALLOWED_ROLES = ['user', 'admin'];

function hasServiceAccess(req) {
  if (!SERVICE_TOKEN) return false;
  const headerToken = req.headers['x-service-token'] || req.headers['x-service-secret'];
  return headerToken && headerToken === SERVICE_TOKEN;
}

function ensurePlannerAccess(req, res, next) {
  if (hasServiceAccess(req)) {
    req.isServiceRequest = true;
    return next();
  }

  return requireAuth(req, res, () => {
    const role = req.user?.role;
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(403).json({ error: 'insufficient permissions' });
    }
    return next();
  });
}

function sanitizeUser(user) {
  if (!user) return null;
  const {
    _id,
    role,
    name,
    email,
    phone,
    standardRate,
    spotifyLink,
    venueAddress,
    capacity,
    genres,
    members,
    experience,
    equipment,
    services,
    eventTypes,
    lightTypes,
    crewSize,
    companyName,
    contactPerson,
    bio,
    website,
    instagramLink,
    facebookLink,
    youtubeLink,
    photo,
    additionalPhoto,
    createdAt,
    updatedAt,
  } = user.toObject({ getters: true, virtuals: false });

  return {
    id: _id?.toString(),
    role,
    name,
    email,
    phone,
    standardRate,
    spotifyLink,
    venueAddress,
    capacity,
    genres,
    members,
    experience,
    equipment,
    services,
    eventTypes,
    lightTypes,
    crewSize,
    companyName,
    contactPerson,
    bio,
    website,
    instagramLink,
    facebookLink,
    youtubeLink,
    photo,
    additionalPhoto,
    createdAt,
    updatedAt,
  };
}

const ROLE_MAP = {
  musician: 'soloMusicians',
  music_band: 'ensembles',
  venue: 'venues',
  lights: 'lighting',
  sounds: 'sound',
};

async function fetchByRoles(roles) {
  const users = await User.find({ role: { $in: roles } }).sort({ createdAt: -1 }).exec();
  return users.map(sanitizeUser);
}

router.get('/catalog', ensurePlannerAccess, async (req, res) => {
  try {
    const roles = Object.keys(ROLE_MAP);
    const users = await User.find({ role: { $in: roles } }).sort({ createdAt: -1 }).exec();

    const catalog = roles.reduce((acc, role) => {
      const key = ROLE_MAP[role];
      acc[key] = [];
      return acc;
    }, {});

    users.forEach((user) => {
      const key = ROLE_MAP[user.role];
      if (!key) return;
      catalog[key].push(sanitizeUser(user));
    });

    return res.json({ catalog, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('vendors.catalog error', error);
    return res.status(500).json({ error: 'failed to load vendor catalog' });
  }
});

router.get('/:role', ensurePlannerAccess, async (req, res) => {
  try {
    const { role } = req.params;
    const roles = ROLE_MAP[role] ? [role] : Object.keys(ROLE_MAP).filter((r) => ROLE_MAP[r] === role);
    if (!roles.length) {
      return res.status(404).json({ error: 'unknown vendor role' });
    }
    const vendors = await fetchByRoles(roles);
    return res.json({ vendors, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('vendors.role error', error);
    return res.status(500).json({ error: 'failed to load vendors' });
  }
});

module.exports = router;
