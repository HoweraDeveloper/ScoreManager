// 初始化學生列表與匯入/匯出資料
let students = [];

// 新增學生
document.getElementById("studentNameInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const name = e.target.value.trim();
        if (name) {
            students.push({ name, score: 0, history: [], notes: [] });
            renderStudentList();
            e.target.value = "";
        }
    }
});

// 渲染學生列表
function renderStudentList() {
    const studentList = document.getElementById("studentList");
    studentList.innerHTML = "";
    students.forEach((student, index) => {
        const studentDiv = document.createElement("div");
        studentDiv.className = "student-item list-group-item d-flex flex-column";

        // 每位學生的顯示內容，包括姓名、分數、加分/扣分框、操作按鈕與備註
        studentDiv.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <span class="me-3">${student.name}：${student.score} 分</span>
                <input type="number" class="score-input me-2" placeholder="加/扣分，按 Enter 送出">
                <button class="btn btn-outline-secondary me-2" onclick="resetScore(${index})">歸零</button>
                <button class="btn btn-outline-warning me-2" onclick="undoAction(${index})">撤銷</button>
                <button class="btn btn-outline-info me-2" onclick="addNotePrompt(${index})">備註</button>
                <button class="btn btn-outline-danger" onclick="removeStudent(${index})">刪除</button>
            </div>
            <div class="note mt-1">${student.notes.map(note => `• ${note}`).join("<br>")}</div>
        `;

        // 綁定 Enter 鍵調整分數
        studentDiv.querySelector(".score-input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                adjustScore(index, parseInt(e.target.value) || 0);
                e.target.value = "";
            }
        });

        studentList.appendChild(studentDiv);
    });
}

// 調整分數並顯示彈窗
function adjustScore(index, change) {
    students[index].score += change;
    students[index].history.push(change);
    renderStudentList();
    showAlert(students[index].name, change);
}

// 使用 Bootstrap Alert 顯示加/扣分訊息
function showAlert(name, change) {
    const alertContainer = document.getElementById("alertsContainer");
    const alertType = change > 0 ? "success" : "danger";
    const alertMessage = `葛萊分多 ${name} 學員${change > 0 ? '加' : '扣'} ${Math.abs(change)} 分！`;
    
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${alertType} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${alertMessage}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.classList.remove("show");
        alertDiv.remove();
    }, 2000);
}

// 歸零分數
function resetScore(index) {
    students[index].score = 0;
    renderStudentList();
}

// 撤銷上一次操作
function undoAction(index) {
    if (students[index].history.length > 0) {
        const lastChange = students[index].history.pop();
        students[index].score -= lastChange;
        renderStudentList();
    }
}

// 新增備註
function addNotePrompt(index) {
    const note = prompt("輸入備註：");
    if (note) {
        students[index].notes.push(note);
        renderStudentList();
    } else {
        if (confirm(`你真的要刪除 ${students[index].name} 的所有紀錄嗎？`)) {
            students[index].notes = []
            renderStudentList();
        }
    }
}

// 刪除學生
function removeStudent(index) {
    students.splice(index, 1);
    renderStudentList();
}

// 匯出資料
document.getElementById("exportBtn").addEventListener("click", () => {
    const data = JSON.stringify(students, null, 2);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_data.txt";
    a.click();
    URL.revokeObjectURL(url);
});

// 匯入資料
document.getElementById("importBtn").addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedStudents = JSON.parse(e.target.result);
                importedStudents.forEach(imported => {
                    const student = students.find(s => s.name === imported.name);
                    if (student) {
                        student.score = imported.score;
                        student.notes = imported.notes;
                    } else {
                        students.push(imported);
                    }
                });
                renderStudentList();
            } catch (error) {
                alert("匯入錯誤，檔案格式不正確！");
            }
        };
        reader.readAsText(file);
    }
});
