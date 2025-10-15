const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateCaptions(event) {
  const prompt = `Generate social media captions for this event as a compact JSON with keys instagram, facebook, linkedin, twitter.\n\nEvent: ${event.name}\nDate: ${event.date}\nVenue: ${event.venue}\nTicket Price: ${event.price}\nAudience: ${event.audience}\n\nRules:\n- Instagram: emojis + hashtags\n- Facebook: storytelling\n- LinkedIn: professional\n- Twitter: max 240 chars\nReturn ONLY valid JSON.`;

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const text = resp.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(text);
  } catch (e) {
    return { instagram: text };
  }
}

module.exports = { generateCaptions };
