let students = JSON.parse(localStorage.getItem("students")) || [];
let records = JSON.parse(localStorage.getItem("records")) || {};

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];

function addStudent() {
    const roll = document.getElementById("roll").value.trim();
    const name = document.getElementById("name").value.trim();

    if (!roll || !name) {
        alert("Please enter roll number and name");
        return;
    }

    if (students.some(s => s.roll === roll)) {
        alert("This roll number already exists");
        return;
    }

    students.push({ roll, name });
    localStorage.setItem("students", JSON.stringify(students));

    document.getElementById("roll").value = "";
    document.getElementById("name").value = "";

    displayStudents();
    updateDashboard();
}

function displayStudents() {
    const list = document.getElementById("studentList");
    list.innerHTML = "";

    students.forEach(student => {
        const row = document.createElement("tr");
        const saved = records[currentDate()]?.[student.roll];

        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>
                <select id="status-${student.roll}">
                    <option value="">Select</option>
                    <option value="Present" ${saved === "Present" ? "selected" : ""}>Present</option>
                    <option value="Absent" ${saved === "Absent" ? "selected" : ""}>Absent</option>
                </select>
            </td>
        `;
        list.appendChild(row);
    });
}

function currentDate() {
    return document.getElementById("date").value;
}

function saveAttendance() {
    const date = currentDate();

    if (!date) {
        alert("Please select a date");
        return;
    }

    if (students.length === 0) {
        alert("Please add students first");
        return;
    }

    const dailyRecord = {};

    for (const student of students) {
        const status = document.getElementById(
            `status-${student.roll}`
        ).value;

        if (!status) {
            alert("Please mark attendance for every student");
            return;
        }

        dailyRecord[student.roll] = status;
    }

    records[date] = dailyRecord;
    localStorage.setItem("records", JSON.stringify(records));

    alert("Attendance saved successfully!");
    updateDashboard();
    showReport();
}

function updateDashboard() {
    const date = currentDate();
    const daily = records[date] || {};

    document.getElementById("total").textContent = students.length;
    document.getElementById("present").textContent =
        students.filter(s => daily[s.roll] === "Present").length;
    document.getElementById("absent").textContent =
        students.filter(s => daily[s.roll] === "Absent").length;
}

function showReport() {
    const report = document.getElementById("report");
    report.innerHTML = "";

    students.forEach(student => {
        let presentDays = 0;
        let totalDays = 0;

        Object.values(records).forEach(day => {
            if (day[student.roll]) {
                totalDays++;
                if (day[student.roll] === "Present") {
                    presentDays++;
                }
            }
        });

        const percentage = totalDays === 0
            ? 0
            : (presentDays / totalDays * 100).toFixed(1);

        const row = document.createElement("tr");
        [student.roll, student.name, presentDays,
         totalDays, percentage + "%"].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        report.appendChild(row);
    });
}

document.getElementById("date").addEventListener("change", () => {
    displayStudents();
    updateDashboard();
});

displayStudents();
updateDashboard();
showReport();