const attachedFiles = [
    { name: "report.pdf", url: "#" },
    { name: "code.zip", url: "#" }
];

const comments = [
    { author: "Преподаватель", text: "Хорошее решение!" },
    { author: "Иван Иванов", text: "Спасибо за проверку!" }
];

const grades = [
    { reviewer: "Анна Смирнова", score: 8 },
    { reviewer: "Пётр Козлов", score: 9 },
    { reviewer: "Сергей Лебедев", score: 7 }
];

function renderFiles() {
    const ul = document.getElementById("attachedFiles");
    ul.innerHTML = "";
    attachedFiles.forEach(file => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${file.url}" download>${file.name}</a>`;
        ul.appendChild(li);
    });
}

function renderComments() {
    const list = document.getElementById("commentsList");
    list.innerHTML = "";
    comments.forEach(c => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `<strong>${c.author}:</strong> ${c.text}`;
        list.appendChild(li);
    });
}

function addComment() {
    const input = document.getElementById("newComment");
    const text = input.value.trim();
    if (text !== "") {
        comments.push({ author: "Вы", text });
        input.value = "";
        renderComments();
    }
}

function renderGrades() {
    const container = document.getElementById("gradesList");
    container.innerHTML = "";
    let total = 0;

    grades.forEach(grade => {
        total += grade.score;
        const card = document.createElement("div");
        card.className = "card mb-2";
        card.innerHTML = `
        <div class="card-body">
          <h6 class="card-title">${grade.reviewer}</h6>
          <p class="card-text">Оценка: <strong>${grade.score}</strong></p>
        </div>`;
        container.appendChild(card);
    });

    const avg = grades.length > 0 ? (total / grades.length).toFixed(1) : "-";
    document.getElementById("averageGrade").textContent = avg;
}

function downloadAll() {
    alert("Файлы будут скачаны. (Функция заглушка)");
    // TODO реализовать zip скачивание
}

// Инициализация при открытии модального окна
document.getElementById('solutionModal').addEventListener('shown.bs.modal', () => {
    renderFiles();
    renderComments();
    renderGrades();
});