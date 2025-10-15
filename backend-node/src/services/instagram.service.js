const axios = require('axios');

const IG_API = 'https://graph.facebook.com/v17.0';

async function createMedia(igUserId, imageUrl, caption, accessToken) {
  const url = `${IG_API}/${igUserId}/media`;
  const { data } = await axios.post(url, null, {
    params: { image_url: imageUrl, caption, access_token: accessToken },
  });
  return data; // { id: creation_id }
}

async function publishMedia(igUserId, creationId, accessToken) {
  const url = `${IG_API}/${igUserId}/media_publish`;
  const { data } = await axios.post(url, null, {
    params: { creation_id: creationId, access_token: accessToken },
  });
  return data;
}

async function shareInstagramPost({ imageUrl, caption }) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    throw new Error('Missing IG_USER_ID or IG_ACCESS_TOKEN');
  }
  const media = await createMedia(IG_USER_ID, imageUrl, caption, IG_ACCESS_TOKEN);
  const result = await publishMedia(IG_USER_ID, media.id, IG_ACCESS_TOKEN);
  return { media, publish: result };
}

module.exports = { shareInstagramPost };
