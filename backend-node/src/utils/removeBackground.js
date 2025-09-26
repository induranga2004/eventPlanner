const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function removeBackground(imageWebPath) {
  const apiKey = process.env.BG_REMOVE_API_KEY;
  const url = 'https://api.remove.bg/v1.0/removebg';

  const resolvedPath = path.join(__dirname, '../../uploads', path.basename(imageWebPath));

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
      timeout: 30000,
    });

    if (response.status !== 200) {
      throw new Error(`remove.bg failed: ${response.status}`);
    }

    const base = path.basename(resolvedPath, path.extname(resolvedPath));
    const dir = path.dirname(resolvedPath);
    const processedFsPath = path.join(dir, `${base}-bg-removed.png`);
    fs.writeFileSync(processedFsPath, response.data);

    return `/uploads/${path.basename(processedFsPath)}`;
  } catch (error) {
    console.error('[removeBackground] error:', error?.message || error);
    return imageWebPath; // fallback to original
  }
}

module.exports = { removeBackground };



