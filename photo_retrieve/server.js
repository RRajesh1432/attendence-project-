const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/img').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Define schema
const studentSchema = new mongoose.Schema({
    student: String,
    name: String,
    father_name: String,
    date_of_birth: String,
    address: String,
    contact: String,
    COURSE: String,
    BRANCH: String,
    Academic_Year: String,
    photos: [{ data: Buffer, contentType: String }], // Define photos as an array
    attendance: [
        {
            date: String,
            inTime: String,
            outTime: String,
            status: String
        }
    ]
}, { collection: 'imgs' }); // Adjust collection name as needed

const Student = mongoose.model('imgs', studentSchema);

// Route to retrieve photos for a specific student by ID
app.get('/photos', async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const student = await Student.findOne({ student: studentId });

        if (!student) {
            return res.status(404).send('Student not found');
        }

        // Check if the student has photos
        if (!student.photos || student.photos.length === 0) {
            return res.status(404).send('No photos found for this student');
        }

        // Generate HTML to display photos
        let photosHTML = '<h2>Photos</h2>';
        student.photos.forEach(photo => {
            photosHTML += `<img src="data:${photo.contentType};base64,${photo.data.toString('base64')}"><br>`;
        });

        res.send(photosHTML);
    } catch (error) {
        console.error('Error retrieving photos:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start server
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
