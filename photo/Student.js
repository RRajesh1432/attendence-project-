const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    student: String,
    name: String,
    father_name: String,
    date_of_birth: String,
    address: String,
    contact: String,
    COURSE: String,jklgg8uyo,yu6p8o0 y6l7oñūl 66l6 r
     BRANCH: String,
    Academic_Year: String,
    photos: {
        data: Buffer, // Store image data as a buffer
        contentType: String // Store image content type (e.g., 'image/jpeg', 'image/png')
    },
    attendance: [
        {
            date: String,
            inTime: String,
            outTime: String,
            status: String
        }
    ]
}, { collection: 'imgs' }); // Adjust collection name as needed

module.exports = mongoose.model('Student', studentSchema);
