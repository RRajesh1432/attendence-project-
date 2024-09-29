const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    student: String,
    name: String,
    father_name: String,
    date_of_birth: String,
    address: String,
    contact: String,
    course: String,
    branch: String,
    academic_year: String,
    photo: {
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
}, { collection: 'imgs' });

module.exports = mongoose.model('Student', studentSchema);
