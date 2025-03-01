const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Add CORS support

const app = express();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors()); // Enable CORS for all routes

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to receive the photo
app.post('/upload', (req, res) => {
    const photo = req.body.photo; // Base64-encoded photo
    if (!photo) {
        return res.status(400).json({ error: 'No photo received.' });
    }

    // Validate the photo is a valid image
    if (!photo.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    // Convert Base64 to a file
    const base64Data = photo.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save the photo to a file
    const fileName = `photo_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, 'uploads', fileName);

    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving photo:', err);
            return res.status(500).json({ error: 'Failed to save photo.' });
        }

        console.log('Photo saved:', fileName);
        res.status(200).json({ message: 'Photo received and saved!', fileName });
    });
});

// Create the "uploads" folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});