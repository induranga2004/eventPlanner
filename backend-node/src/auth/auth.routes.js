const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
// Background removal feature disabled: keep a noop import for compatibility
const { removeBackground } = require('../utils/removeBackground');

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'additionalPhoto', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
]);

const signToken = (user) =>
  jwt.sign({ sub: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30m' });


// POST /api/auth/register
router.post('/register', uploadFields, async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded Files:', req.files);

  const { 
    email, password, role, name, phone, spotifyLink, venueAddress, capacity,
    standardRate,
    // Music band fields
    bandName, genres, members, experience, equipment, bio, youtubeLink, instagramLink, facebookLink,
    // Lights and sounds fields
    companyName, contactPerson, address, lightTypes, eventTypes, services, crewSize, equipmentDetails, website
  } = req.body || {};
  
  // Determine the name field based on role
  const displayName = role === 'music_band' ? bandName : (role === 'lights' || role === 'sounds') ? companyName : name;
  
  if (!email || !password || !role || !displayName) {
    return res.status(400).json({ error: 'email, password, role, and name are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = { email, passwordHash, role, name: displayName, phone };

  if (standardRate !== undefined) {
    const parsedRate = Number(standardRate);
    if (Number.isNaN(parsedRate)) {
      return res.status(400).json({ error: 'standardRate must be a number' });
    }
    userData.standardRate = parsedRate;
  }

  try {
    if (req.files && req.files['photo']) {
      const photoPath = `/uploads/${req.files['photo'][0].filename}`;
      userData.photo = photoPath;
      // Background removal disabled: keep original photo path in photoBgRemoved for backward compatibility
      userData.photoBgRemoved = photoPath;
    }

    if (req.files && req.files['additionalPhoto']) {
      const additionalPhotoPath = `/uploads/${req.files['additionalPhoto'][0].filename}`;
      userData.additionalPhoto = additionalPhotoPath;
      // Background removal disabled: keep original additional photo path in additionalPhotoBgRemoved
      userData.additionalPhotoBgRemoved = additionalPhotoPath;
    }

    if (req.files && req.files['logo']) {
      const logoPath = `/uploads/${req.files['logo'][0].filename}`;
      userData.logo = logoPath;
    }

    // Handle role-specific fields
    if (role === 'musician') {
      userData.spotifyLink = spotifyLink;
    } else if (role === 'venue') {
      userData.venueAddress = venueAddress;
      userData.capacity = capacity;
    } else if (role === 'music_band') {
      userData.bandName = bandName;
      userData.genres = genres;
      userData.members = members;
      userData.experience = experience;
      userData.equipment = equipment;
      userData.bio = bio;
      userData.spotifyLink = spotifyLink;
      userData.youtubeLink = youtubeLink;
      userData.instagramLink = instagramLink;
      userData.facebookLink = facebookLink;
    } else if (role === 'lights' || role === 'sounds') {
      userData.companyName = companyName;
      userData.contactPerson = contactPerson;
      userData.address = address;
      userData.lightTypes = lightTypes;
      userData.eventTypes = eventTypes;
      userData.services = services;
      userData.crewSize = crewSize;
      userData.equipmentDetails = equipmentDetails;
      userData.website = website;
      userData.instagramLink = instagramLink;
      userData.facebookLink = facebookLink;
    }

    const user = await User.create(userData);
    const token = signToken(user);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during registration:', error); // Log the exact error
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    // Return a temporary token indicating 2FA is required
    const tempToken = jwt.sign(
      { 
        email: user.email, 
        temp: true, 
        purpose: '2fa_required' 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10m' }
    );
    
    return res.json({ 
      requires2FA: true, 
      tempToken,
      message: '2FA verification required' 
    });
  }

  // Normal login without 2FA
  const token = signToken(user);
  res.json({ 
    token, 
    role: user.role,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      photo: user.photo,
      phone: user.phone,
      standardRate: user.standardRate,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      // Include role-specific fields
      spotifyLink: user.spotifyLink,
      venueAddress: user.venueAddress,
      capacity: user.capacity,
      bandName: user.bandName,
      genres: user.genres,
      companyName: user.companyName,
      contactPerson: user.contactPerson,
      address: user.address
    }
  });
});

// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fields that can be updated
    const updateFields = [
      'email', 'phone', 'contactPerson', 'address', 'bio', 'website',
      'instagramLink', 'facebookLink', 'companyName', 'experience',
      'crewSize', 'equipmentDetails', 'genre', 'instruments', 'performanceStyle',
      'equipment', 'eventTypes', 'services', 'lightTypes', 'bandName',
      'genres', 'members', 'youtubeLink', 'venueAddress', 'capacity', 'spotifyLink',
      'standardRate'
    ];

    // Update only provided fields
    for (const field of updateFields) {
      if (req.body[field] !== undefined) {
        if (field === 'standardRate') {
          const parsedRate = Number(req.body[field]);
          if (Number.isNaN(parsedRate)) {
            return res.status(400).json({ error: 'standardRate must be a number' });
          }
          user[field] = parsedRate;
        } else {
          user[field] = req.body[field];
        }
      }
    }

    // Validate email if it's being updated
    if (req.body.email && !validator.isEmail(req.body.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email is already taken by another user
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    await user.save();

    // Return updated user data (excluding sensitive information)
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      photo: user.photo,
      phone: user.phone,
  standardRate: user.standardRate,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      // Include all profile fields
      contactPerson: user.contactPerson,
      address: user.address,
      bio: user.bio,
      website: user.website,
      instagramLink: user.instagramLink,
      facebookLink: user.facebookLink,
      companyName: user.companyName,
      experience: user.experience,
      crewSize: user.crewSize,
      equipmentDetails: user.equipmentDetails,
      genre: user.genre,
      instruments: user.instruments,
      performanceStyle: user.performanceStyle,
      equipment: user.equipment,
      eventTypes: user.eventTypes,
      services: user.services,
      lightTypes: user.lightTypes,
      bandName: user.bandName,
      genres: user.genres,
      members: user.members,
      youtubeLink: user.youtubeLink,
      venueAddress: user.venueAddress,
      capacity: user.capacity,
      spotifyLink: user.spotifyLink
    };

    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
