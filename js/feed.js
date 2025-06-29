import {validateRightForm} from './validateRightForm.js';
import {ApiClient} from './requests/ApiClient.js';
import {formatDate, getPostType} from "./auxFunctions.js";
import {TaskSolution} from "./solution.js";

document.addEventListener("DOMContentLoaded", initializePage);

const postModal = new bootstrap.Modal(document.getElementById("postModal"));
const solutionModal = new bootstrap.Modal(document.getElementById("solutionModal"));


const postModalLabel = document.getElementById("postModalLabel");
const addCriterionModal = new bootstrap.Modal(document.getElementById('addCriterionModal'));
//const selectCriterionModal = new bootstrap.Modal(document.getElementById('selectCriterionModal'));
const modalFooter = document.querySelector(".modal-footer");

const leftPartForm = document.getElementById("leftPartForm");
const rightPartForm = document.getElementById("rightPartForm");
const leftPartModal = document.getElementById("leftPartModal");
const publishPostBtn = document.getElementById("publishPostBtn");
const deletePostBtn = document.getElementById("deletePostBtn");
const closePostBtn = document.getElementById("closePostBtn");
let postTitle = document.getElementById("postTitle");
let postDescription = document.getElementById("postDescription");
const postFiles = document.getElementById("postFiles");
const postsContainer = document.getElementById("postsContainer");
const attachedFilesList = document.getElementById("attachedFilesList");
const attachFilesBtn = document.getElementById("attachFilesBtn");
let peerReviewToggle = document.getElementById("peerReviewToggle");
let reviewPackageSize = document.getElementById("reviewPackageSize");
let penaltyInput = document.getElementById("penaltyInput");
let deadlineInput = document.getElementById("deadlineInput");
let pointsInput = document.getElementById("pointsInput");
let attachedFiles = [];
let chosenCriteria = [];
let postType
let editMode = false;
let prevEditMode = true;
let currentPostId
let userRole

const saveBtn = document.getElementById('saveCriterionBtn');
const criteriaListEl = document.getElementById('criteriaList');

const api = new ApiClient();

let editingPost;
let courseId = getCourseIdFromURL()
localStorage.setItem("courseId", courseId);

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

            const newPost = renderPost(taskTitle, taskDescription, date, author, 0, task.id);
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

validateRightForm(rightPartForm);

document.getElementById('addNewCriterion').addEventListener('click', (e) => {
    e.preventDefault();
    addCriterionModal.show();
});

// document.getElementById('selectExistingCriteria').addEventListener('click', (e) => {
//     e.preventDefault();
//     renderExistingCriteria(criteriaListEl);
//     selectCriterionModal.show();
// });

// document.getElementById('selectExistingCriteriaBtn').addEventListener('click', () => {
//     const checkboxes = document.querySelectorAll('#existingCriteriaList input[type=checkbox]:checked');
//     const allCriteria = getSavedCriteria();
//
//     checkboxes.forEach(cb => {
//         const crit = allCriteria.find(criterion => criterion.id === cb.id);
//         chosenCriteria.push(crit);
//         createCriterionCard(crit, criteriaListEl);
//     });
//
//     selectCriterionModal.hide();
//     document.getElementById('selectExistingCriteriaBtn').disabled = true;
// });

