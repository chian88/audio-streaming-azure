import express from 'express';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

app.use(express.static(__dirname));

app.get('/api/token', async (req, res) => {
  try {
    const tokenResponse = await fetch(
      `https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': SPEECH_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': '0',
        },
      }
    );

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error('Token fetch failed:', tokenResponse.status, err);
      return res.status(tokenResponse.status).json({ error: 'Failed to fetch token' });
    }

    const token = await tokenResponse.text();
    res.json({ token, region: SPEECH_REGION });
  } catch (err) {
    console.error('Token endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
