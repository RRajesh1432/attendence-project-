document.addEventListener('DOMContentLoaded', function () {
    // Extract department from the URL query parameters
    const department = new URLSearchParams(window.location.search).get('department');

    // Function to calculate attendance percentage
    function calculateAttendancePercentage(attendance) {
        const totalDays = attendance.length;
        const presentDays = attendance.filter(entry => entry.status === 'present').length;
        return (presentDays / totalDays) * 100;
    }

    // Check if department is provided in the URL
    if (department) {
        // Fetch student details for the selected department with today's attendance using the new endpoint
        fetch(`/api/studentsByDepartmentWithAttendance?department=${encodeURIComponent(department)}`)
            .then(response => response.json())
            .then(data => {
                // Sort students based on attendance status: absent students first, then present students
                data.sort((a, b) => {
                    if (a.Attendence === 'Absent' && b.Attendence === 'Present') {
                        return -1;
                    } else if (a.Attendence === 'Present' && b.Attendence === 'Absent') {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                // Construct HTML to display student details with today's attendance and percentage
                let html = '<h2>Students Details with Today\'s Attendance</h2>';
                html += '<table>';
                html += '<tr><th>Student ID</th><th>Name</th><th>Father\'s Name</th><th>Contact Number</th><th>Branch</th><th>Attendance</th><th>Percentage</th></tr>';

                data.forEach(student => {
                    // Calculate the percentage using the provided function
                    const attendancePercentage = student.Percentage;

                    html += `<tr><td>${student.student}</td><td>${student.name}</td><td>${student.father_name}</td><td>${student.contact}</td><td>${student.BRANCH}</td><td>${student.Attendence}</td><td>${attendancePercentage.toFixed(2)}%</td></tr>`;
                });

                html += '</table>';

                // Display student details with today's attendance and percentage in the departmentDetails div
                document.getElementById('departmentDetails').innerHTML = html;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                document.getElementById('departmentDetails').innerHTML = `<p>Error fetching data</p>`;
            });
    } else {
        // If department is not provided in the URL, display an error message
        document.getElementById('departmentDetails').innerHTML = '<p>No department specified.</p>';
    }
});
