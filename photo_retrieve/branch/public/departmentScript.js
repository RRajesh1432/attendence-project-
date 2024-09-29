document.addEventListener('DOMContentLoaded', function () {
    // Extract department from the URL query parameters
    const department = new URLSearchParams(window.location.search).get('department');

    // Check if department is provided in the URL
    if (department) {
        // Fetch student details for the selected department using the new endpoint
        fetch(`/api/studentsByDepartment?department=${encodeURIComponent(department)}`)
            .then(response => response.json())
            .then(data => {
                // Construct HTML to display student details
                let html = '<h2>Students Details</h2>';
                html += '<table>';
                html += '<tr><th>Student ID</th><th>Name</th><th>Branch</th><th>Attendance</th></tr>';

                data.forEach(student => {
                    html += `<tr><td>${student.student}</td><td>${student.name}</td><td>${student.BRANCH}</td><td>${student.Attendence}</td></tr>`;
                });

                html += '</table>';

                // Display student details in the departmentDetails div
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
