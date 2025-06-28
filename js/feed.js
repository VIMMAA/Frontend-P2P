import {validateRightForm} from './validateRightForm.js';
import {ApiClient} from './requests/ApiClient.js';

document.addEventListener("DOMContentLoaded", initializePage);

const postModal = new bootstrap.Modal(document.getElementById("postModal"));
const addCriterionModal = new bootstrap.Modal(document.getElementById('addCriterionModal'));
const selectCriterionModal = new bootstrap.Modal(document.getElementById('selectCriterionModal'));

const leftPartForm = document.getElementById("leftPartForm");
const rightPartForm = document.getElementById("rightPartForm");
const leftPartModal = document.getElementById("leftPartModal");
const publishPostBtn = document.getElementById("publishPostBtn");
const closePostBtn = document.getElementById("closePostBtn");
const postTitle = document.getElementById("postTitle");
const postDescription = document.getElementById("postDescription");
const postFiles = document.getElementById("postFiles");
const postsContainer = document.getElementById("postsContainer");
const attachedFilesList = document.getElementById("attachedFilesList");
const attachFilesBtn = document.getElementById("attachFilesBtn");
const peerReviewToggle = document.getElementById("peerReviewToggle");
const reviewPackageSize = document.getElementById("reviewPackageSize");
const penaltyInput = document.getElementById("penaltyInput");
const deadlineInput = document.getElementById("deadlineInput");
const pointsInput = document.getElementById("pointsInput");
let attachedFiles = [];
let chosenCriteria = [];
let chosenPost

const saveBtn = document.getElementById('saveCriterionBtn');
const criteriaListEl = document.getElementById('criteriaList');

const api = new ApiClient();

let editingPost;


const userEmail = localStorage.getItem('userEmail');
const token = localStorage.getItem('jwtToken');

const authElements = document.querySelectorAll('.auth-only');
const guestElements = document.querySelectorAll('.guest-only');
const emailElement = document.getElementById('userEmail');

function updateNavbar() {
    if (token && userEmail) {
        authElements.forEach(el => el.classList.remove('d-none'));
        guestElements.forEach(el => el.classList.add('d-none'));
        emailElement.textContent = userEmail;
    } else {
        authElements.forEach(el => el.classList.add('d-none'));
        guestElements.forEach(el => el.classList.remove('d-none'));
    }
}

updateNavbar();

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', function (event) {
    event.preventDefault();
    const token = localStorage.getItem('jwtToken');

    api.fetchWithAuth(`/User/logout`, {
        method: 'POST',
        headers: {
            accept: '*/*',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(response => {
            if (response.ok) {
                console.log("Logout successful");
            } else {
                console.warn(`Logout error: ${response.status}`);
            }
        })
        .catch(error => {
            console.error("Logout error:", error);
        })
        .finally(handleLogout);
});

function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    updateNavbar();
    window.location.href = 'authorization.html';
}

async function loadCourseData() {
    const courseId = getCourseIdFromURL();

    try {
        const response = await api.fetchWithAuth(`/Course/${courseId}`, {
            method: 'GET',
        });

        if (!response.ok) new Error(`Ошибка загрузки курса: ${response.status}`);
        const course = await response.json();
        const tasks = course.tasks || [];

        tasks.forEach(task => {
            const taskTitle = task.name;
            const taskDescription = task.description;
            const author = task.authorId;
            const date = task.createTime;

            const newPost = renderPost(taskTitle, taskDescription, date, author);
            postsContainer.prepend(newPost);
        });
    } catch (error) {
        console.error("Ошибка при загрузке курса:", error);
    }
}


function getCourseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function renderTasks(course) {
    const tasksContainer = document.getElementById("tasksContainer");
    tasksContainer.innerHTML = "";

    course.tasks.forEach(task => {
        const taskEl = document.createElement("div");
        taskEl.className = "card mb-2";
        taskEl.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.name}</h5>
                <p class="card-text">Тема: ${task.topic}</p>
                <p class="text-muted">Создано: ${new Date(task.createTime).toLocaleString()}</p>
            </div>
        `;
        tasksContainer.appendChild(taskEl);
    });
}

validateRightForm(rightPartForm);

document.getElementById('addNewCriterion').addEventListener('click', (e) => {
    e.preventDefault();
    addCriterionModal.show();
});

document.getElementById('selectExistingCriteria').addEventListener('click', (e) => {
    e.preventDefault();
    renderExistingCriteria(criteriaListEl);
    selectCriterionModal.show();
});

document.getElementById('selectExistingCriteriaBtn').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#existingCriteriaList input[type=checkbox]:checked');
    const allCriteria = getSavedCriteria();

    checkboxes.forEach(cb => {
        const crit = allCriteria.find(criterion => criterion.id === cb.id);
        chosenCriteria.push(crit);
        createCriterionCard(crit, criteriaListEl);
    });

    selectCriterionModal.hide();
    document.getElementById('selectExistingCriteriaBtn').disabled = true;
});

saveBtn.addEventListener('click', () => {
    const id = crypto.randomUUID();
    const title = document.getElementById('criterionTitle').value.trim();
    const description = document.getElementById('criterionDescription').value.trim();
    const points = parseInt(document.getElementById('criterionPoints').value, 10);

    const criterion = {id, title, description, points};
    saveCriterionToStorage(criterion);
    createCriterionCard(criterion, criteriaListEl);
    chosenCriteria.push(criterion);

    ['criterionTitle', 'criterionDescription', 'criterionPoints'].forEach(id => {
        document.getElementById(id).value = '';
    });
    saveBtn.disabled = true;
    addCriterionModal.hide();
});

function validateCriterionForm() {
    const title = document.getElementById('criterionTitle').value.trim();
    const points = parseInt(document.getElementById('criterionPoints').value, 10);
    const validTitle = title.replace(/[^a-zA-Zа-яА-Я]/g, '').length >= 4;
    const validPoints = Number.isInteger(points) && points >= 1 && points <= 100;
    saveBtn.disabled = !(validTitle && validPoints);
}

['criterionTitle', 'criterionPoints'].forEach(id => {
    document.getElementById(id).addEventListener('input', validateCriterionForm,);
});

function clearModal() {
    leftPartForm.reset();
    rightPartForm.reset();

    attachedFilesList.innerHTML = "";
    criteriaListEl.innerHTML = "";
    attachedFiles = []
    chosenCriteria = []
}

function initializePage() {

    const courseId = getCourseIdFromURL();
    loadCourseData(courseId);

    postTitle.addEventListener("input", validateForm);
    postDescription.addEventListener("input", validateForm);

    postFiles.addEventListener("change", function () {
        const newFiles = Array.from(postFiles.files);
        attachedFiles = attachedFiles.concat(newFiles);

        renderAttachedFiles();
        validateForm();
    });

    attachFilesBtn.addEventListener("click", function () {
        postFiles.click();
    });

    document.querySelectorAll('.create-post-option').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault(); // чтобы не прыгал вверх при href="#"
            const value = this.dataset.value;
            if (value === "1") {
                editingPost = null;
                clearModal();
                validateForm();

                rightPartForm.style.display = '';
                rightPartForm.disabled = false;

                leftPartModal.classList.add('border-end');
                chosenPost = 1

                postModal.show();
            } else {
                editingPost = null;
                clearModal();
                validateForm();
                rightPartForm.style.display = 'none';
                rightPartForm.disabled = true;

                leftPartModal.classList.remove('border-end');
                chosenPost = 0

                postModal.show();
            }
        });
    });


    publishPostBtn.addEventListener("click", async function () {
        const now = new Date();
        const dateString = now.toLocaleDateString("ru-RU");

        const localDate = new Date(deadlineInput.value);

        let materialName
        let requestBody
        if(chosenPost) {
            materialName = 'materialWork'
            requestBody = {
                materialTaskWork: {
                    name: postTitle.value,
                    deadline: localDate.toISOString(),
                    check: "P2P",
                    description: postDescription.value,
                    penalty: parseInt(penaltyInput.value) || 0,
                    solutionsToCheckN: parseInt(reviewPackageSize.value) || 0,
                    isP2P: peerReviewToggle.checked
                },
                criteriaAssignments: chosenCriteria
            };
        }
        else {
            materialName = 'materialRead'
            requestBody = {
                name: postTitle.value,
                description: postDescription.value,
            };
        }

        try {

            const response = await api.fetchWithAuth(`/Task/${courseId}/${materialName}`, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Ошибка при отправке:", errorData);
                alert("Ошибка при отправке: " + errorData.message || response.statusText);
                return;
            }

            console.log("Успешно отправлено!");

            const responseData = await response.json();
            const newPost = renderPost(postTitle.value, postDescription.value, dateString, userEmail);
            newPost.setAttribute('id', `${responseData.id}`);

            postsContainer.prepend(newPost);
            postModal.hide();

        } catch (err) {
            console.error("Ошибка при публикации:", err);
            alert("Не удалось отправить данные.");
        }
    });

    closePostBtn.addEventListener("click", function () {
        clearModal()
        postModal.hide();
    })

    postsContainer.addEventListener("click", async function (e) {
        if (e.target.closest(".send-comment")) {
            const card = e.target.closest(".card");
            const input = card.querySelector(".comment-input");
            const commentText = input.value.trim();
            if (commentText !== "") {
                try {
                    // Отправка на сервер
                    const response = await api.fetchWithAuth(`/Comments/${card.id}/task`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` // или другой способ авторизации
                        },
                        body: JSON.stringify({text: commentText})
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка сервера: ${response.status}`);
                    }

                    const result = await response.json(); // { message: "Комментарий добавлен" }

                    incrementCommentCount(card);

                    // Отображение комментария в DOM
                    const now = new Date();
                    const time = now.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
                    const date = now.toLocaleDateString("ru-RU");

                    input.value = "";

                } catch (err) {
                    console.error("Не удалось отправить комментарий:", err);
                    alert("Ошибка при отправке комментария. Попробуйте позже.");
                }
            }
        }
    });
}

function renderPost(title, description, dateString, author, initialCommentCount = 0) {
    const newPost = document.createElement("div");
    const ending = getEndingOfTheWord(initialCommentCount);
    newPost.className = "card mb-3";
    newPost.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <h5 class="card-title">${title}</h5>
          <i class="bi bi-pencil-square edit-post" style="cursor:pointer"></i>
        </div>
        <p class="card-text">${description}</p>
        <p class="text-muted">Автор: ${author} | Дата: ${dateString}</p>
        <hr>
        <p class="comment-count text-secondary">${initialCommentCount} комментари${ending} под постом</p>
        <div class="input-group mt-2">
          <input type="text" class="form-control comment-input" placeholder="Введите комментарий...">
          <button class="btn btn-outline-secondary send-comment" type="button">
            <i class="bi bi-send"></i>
          </button>
        </div>
        <div class="comment-section mt-2"></div>
      </div>
    `;

    return newPost;
}

