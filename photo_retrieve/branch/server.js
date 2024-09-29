const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect('mongodb://localhost:27017/img');

const studentSchema = new mongoose.Schema({
    student: String,
    name: String,
    father_name: String,
    date_of_birth: String,
    address: String,
    contact: String,
    COURSE: String,
    BRANCH: String,
    Attendence: String,
    Academic_Year: String,
    photos: [{ 
        contentType: String,
        data: Buffer
    }],
    attendance: [{
        date: String,
        status: String,
    }]
}, { collection: 'imgs' });

const Student = mongoose.model('Student', studentSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch department-wise attendance stats
app.get('/students', async (req, res) => {
    try {
        const academicYear = req.query.academicYear;
        const department = req.query.department;

        let query = {};

        if (academicYear !== 'all') {
            query.Academic_Year = academicYear;
        }

        if (department !== 'all') {
            query.BRANCH = department;
        }

        const todayDate = new Date().toISOString().slice(0, 10);

        const attendanceStats = await Student.aggregate([
            { $match: query },
            { $unwind: '$attendance' },
            { $match: { 'attendance.date': todayDate } },
            {
                $group: {
                    _id: '$BRANCH',
                    presents: { $sum: { $cond: [{ $eq: ['$attendance.status', 'present'] }, 1, 0] } },
                    absents: { $sum: { $cond: [{ $eq: ['$attendance.status', 'absent'] }, 1, 0] } }
                }
            }
        ]);

        const result = {};
        attendanceStats.forEach(entry => {
            result[entry._id] = { presents: entry.presents, absents: entry.absents };
        });

        res.json(result);
    } catch (err) {
        console.error('Error fetching attendance data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to fetch individual student details by department
app.get('/api/student/:department', async (req, res) => {
    try {
        const department = req.params.department;
        const students = await Student.find({ BRANCH: department });

        if (!students || students.length === 0) {
            return res.status(404).json({ error: 'No students found for the department' });
        }

        res.json(students);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Default route to serve the departmentDetails.html page
app.get('/departmentDetails.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'departmentDetails.html'));
});

// API endpoint to fetch individual student details by ID
app.get('/api/student/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findOne({ student: studentId });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// API endpoint to fetch student details by department
app.get('/api/studentsByDepartment', async (req, res) => {
    try {
        const department = req.query.department;

        if (!department) {
            return res.status(400).json({ error: 'Department parameter is missing' });
        }

        const students = await Student.find({ BRANCH: department });

        if (!students || students.length === 0) {
            return res.status(404).json({ error: 'No students found for the department' });
        }

        res.json(students);
    } catch (error) {
        console.error('Error fetching student details by department:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define API endpoint to fetch student details by department with today's attendance and percentage
app.get('/api/studentsByDepartmentWithAttendance', async (req, res) => {
    try {
        const department = req.query.department;

        if (!department) {
            return res.status(400).json({ error: 'Department parameter is missing' });
        }

        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Find students for the provided department
        const students = await Student.find({ BRANCH: department });

        if (!students || students.length === 0) {
            return res.status(404).json({ error: 'No students found for the department' });
        }

        // Prepare student details with today's attendance and percentage
        const studentsWithAttendance = students.map(student => {
            const todayAttendance = student.attendance.find(entry => entry.date === today);
            const attendanceStatus = todayAttendance ? todayAttendance.status : 'Absent';
            
            // Calculate attendance percentage
            const totalDays = student.attendance.length;
            const presentDays = student.attendance.filter(entry => entry.status === 'present').length;
            const percentage = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;

            return {
                student: student.student,
                name: student.name,
                BRANCH: student.BRANCH,
                father_name: student.father_name,
                contact: student.contact,
                Attendence: attendanceStatus,
                Percentage: percentage
            };
        });

        res.json(studentsWithAttendance);
    } catch (error) {
        console.error('Error fetching student details by department with attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Default route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
