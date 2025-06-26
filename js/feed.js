document.addEventListener("DOMContentLoaded", function () {
    const createPostOptions = document.querySelectorAll(".create-post-option");
    const postModal = new bootstrap.Modal(document.getElementById("postModal"));
    const postForm = document.getElementById("postForm");
    const publishPostBtn = document.getElementById("publishPostBtn");
    const closePostBtn = document.getElementById("closePostBtn");
    const postTitle = document.getElementById("postTitle");
    const postDescription = document.getElementById("postDescription");
    const postFiles = document.getElementById("postFiles");
    const postsContainer = document.getElementById("postsContainer");
    const postTypeInput = document.getElementById("postType");
    const attachedFilesList = document.getElementById("attachedFilesList");
    const attachFilesBtn = document.getElementById("attachFilesBtn");
    let attachedFiles = [];

    function validateForm() {
        const titleValid = postTitle.value.trim().replace(/[^a-zA-Zа-яА-Я]/g, '').length >= 4;
        const descriptionValid = postDescription.value.length <= 1000;
        publishPostBtn.disabled = !(titleValid && descriptionValid);
    }

    postTitle.addEventListener("input", validateForm);
    postDescription.addEventListener("input", validateForm);


    postFiles.addEventListener("change", function () {
        const newFiles = Array.from(postFiles.files);
        attachedFiles = attachedFiles.concat(newFiles);

        renderAttachedFiles();
        validateForm();
        postForm.reset();
    });

    attachFilesBtn.addEventListener("click", function () {
        postFiles.click();
    });


    function renderAttachedFiles() {
        attachedFilesList.innerHTML = "";
        attachedFiles.forEach((file, index) => {
            const fileItem = document.createElement("div");
            fileItem.className = "d-flex justify-content-between align-items-center border rounded p-2 mb-2";
            fileItem.innerHTML = `
            <span class="text-truncate" style="max-width: 85%;">${file.name}</span>
            <button type="button" class="btn-close ms-3" data-index="${index}"></button>
        `;
            attachedFilesList.appendChild(fileItem);
        });

        attachedFilesList.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.dataset.index, 10);
                attachedFiles.splice(index, 1);
                renderAttachedFiles();
                validateForm();
            });
        });
    }


    createPostOptions.forEach(option => {
        option.addEventListener("click", function () {
            editingPost = null;
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

    closePostBtn.addEventListener("click", function () {
        postForm.reset();
        postModal.hide();
    })

    postsContainer.addEventListener("click", function (e) {
        if (e.target.closest(".send-comment")) {
            const card = e.target.closest(".card");
            const input = card.querySelector(".comment-input");
            const commentText = input.value.trim();
            if (commentText !== "") {
                const now = new Date();
                const time = now.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
                const date = now.toLocaleDateString("ru-RU");
                const commentSection = card.querySelector(".comment-section");
                const comment = document.createElement("div");
                comment.className = "pt-2";
                comment.innerHTML = `<strong>Вы</strong> (${date} ${time}): ${commentText}`;
                commentSection.appendChild(comment);
                input.value = "";
            }
        }
    });
});

const saveBtn = document.getElementById('saveCriterionBtn');
const criteriaListEl = document.getElementById('criteriaList');

function getSavedCriteria() {
    return JSON.parse(localStorage.getItem('criteria')) || [];
}

function saveCriterionToStorage(criterion) {
    const criteria = getSavedCriteria();
    criteria.push(criterion);
    localStorage.setItem('criteria', JSON.stringify(criteria));
}

function createCriterionCard(criterion) {
    const card = document.createElement('div');
    card.className = 'card mb-2 p-2 d-flex justify-content-between align-items-center flex-row';
    card.innerHTML = `
  <div class="text-container me-2">
    <strong class="d-block text-truncate-custom">${criterion.title}</strong>
    <small>Баллы: ${criterion.points}</small>
  </div>
  <button type="button" class="btn-close ms-3" aria-label="Удалить"></button>
`;

    card.querySelector('.btn-close').addEventListener('click', () => card.remove());
    criteriaListEl.appendChild(card);
}

document.getElementById('addNewCriterion').addEventListener('click', (e) => {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById('addCriterionModal')).show();
});

document.getElementById('selectExistingCriteria').addEventListener('click', (e) => {
    e.preventDefault();
    renderExistingCriteria();
    new bootstrap.Modal(document.getElementById('selectCriterionModal')).show();
});

function renderExistingCriteria() {
    const list = document.getElementById('existingCriteriaList');
    list.innerHTML = '';
    const criteria = getSavedCriteria();

    criteria.forEach((crit, idx) => {
        const id = `existing-crit-${idx}`;
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${idx}" id="${id}">
        <label class="form-check-label" for="${id}">
          <strong>${crit.title}</strong> (${crit.points} баллов)<br>
          <small>${crit.description}</small>
        </label>
      `;
        list.appendChild(div);
    });

    list.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', () => {
            const anyChecked = [...list.querySelectorAll('input[type=checkbox]')].some(i => i.checked);
            document.getElementById('selectExistingCriteriaBtn').disabled = !anyChecked;
        });
    });
}

document.getElementById('selectExistingCriteriaBtn').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#existingCriteriaList input[type=checkbox]:checked');
    const allCriteria = getSavedCriteria();

    checkboxes.forEach(cb => {
        const crit = allCriteria[parseInt(cb.value)];
        createCriterionCard(crit);
    });

    bootstrap.Modal.getInstance(document.getElementById('selectCriterionModal')).hide();
    document.getElementById('selectExistingCriteriaBtn').disabled = true;
});

function validateCriterionForm() {
    const title = document.getElementById('criterionTitle').value.trim();
    const points = parseInt(document.getElementById('criterionPoints').value, 10);
    const validTitle = title.replace(/[^a-zA-Zа-яА-Я]/g, '').length >= 4;
    const validPoints = Number.isInteger(points) && points >= 1 && points <= 100;
    saveBtn.disabled = !(validTitle && validPoints);
}

['criterionTitle', 'criterionPoints'].forEach(id => {
    document.getElementById(id).addEventListener('input', validateCriterionForm);
});

saveBtn.addEventListener('click', () => {
    const title = document.getElementById('criterionTitle').value.trim();
    const description = document.getElementById('criterionDescription').value.trim();
    const points = parseInt(document.getElementById('criterionPoints').value, 10);

    const criterion = {title, description, points};
    saveCriterionToStorage(criterion);
    createCriterionCard(criterion);

    ['criterionTitle', 'criterionDescription', 'criterionPoints'].forEach(id => {
        document.getElementById(id).value = '';
    });
    saveBtn.disabled = true;
    bootstrap.Modal.getInstance(document.getElementById('addCriterionModal')).hide();
});

// P2P toggle enable/disable input
document.getElementById('peerReviewToggle').addEventListener('change', function () {
    document.getElementById('reviewPackageSize').disabled = !this.checked;
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
        editingPost.querySelector(".card-title").textContent = postTitle.value.trim();
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
            const time = now.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
            const date = now.toLocaleDateString("ru-RU");
            const commentSection = card.querySelector(".comment-section");
            const comment = document.createElement("div");
            comment.className = "pt-2";
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