saveBtn.addEventListener('click', () => {
    const title = document.getElementById('criterionTitle').value.trim();
    const conditions = document.getElementById('criterionDescription').value.trim();
    const countScore = parseInt(document.getElementById('criterionPoints').value, 10);

    const criterion = {title, conditions, countScore};
    //saveCriterionToStorage(criterion);
    createCriterionCard(criterion);
    chosenCriteria.push(criterion);

    ['criterionTitle', 'criterionDescription', 'criterionPoints'].forEach(id => {
        document.getElementById(id).value = '';
    });
    saveBtn.disabled = true;

    const currentValue = parseInt(pointsInput.value, 10) || 0;
    pointsInput.value = currentValue + criterion.countScore;

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


function setListenerToPublishPostButton() {

    if(prevEditMode !== editMode) {
        if (editMode) {
            publishPostBtn.textContent = "Сохранить";
            postModalLabel.textContent = "Редактировать пост"
            deletePostBtn.style.display = '';
            deletePostBtn.disabled = false;

            publishPostBtn.removeEventListener('click', publishPost);
            publishPostBtn.addEventListener("click", savePost)
        } else {
            publishPostBtn.textContent = "Опубликовать";
            postModalLabel.textContent = "Создать пост"
            deletePostBtn.style.display = 'none';
            deletePostBtn.disabled = true;

            publishPostBtn.removeEventListener('click', savePost);
            publishPostBtn.addEventListener("click", publishPost)
        }
    }
}

async function getMaterialName(id) {
    const postType = await getPostType(api, id);
    if (postType) return "materialWork"
    else return "materialRead"
}

async function deletePost(id) {
    let materialName = await getMaterialName(id)

    const elementToRemove = postsContainer.querySelector(`#${CSS.escape(id)}`);
    postsContainer.removeChild(elementToRemove);

    const response = await api.fetchWithAuth(`/Task/${id}/${materialName}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка при отправке:", errorData);
        alert("Ошибка при отправке: " + errorData.message || response.statusText);
        return;
    }

    console.log("Успешно отправлено!");

    postModal.hide()
}

async function savePost() {
    const id = currentPostId
    const courseId = getCourseIdFromURL();

    const now = new Date();
    const dateString = now.toLocaleDateString("ru-RU");

    const localDate = new Date(deadlineInput.value);
    if((deadlineInput.value === "" || localDate <= now) && postType) {
        alert("Установите валидный дедлайн проверки")
        return;
    }

    let requestBody
    if (postType) {
        requestBody = {
            materialWorkEdit: {
                name: postTitle.value,
                deadline: localDate.toISOString(),
                description: postDescription.value,
                penalty: parseInt(penaltyInput.value) || undefined,
                solutionsToCheckN: parseInt(reviewPackageSize.value) || undefined,
                isP2P: peerReviewToggle.checked
            },
            criteriaAssignments: chosenCriteria,
            files: attachedFiles
        };
    } else {
        requestBody = {
            materialReadCreate: {
                name: postTitle.value,
                description: postDescription.value,
            },
            files: attachedFiles
        };
    }

    try {
        let materialName = await getMaterialName(id);

        const response = await api.fetchWithAuth(`/Task/${courseId}/${materialName}/${id}`, {
            method: 'PUT',
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
        const newPost = renderPost(postTitle.value, postDescription.value, dateString, userEmail, 0, responseData.id);
        //TODO внести изменения в карточку поста

        postModal.hide();

    } catch (err) {
        console.error("Ошибка при публикации:", err);
        alert("Не удалось отправить данные.");
    }
}

async function publishPost() {
    const now = new Date();
    const dateString = now.toLocaleDateString("ru-RU");

    const localDate = new Date(deadlineInput.value);
    if((deadlineInput.value === "" || localDate <= now) && postType) {
        alert("Установите валидный дедлайн проверки")
        return;
    }

    const courseId = getCourseIdFromURL();

    let materialName
    let requestBody
    if (postType) {
        materialName = 'materialWork'
        requestBody = {
            materialTaskWork: {
                name: postTitle.value,
                deadline: localDate.toISOString(),
                description: postDescription.value,
                penalty: parseInt(penaltyInput.value) || undefined,
                solutionsToCheckN: parseInt(reviewPackageSize.value) || undefined,
                isP2P: peerReviewToggle.checked
            },
            criteriaAssignments: chosenCriteria,
            files: attachedFiles
        };
    } else {
        materialName = 'materialRead'
        requestBody = {
            materialReadCreate: {
                name: postTitle.value,
                description: postDescription.value,
            },
            files: attachedFiles
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
        const newPost = renderPost(postTitle.value, postDescription.value, dateString, userEmail, 0, responseData.id);

        postsContainer.prepend(newPost);
        postModal.hide();

    } catch (err) {
        console.error("Ошибка при публикации:", err);
        alert("Не удалось отправить данные.");
    }

}

async function initializePage() {

    //const courseId = getCourseIdFromURL();

    const response = await api.fetchWithAuth(`/Course/${courseId}/Role`)
    if(!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
    }
    else userRole = await response.json();

    loadCourseData(courseId);

    postTitle.addEventListener("input", validateForm);
    postDescription.addEventListener("input", validateForm);

    postFiles.addEventListener("change", async function () {
        const newFiles = Array.from(postFiles.files);

        const base64Files = await Promise.all(
            newFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({
                            name: file.name,
                            data: reader.result.split(",")[1] // Обрезаем "data:*/*;base64,"
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            })
        );

        // Добавляем в основной массив
        attachedFiles = attachedFiles.concat(base64Files);

        renderAttachedFiles();
        validateForm();
    });

    attachFilesBtn.addEventListener("click", function () {
        postFiles.click();
    });

    document.querySelectorAll('.create-post-option').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault(); // чтобы не прыгал вверх при href="#"
            prevEditMode = editMode
            editMode = false;
            setListenerToPublishPostButton();
            const value = this.dataset.value;

            if (value === "1") {
                editingPost = null;
                clearModal();
                validateForm();
                showRightPartModal()

                postType = 1

                postModal.show();
            } else {
                editingPost = null;
                clearModal();
                validateForm();
                hideRightPartModal()

                postModal.show();
            }
        });
    });

    setListenerToPublishPostButton();

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

function hideRightPartModal() {
    rightPartForm.style.display = 'none';
    rightPartForm.disabled = true;

    leftPartModal.classList.remove('border-end');
    postType = 0
}

function showRightPartModal() {
    rightPartForm.style.display = '';
    rightPartForm.disabled = false;

    leftPartModal.classList.add('border-end');
}

deletePostBtn.addEventListener("click", () => deletePost(currentPostId))

function renderPost(title, description, dateString, author, initialCommentCount = 0, id) {
    const newPost = document.createElement("div");
    newPost.setAttribute('id', `${id}`);

    const ending = getEndingOfTheWord(initialCommentCount);
    newPost.className = "card mb-3";
    newPost.innerHTML = `
      <div class="card-body">
        <div>
        <div class="d-flex justify-content-between">
          <h5 class="card-title">${title}</h5>
          <button class="bi bi-pencil-square edit-post btn"></button>
        </div>
        <p class="text-muted">Автор: ${author} | Дата: ${dateString}</p>
        </div>
      </div>
    `;

    const editBtn = newPost.children[0].children[0].children[0].children[1]
    if (userRole === "Student"){
        editBtn.style.display = 'none';
    }
    editBtn.addEventListener("click", async function () {

        if (await getPostType(api, id)) {
            showRightPartModal()
            postType = 1
        } else {
            hideRightPartModal()
            postType = 0
        }
        prevEditMode = editMode
        editMode = true
        setListenerToPublishPostButton()
        let materialName = await getMaterialName(id);

        const response = await api.fetchWithAuth(`/Task/${id}/${materialName}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Ошибка при отправке:", errorData);
            alert("Ошибка при отправке: " + errorData.message || response.statusText);
            return;
        }

        console.log("Успешно отправлено!");

        const responseData = await response.json();

        currentPostId = responseData.id;
        fillModal(responseData);

        postModal.show();

    })

    const cardArea = newPost.children[0].children[0]
    cardArea.addEventListener("click", async function (e) {
        if (userRole === "Student") {
            const taskModal = new TaskSolution(id)
            solutionModal.show()
            await taskModal.initModalHandlers("solutionModal")
        } else {
            postModal.show();
        }
    })

    return newPost;
}

