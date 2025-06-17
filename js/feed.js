document.addEventListener("DOMContentLoaded", function () {
    const createPostOptions = document.querySelectorAll(".create-post-option");
    const postModal = new bootstrap.Modal(document.getElementById("postModal"));
    const postForm = document.getElementById("postForm");
    const publishPostBtn = document.getElementById("publishPostBtn");
    const postTitle = document.getElementById("postTitle");
    const postDescription = document.getElementById("postDescription");
    const postFiles = document.getElementById("postFiles");
    const postsContainer = document.getElementById("postsContainer");
    const postTypeInput = document.getElementById("postType");

    function validateForm() {
        const titleValid = postTitle.value.length >= 4;
        const descriptionValid = postDescription.value.length <= 1000;
        const filesValid = postFiles.files.length <= 5;
        publishPostBtn.disabled = !(titleValid && descriptionValid && filesValid);
    }

    postTitle.addEventListener("input", validateForm);
    postDescription.addEventListener("input", validateForm);
    postFiles.addEventListener("change", validateForm);

    createPostOptions.forEach(option => {
        option.addEventListener("click", function () {
            postTypeInput.value = option.dataset.type;
            postForm.reset();
            validateForm();
            postModal.show();
        });
    });

    publishPostBtn.addEventListener("click", function () {
        const now = new Date();
        const dateString = now.toLocaleDateString("ru-RU");
        const newPost = document.createElement("div");
        newPost.className = "card mb-3";
        newPost.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <h5 class="card-title">${postTitle.value}</h5>
          <i class="bi bi-pencil-square edit-post" style="cursor:pointer"></i>
        </div>
        <p class="card-text">${postDescription.value}</p>
        <p class="text-muted">Автор: Вы | Дата: ${dateString}</p>
        <hr>
        <div class="input-group">
          <input type="text" class="form-control comment-input" placeholder="Введите комментарий...">
          <button class="btn btn-outline-secondary send-comment" type="button">
            <i class="bi bi-send"></i>
          </button>
        </div>
        <div class="comment-section mt-2"></div>
      </div>
    `;
        postsContainer.prepend(newPost);
        postModal.hide();
    });

    postsContainer.addEventListener("click", function (e) {
        if (e.target.closest(".send-comment")) {
            const card = e.target.closest(".card");
            const input = card.querySelector(".comment-input");
            const commentText = input.value.trim();
            if (commentText !== "") {
                const now = new Date();
                const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
                const date = now.toLocaleDateString("ru-RU");
                const commentSection = card.querySelector(".comment-section");
                const comment = document.createElement("div");
                comment.className = "border-top pt-2";
                comment.innerHTML = `<strong>Вы</strong> (${date} ${time}):<br>${commentText}`;
                commentSection.appendChild(comment);
                input.value = "";
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const createPostOptions = document.querySelectorAll(".create-post-option");
    const postModal = new bootstrap.Modal(document.getElementById("postModal"));
    const postForm = document.getElementById("postForm");
    const publishPostBtn = document.getElementById("publishPostBtn");
    const postTitle = document.getElementById("postTitle");
    const postDescription = document.getElementById("postDescription");
    const postFiles = document.getElementById("postFiles");
    const postsContainer = document.getElementById("postsContainer");
    const postTypeInput = document.getElementById("postType");

    let editingPost = null;

    function validateForm() {
        const titleValid = postTitle.value.length >= 4;
        const descriptionValid = postDescription.value.length <= 1000;
        const filesValid = postFiles.files.length <= 5;
        publishPostBtn.disabled = !(titleValid && descriptionValid && filesValid);
    }

    postTitle.addEventListener("input", validateForm);
    postDescription.addEventListener("input", validateForm);
    postFiles.addEventListener("change", validateForm);

    createPostOptions.forEach(option => {
        option.addEventListener("click", function () {
            editingPost = null;
            postTypeInput.value = option.dataset.type;
            postForm.reset();
            validateForm();
            postModal.show();
        });
    });

    function createPostCard(title, description, type, dateString, files) {
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.dataset.type = type;
        card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <h5 class="card-title">${title}</h5>
          <i class="bi bi-pencil-square edit-post" style="cursor:pointer"></i>
        </div>
        <p class="card-text">${description}</p>
        <p class="text-muted">Автор: Вы | Дата: ${dateString}</p>
        <hr>
        <div class="input-group">
          <input type="text" class="form-control comment-input" placeholder="Введите комментарий...">
          <button class="btn btn-outline-secondary send-comment" type="button">
            <i class="bi bi-send"></i>
          </button>
        </div>
        <div class="comment-section mt-2"></div>
      </div>
    `;
        return card;
    }

    publishPostBtn.addEventListener("click", function () {
        const now = new Date();
        const dateString = now.toLocaleDateString("ru-RU");
        const type = postTypeInput.value;
        if (editingPost) {
            editingPost.querySelector(".card-title").textContent = postTitle.value;
            editingPost.querySelector(".card-text").textContent = postDescription.value;
            editingPost = null;
        } else {
            const newCard = createPostCard(postTitle.value, postDescription.value, type, dateString);
            postsContainer.prepend(newCard);
        }
        postModal.hide();
    });

    postsContainer.addEventListener("click", function (e) {
        const editIcon = e.target.closest(".edit-post");
        const sendBtn = e.target.closest(".send-comment");
        const card = e.target.closest(".card");

        if (sendBtn) {
            const input = card.querySelector(".comment-input");
            const commentText = input.value.trim();
            if (commentText !== "") {
                const now = new Date();
                const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
                const date = now.toLocaleDateString("ru-RU");
                const commentSection = card.querySelector(".comment-section");
                const comment = document.createElement("div");
                comment.className = "border-top pt-2";
                comment.innerHTML = `<strong>Вы</strong> (${date} ${time}):<br>${commentText}`;
                commentSection.appendChild(comment);
                input.value = "";
            }
        }

        if (editIcon) {
            editingPost = card;
            const title = card.querySelector(".card-title").textContent;
            const description = card.querySelector(".card-text").textContent;
            postTitle.value = title;
            postDescription.value = description;
            postTypeInput.value = card.dataset.type;
            validateForm();
            postModal.show();
        }
    });

    // Переключение вкладок
    const navLinks = document.querySelectorAll("#feedTabs .nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
            const name = this.textContent.trim();
            if (name === "Задачи") {
                location.href = "feed.html";
            } else if (name === "Пользователи") {
                location.href = "users.html";
            } else if (name === "Оценки") {
                location.href = "grades.html";
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const createPostOptions = document.querySelectorAll(".create-post-option");
    const postModal = new bootstrap.Modal(document.getElementById("postModal"));
    const postForm = document.getElementById("postForm");
    const publishPostBtn = document.getElementById("publishPostBtn");
    const postTitle = document.getElementById("postTitle");
    const postDescription = document.getElementById("postDescription");
    const postFiles = document.getElementById("postFiles");
    const postsContainer = document.getElementById("postsContainer");
    const postTypeInput = document.getElementById("postType");
    const postViewModal = new bootstrap.Modal(document.getElementById("postViewModal"));
    const postViewTitle = document.getElementById("viewTitle");
    const postViewDescription = document.getElementById("viewDescription");
    const postViewAuthor = document.getElementById("viewAuthor");
    const postViewDate = document.getElementById("viewDate");
    const postViewTabs = document.getElementById("postViewTabs");
    const postViewTabContent = document.getElementById("postViewTabContent");

    let editingPost = null;
    let fileList = [];

    function validateForm() {
        const titleValid = postTitle.value.length >= 4;
        const descriptionValid = postDescription.value.length <= 1000;
        const filesValid = fileList.length <= 5;
        publishPostBtn.disabled = !(titleValid && descriptionValid && filesValid);
    }

    postTitle.addEventListener("input", validateForm);
    postDescription.addEventListener("input", validateForm);
    postFiles.addEventListener("change", function () {
        fileList = Array.from(postFiles.files).slice(0, 5);
        validateForm();
    });

    createPostOptions.forEach(option => {
        option.addEventListener("click", function () {
            editingPost = null;
            postTypeInput.value = option.dataset.type;
            postForm.reset();
            fileList = [];
            validateForm();
            postModal.show();
        });
    });

    function formatFiles(files) {
        if (!files || files.length === 0) return "";
        return files.map(f => `<div><a href="#">${f.name}</a></div>`).join("");
    }

    function createPostCard(title, description, type, dateString, files = []) {
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.dataset.type = type;
        card.dataset.title = title;
        card.dataset.description = description;
        card.dataset.date = dateString;
        card.dataset.files = JSON.stringify(files);
        card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <h5 class="card-title">${title}</h5>
          <i class="bi bi-pencil-square edit-post" style="cursor:pointer"></i>
        </div>
        <p class="card-text">${description}</p>
        ${formatFiles(files)}
        <p class="text-muted">Автор: Вы | Дата: ${dateString}</p>
        <hr>
        <div class="input-group">
          <input type="text" class="form-control comment-input" placeholder="Введите комментарий...">
          <button class="btn btn-outline-secondary send-comment" type="button">
            <i class="bi bi-send"></i>
          </button>
        </div>
        <div class="comment-section mt-2"></div>
      </div>
    `;

        card.addEventListener("click", function (e) {
            if (!e.target.classList.contains("edit-post") && !e.target.closest(".send-comment") && !e.target.closest(".comment-input")) {
                const title = card.dataset.title;
                const description = card.dataset.description;
                const files = JSON.parse(card.dataset.files || "[]");
                const dateString = card.dataset.date;
                postViewTitle.textContent = title;
                postViewDescription.textContent = description;
                postViewAuthor.textContent = "Вы";
                postViewDate.textContent = dateString;

                if (type === "Задание") {
                    postViewTabs.classList.remove("d-none");
                    postViewTabContent.innerHTML = `
            <div class="tab-pane fade show active" id="info-tab-pane">
              <h5>${title}</h5>
              <p>${description}</p>
              ${formatFiles(files)}
              <p class="text-muted">Автор: Вы | Дата: ${dateString}</p>
              <hr>
              <h6>Комментарии</h6>
              <div>...</div>
            </div>
            <div class="tab-pane fade" id="grades-tab-pane">
              <h6>Решения и оценки</h6>
              <table class="table">
                <thead><tr><th>Пользователь</th><th>Решение</th><th>Оценка</th></tr></thead>
                <tbody>
                  <tr><td>Иванов И.И.</td><td><a href="#">Файл.pdf</a></td><td>5</td></tr>
                  <tr><td>Петров П.П.</td><td><a href="#">Ответ.docx</a></td><td>4</td></tr>
                </tbody>
              </table>
            </div>
          `;
                } else {
                    postViewTabs.classList.add("d-none");
                    postViewTabContent.innerHTML = `<h5>${title}</h5><p>${description}</p>${formatFiles(files)}<p class="text-muted">Автор: Вы | Дата: ${dateString}</p><hr><h6>Комментарии</h6><div>...</div>`;
                }

                postViewModal.show();
            }
        });
        return card;
    }

    publishPostBtn.addEventListener("click", function () {
        const now = new Date();
        const dateString = now.toLocaleDateString("ru-RU");
        const type = postTypeInput.value;
        const title = postTitle.value;
        const description = postDescription.value;

        const files = fileList.map(f => ({ name: f.name }));

        if (editingPost) {
            editingPost.querySelector(".card-title").textContent = title;
            editingPost.querySelector(".card-text").textContent = description;
            editingPost.dataset.title = title;
            editingPost.dataset.description = description;
            editingPost.dataset.files = JSON.stringify(files);
            editingPost.dataset.type = type;
            editingPost = null;
        } else {
            const newCard = createPostCard(title, description, type, dateString, files);
            postsContainer.prepend(newCard);
        }
        postModal.hide();
    });

    postsContainer.addEventListener("click", function (e) {
        const editIcon = e.target.closest(".edit-post");
        const sendBtn = e.target.closest(".send-comment");
        const card = e.target.closest(".card");

        if (sendBtn) {
            const input = card.querySelector(".comment-input");
            const commentText = input.value.trim();
            if (commentText !== "") {
                const now = new Date();
                const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
                const date = now.toLocaleDateString("ru-RU");
                const commentSection = card.querySelector(".comment-section");
                const comment = document.createElement("div");
                comment.className = "border-top pt-2";
                comment.innerHTML = `<strong>Вы</strong> (${date} ${time}):<br>${commentText}`;
                commentSection.appendChild(comment);
                input.value = "";
            }
        }

        if (editIcon) {
            editingPost = card;
            postTitle.value = card.dataset.title;
            postDescription.value = card.dataset.description;
            postTypeInput.value = card.dataset.type;
            fileList = JSON.parse(card.dataset.files || "[]").map(f => ({ name: f.name }));
            validateForm();
            postModal.show();
        }
    });

    const navLinks = document.querySelectorAll("#feedTabs .nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
            const name = this.textContent.trim();
            if (name === "Задачи") {
                location.href = "feed.html";
            } else if (name === "Пользователи") {
                location.href = "users.html";
            } else if (name === "Оценки") {
                location.href = "grades.html";
            }
        });
    });
});
