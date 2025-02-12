const express = require('express');
const fs = require('fs');

const app = express();
const port = 10000;

app.use(express.json());  // Middleware to parse JSON requests

// Save the provided key along with the expiry date
function saveKey(key, expiryDate) {
    let keys = [];

    // If keys file exists, load the current keys
    if (fs.existsSync('keys.json')) {
        keys = JSON.parse(fs.readFileSync('keys.json'));
    }

    // Add new key with expiry date
    keys.push({ key, expiryDate });
    
    // Write back to keys.json
    fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2));
    console.log(`Key ${key} saved with expiry date ${expiryDate}`);
}

// Route to generate a custom key with an expiry
app.post('/generate-key', (req, res) => {
    const { key, expiryDays } = req.body;

    if (!key || !expiryDays) {
        return res.status(400).json({ message: "Please provide a key and expiration days" });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    saveKey(key, expiryDate.toISOString());

    res.json({
        key: key,
        expiryDate: expiryDate.toISOString(),
        message: "Key generated successfully"
    });
});

// Route to validate if a key is valid and not expired
app.post('/validate-key', (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.status(400).json({ message: "Please provide a key to validate" });
    }

    const keys = fs.existsSync('keys.json') ? JSON.parse(fs.readFileSync('keys.json')) : [];

    const keyData = keys.find(k => k.key === key);
    
    if (!keyData) {
        return res.status(404).json({ message: "Invalid key" });
    }

    const currentDate = new Date();
    const expiryDate = new Date(keyData.expiryDate);

    if (currentDate > expiryDate) {
        return res.status(400).json({ message: "Key has expired" });
    }

    res.json({ message: "Key is valid" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
