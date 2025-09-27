const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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

module.exports = { removeBackground };
