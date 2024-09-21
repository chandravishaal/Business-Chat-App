const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const csvtojson = require('csvtojson');
const fs = require('fs'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = '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';

// Load Dataset
let dataset = [];

csvtojson()
  .fromFile('./dataset/data.csv')
  .then((jsonData) => {
    dataset = jsonData; // Store data for use in responses
    console.log('Dataset loaded successfully');
  })
  .catch((err) => {
    console.error("Error loading dataset:", err);
  });

// Route to handle chat queries
app.post('/api/get-insight', async (req, res) => {
  const { question } = req.body;

  // Log the incoming question
  console.log('Received question:', question);

  const summarizedData = JSON.stringify(dataset.slice(0, 10)); 

  try {
    console.log('Summarized Data:', summarizedData);

    // Ensure the URL matches Groq's API endpoint
    const response = await axios.post('https://api.groq.com/v1/completions', {
      prompt: `Based on this dataset: ${summarizedData}, please answer: ${question}`
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      }
    });

    console.log('Response from Groq:', response.data);
    res.json({ response: response.data.text });
  } catch (error) {
    console.error('Error fetching from LLM:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
