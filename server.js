const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 10000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Route to handle key generation
app.post('/generate-key', (req, res) => {
    const { key, expiration } = req.body;

    if (!key || !expiration) {
        return res.status(400).json({ message: 'Key and expiration are required' });
    }

    // Load the existing keys
    fs.readFile('keys.json', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading keys file' });
        }

        let keys = [];
        if (data.length > 0) {
            keys = JSON.parse(data);  // Parse the existing keys if any
        }

        // Add the new key to the keys array
        keys.push({ key, expiration });

        // Save the updated keys to the keys.json file
        fs.writeFile('keys.json', JSON.stringify(keys, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error saving keys file' });
            }
            res.status(200).json({ message: 'Key generated and stored successfully' });
        });
    });
});

// Route to handle key validation
app.post('/validate-key', (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.status(400).json({ message: 'Key is required' });
    }

    fs.readFile('keys.json', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading keys file' });
        }

        const keys = JSON.parse(data);
        const keyData = keys.find(k => k.key === key);

        if (!keyData) {
            return res.status(400).json({ message: 'Key not found' });
        }

        // Check if the key has expired
        const currentDate = new Date();
        const expirationDate = new Date(keyData.expiration);
        
        if (currentDate > expirationDate) {
            return res.status(400).json({ message: 'Key has expired' });
        }

        res.status(200).json({ message: 'Key is valid' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
