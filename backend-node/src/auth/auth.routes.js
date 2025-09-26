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

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'additionalPhoto', maxCount: 1 },
]);

const signToken = (user) =>
  jwt.sign({ sub: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30m' });

async function removeBackground(imagePath) {
  const apiKey = process.env.BG_REMOVE_API_KEY; // Ensure this is set in your environment variables
  const url = 'https://api.remove.bg/v1.0/removebg';

  // Ensure the path is resolved relative to the uploads directory
  const resolvedPath = path.join(__dirname, '../../uploads', path.basename(imagePath));
  console.log('Resolved Path:', resolvedPath); // Debugging: Log the resolved file path

  try {
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(resolvedPath));
    formData.append('size', 'auto');

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey,
      },
      responseType: 'arraybuffer',
    });

    console.log('Remove Background API Response:', response.data); // Debugging: Log the API response

    if (response.status !== 200) {
      throw new Error('Failed to remove background');
    }

    const baseName = path.basename(resolvedPath, path.extname(resolvedPath));
    const dirPath = path.dirname(resolvedPath);
    const processedFsPath = path.join(dirPath, `${baseName}-bg-removed.png`);
    fs.writeFileSync(processedFsPath, response.data);

    // Return public web path for client consumption
    const processedWebPath = `/uploads/${path.basename(processedFsPath)}`;
    return processedWebPath;
  } catch (error) {
    console.error('Error in removeBackground function:', error.message || error);
    // Fallback: Return the original image path if background removal fails
    return imagePath;
  }
}

// POST /api/auth/register
router.post('/register', uploadFields, async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded Files:', req.files);

  const { email, password, role, name, phone, spotifyLink, venueAddress, capacity } = req.body || {};
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'email, password, role, and name are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = { email, passwordHash, role, name, phone };

  try {
    if (req.files['photo']) {
      const photoPath = `/uploads/${req.files['photo'][0].filename}`;
      userData.photo = photoPath;
      userData.photoBgRemoved = await removeBackground(photoPath);
    }

    if (req.files['additionalPhoto']) {
      const additionalPhotoPath = `/uploads/${req.files['additionalPhoto'][0].filename}`;
      userData.additionalPhoto = additionalPhotoPath;
      userData.additionalPhotoBgRemoved = await removeBackground(additionalPhotoPath);
    }

    if (role === 'musician') {
      userData.spotifyLink = spotifyLink;
    } else if (role === 'venue') {
      userData.venueAddress = venueAddress;
      userData.capacity = capacity;
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
