const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const sharp = require('sharp');

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

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static('public'));

// Route to upload photo for a student
app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const student = await Student.findOne({ student: studentId });

    if (!student) {
      return res.status(404).send('Student not found');
    }

    // Resize image and decrease quality
    const photoBuffer = await sharp(req.file.buffer)
      .resize({ width: 300 }) // Adjust width as needed
      .jpeg({ quality: 50 }) // Adjust quality as needed
      .toBuffer();

    // Add the photo to the photos array of the student
    student.photos.push({ data: photoBuffer, contentType: req.file.mimetype });

    // Save the updated student document
    await student.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to fetch all students with photos
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find({ photos: { $exists: true, $not: { $size: 0 } } });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
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
