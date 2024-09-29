const express = require('express');
const app = express();
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Student = require('./Student'); // Assuming your model is defined in studentModel.js

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/img')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Handle POST request to /upload endpoint
app.post('/upload', upload.single('photo'), (req, res) => {
    // Handle file upload logic here
    const photoPath = req.file.path;

    // Read the photo file
    fs.readFile(photoPath, (err, data) => {
        if (err) {
            // Error handling if unable to read photo file
            return res.status(500).send('Error reading photo file');
        }

        // Save photo data to MongoDB or perform any desired actions
        // For example, you can save the data to a student document:
        const newStudent = new Student({
            photo: {
                data: data,
                contentType: req.file.mimetype
            }
        });

        newStudent.save((err, savedStudent) => {
            if (err) {
                // Error handling if unable to save student document
                return res.status(500).send('Error saving student document');
            }

            // Delete the temporary photo file
            fs.unlinkSync(photoPath);

            // Respond with success message or redirect
            res.send('File uploaded and saved successfully');
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
