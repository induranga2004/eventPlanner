const path = require('path');

// Background removal feature disabled.
// This noop function returns the original web path so the rest of the code can keep working
// without performing any external API calls.
async function removeBackground(imagePath) {
  if (!imagePath) return imagePath;
  // Ensure returned path is a web-accessible uploads path
  const fileName = path.basename(imagePath);
  return `/uploads/${fileName}`;
}

module.exports = { removeBackground };

