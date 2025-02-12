const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle JSON bodies
app.use(express.json());

// Example in-memory key store (you could replace this with a DB later)
const keyStore = {};

// Endpoint to generate a key
app.post("/generate-key", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  // Simple key generation (you can use more sophisticated logic)
  const key = `key-${Math.random().toString(36).substring(2, 15)}`;
  keyStore[username] = key;
  res.status(200).json({ message: "Key generated", key });
});

// Endpoint to validate a key
app.post("/validate-key", (req, res) => {
  const { username, key } = req.body;
  if (keyStore[username] === key) {
    res.status(200).json({ message: "Key is valid" });
  } else {
    res.status(401).json({ error: "Invalid key" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