function getEndingOfTheWord(initialCommentCount) {
    if(initialCommentCount % 10 === 1 && initialCommentCount !== 11) return 'й'
    else if((initialCommentCount % 10 === 2 || initialCommentCount % 10 === 3 || initialCommentCount % 10 === 4)
        && initialCommentCount !== 12 && initialCommentCount !== 13 && initialCommentCount !== 14) return 'я'
    else return 'ев'
}

function incrementCommentCount(postElement) {
    const countEl = postElement.querySelector(".comment-count");
    if (countEl) {
        const match = countEl.textContent.match(/\d+/);
        if (match) {
            let count = parseInt(match[0], 10);
            count++;
            const ending = getEndingOfTheWord(count);
            countEl.textContent = `${count} комментари${ending} под постом`;
        }
    }
}


function getSavedCriteria() {
    return JSON.parse(localStorage.getItem('criteria')) || [];
}

function saveCriterionToStorage(criterion) {
    const criteria = getSavedCriteria();
    criteria.push(criterion);
    localStorage.setItem('criteria', JSON.stringify(criteria));
}

function createCriterionCard(criterion, criteriaListEl) {
    const card = document.createElement('div');
    card.className = 'card mb-2 p-2 d-flex justify-content-between align-items-center flex-row';
    card.setAttribute('data-id', criterion.id);
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

function getPointsName(points) {
    if (points % 10 === 1 && points !== 11) return 'балл';
    if ([2, 3, 4].includes(points % 10) && points !== 12 && points !== 13 && points !== 14) return 'балла';
    return 'баллов';
}

function renderExistingCriteria(criteriaListEl) {
    const list = document.getElementById('existingCriteriaList');
    list.innerHTML = '';
    let criteria = getSavedCriteria();

    criteria.forEach((crit, idx) => {
        const id = crit.id;
        const div = document.createElement('div');
        const pointsName = getPointsName(crit.points);

        div.className = 'card mb-2 p-2 d-flex justify-content-between align-items-center flex-row';
        div.innerHTML = `
        <div class="d-flex align-items-center">
            <input class="form-check-input" type="checkbox" value="${idx}" id="${id}" style="transform: scale(1.5);">
            <label class="form-check-label" for="${id}">
              <strong>${crit.title}</strong> (${crit.points} ${pointsName})<br>
              <small>${crit.description}</small>
            </label>
        </div>
        <button type="button" class="btn-close ms-3" aria-label="Удалить"></button>
      `;

        // Обработчик удаления
        div.querySelector('.btn-close').addEventListener('click', () => {
            criteria = criteria.filter(criterion => criterion.id !== crit.id)
            localStorage.setItem('criteria', JSON.stringify(criteria));
            div.remove();

            // Удаление из выбранного списка (по data-id)
            const selectedCard = criteriaListEl.querySelector(`[data-id="${crit.id}"]`);
            if (selectedCard) selectedCard.remove();
        });

        list.appendChild(div);
    });

    // Обработка выбора чекбоксов
    list.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', () => {
            const anyChecked = [...list.querySelectorAll('input[type=checkbox]')].some(i => i.checked);
            document.getElementById('selectExistingCriteriaBtn').disabled = !anyChecked;
        });
    });
}


function validateForm() {
    const titleValid = postTitle.value.trim().replace(/[^a-zA-Zа-яА-Я]/g, '').length >= 4;
    const descriptionValid = postDescription.value.length <= 1000;
    publishPostBtn.disabled = !(titleValid && descriptionValid);
}

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
            location.href = "userList.html";
        } else if (name === "Жалобы") {
            location.href = "appealList.html"
        }
    });
});

