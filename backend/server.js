const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const HUGGING_FACE_API_KEY = 'Bearer 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';

const checkModelStatus = async () => {
  const url = 'https://api-inference.huggingface.co/status/CompVis/stable-diffusion-v1-4';
  const headers = {
    Authorization: HUGGING_FACE_API_KEY,
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error checking model status:', error.response ? error.response.data : error.message);
    throw new Error('Error checking model status');
  }
};

app.post('/generate', async (req, res) => {
  const status = await checkModelStatus();
  if (!status.loaded) {
    return res.status(503).send({ message: 'Model is currently loading, please try again later.' });
  }

  try {
    const { text } = req.body;
    const url = 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4';
    const headers = {
      Authorization: HUGGING_FACE_API_KEY,
      'Content-Type': 'application/json',
    };
    const data = {
      inputs: text,
      options: { wait_for_model: true },
    };

    const response = await axios.post(url, data, { headers });
    res.json({ image: response.data });
  } catch (error) {
    console.error('Error generating image:', error.response ? error.response.data : error.message);
    res.status(500).send('Error generating image');
  }
});

app.get('/status', async (req, res) => {
  try {
    const status = await checkModelStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking model status:', error);
    res.status(500).send('Error checking model status');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

