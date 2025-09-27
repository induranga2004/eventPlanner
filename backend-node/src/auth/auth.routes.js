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

  try {
    if (req.files && req.files['photo']) {
      const photoPath = `/uploads/${req.files['photo'][0].filename}`;
      userData.photo = photoPath;
      userData.photoBgRemoved = await removeBackground(photoPath);
    }

    if (req.files && req.files['additionalPhoto']) {
      const additionalPhotoPath = `/uploads/${req.files['additionalPhoto'][0].filename}`;
      userData.additionalPhoto = additionalPhotoPath;
      userData.additionalPhotoBgRemoved = await removeBackground(additionalPhotoPath);
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

  const token = signToken(user);
  res.json({ token, role: user.role });
});

module.exports = router;