function fillModal(post) {
    postTitle.value = post.name
    postDescription.value = post.description
    attachedFiles = post.attachedFiles
    renderAttachedFiles()
    peerReviewToggle.checked = post.check === 'P2P'
    reviewPackageSize.value = post.solutionsToCheckN !== undefined ? post.solutionsToCheckN : ""
    penaltyInput.value = post.penalty !== undefined ? post.penalty : ""
    deadlineInput.value = post.deadline !== undefined ? formatDate(post.deadline) : ""
    pointsInput.value = post.score !== undefined ? post.score : 0
    chosenCriteria = post.criteriaAssignments
    chosenCriteria.forEach((criteria) => {createCriterionCard(criteria)})
}

function getEndingOfTheWord(initialCommentCount) {
    if (initialCommentCount % 10 === 1 && initialCommentCount !== 11) return 'й'
    else if ((initialCommentCount % 10 === 2 || initialCommentCount % 10 === 3 || initialCommentCount % 10 === 4)
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

// function saveCriterionToStorage(criterion) {
//     const criteria = getSavedCriteria();
//     criteria.push(criterion);
//     localStorage.setItem('criteria', JSON.stringify(criteria));
// }

function createCriterionCard(criterion) {
    const card = document.createElement('div');
    card.className = 'card mb-2 p-2 d-flex justify-content-between align-items-center flex-row';
    card.innerHTML = `
  <div class="text-container me-2">
    <strong class="d-block text-truncate-custom">${criterion.title}</strong>
    <small>Баллы: ${criterion.countScore}</small>
  </div>
  <button type="button" class="btn-close ms-3" aria-label="Удалить"></button>
`;

    card.querySelector('.btn-close').addEventListener('click', () => {
        card.remove()
        const currentValue = parseInt(pointsInput.value, 10) || 0;
        pointsInput.value = currentValue - criterion.countScore;
    });
    criteriaListEl.appendChild(card);
}

// function getPointsName(points) {
//     if (points % 10 === 1 && points !== 11) return 'балл';
//     if ([2, 3, 4].includes(points % 10) && points !== 12 && points !== 13 && points !== 14) return 'балла';
//     return 'баллов';
// }

// function renderExistingCriteria(criteriaListEl) {
//     const list = document.getElementById('existingCriteriaList');
//     list.innerHTML = '';
//     let criteria = getSavedCriteria();
//
//     criteria.forEach((crit, idx) => {
//         const id = crit.id;
//         const div = document.createElement('div');
//         const pointsName = getPointsName(crit.points);
//
//         div.className = 'card mb-2 p-2 d-flex justify-content-between align-items-center flex-row';
//         div.innerHTML = `
//         <div class="d-flex align-items-center">
//             <input class="form-check-input" type="checkbox" value="${idx}" id="${id}" style="transform: scale(1.5);">
//             <label class="form-check-label" for="${id}">
//               <strong>${crit.title}</strong> (${crit.points} ${pointsName})<br>
//               <small>${crit.description}</small>
//             </label>
//         </div>
//         <button type="button" class="btn-close ms-3" aria-label="Удалить"></button>
//       `;
//
//         // Обработчик удаления
//         div.querySelector('.btn-close').addEventListener('click', () => {
//             criteria = criteria.filter(criterion => criterion.id !== crit.id)
//             localStorage.setItem('criteria', JSON.stringify(criteria));
//             div.remove();
//
//             // Удаление из выбранного списка (по data-id)
//             const selectedCard = criteriaListEl.querySelector(`[data-id="${crit.id}"]`);
//             if (selectedCard) selectedCard.remove();
//         });
//
//         list.appendChild(div);
//     });
//
//     // Обработка выбора чекбоксов
//     list.querySelectorAll('input[type=checkbox]').forEach(cb => {
//         cb.addEventListener('change', () => {
//             const anyChecked = [...list.querySelectorAll('input[type=checkbox]')].some(i => i.checked);
//             document.getElementById('selectExistingCriteriaBtn').disabled = !anyChecked;
//         });
//     });
// }


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

