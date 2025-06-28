document.addEventListener("DOMContentLoaded", function () {
    const postModal = new bootstrap.Modal(document.getElementById("postModal"));
    const postForm = document.getElementById("postForm");
    const modalRow = document.getElementById("modalRow");
    const leftPartModal = document.getElementById("leftPartModal");
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

    document.querySelectorAll('.create-post-option').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault(); // чтобы не прыгал вверх при href="#"
            const value = this.dataset.value;
            if (value === "1") {
                editingPost = null;
                postForm.reset();
                validateForm();
                if (modalRow.children.length === 1) generateRightPartModal();
                leftPartModal.classList.add('border-end');

                const saveBtn = document.getElementById('saveCriterionBtn');
                const criteriaListEl = document.getElementById('criteriaList');

                document.getElementById('addNewCriterion').addEventListener('click', (e) => {
                    e.preventDefault();
                    new bootstrap.Modal(document.getElementById('addCriterionModal')).show();
                });

                document.getElementById('selectExistingCriteria').addEventListener('click', (e) => {
                    e.preventDefault();
                    renderExistingCriteria();
                    new bootstrap.Modal(document.getElementById('selectCriterionModal')).show();
                });

                document.getElementById('selectExistingCriteriaBtn').addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('#existingCriteriaList input[type=checkbox]:checked');
                    const allCriteria = getSavedCriteria();

                    checkboxes.forEach(cb => {
                        const crit = allCriteria[parseInt(cb.value)];
                        createCriterionCard(crit, criteriaListEl);
                    });

                    bootstrap.Modal.getInstance(document.getElementById('selectCriterionModal')).hide();
                    document.getElementById('selectExistingCriteriaBtn').disabled = true;
                });

                saveBtn.addEventListener('click', () => {
                    const title = document.getElementById('criterionTitle').value.trim();
                    const description = document.getElementById('criterionDescription').value.trim();
                    const points = parseInt(document.getElementById('criterionPoints').value, 10);

                    const criterion = {title, description, points};
                    saveCriterionToStorage(criterion);
                    createCriterionCard(criterion, criteriaListEl);

                    ['criterionTitle', 'criterionDescription', 'criterionPoints'].forEach(id => {
                        document.getElementById(id).value = '';
                    });
                    saveBtn.disabled = true;
                    bootstrap.Modal.getInstance(document.getElementById('addCriterionModal')).hide();
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

                postModal.show();
            } else {
                editingPost = null;
                postForm.reset();
                validateForm();
                if(modalRow.children.length > 1) modalRow.children[1].remove();
                leftPartModal.classList.remove('border-end');

                postModal.show();
            }
        });
    });

    function generateRightPartModal() {
        const rightPart = document.createElement('div');
        rightPart.className = 'col-md-3 ps-md-4';
        rightPart.id = 'rightPartModal';

// 1. P2P-оценивание toggle
        const p2pRow = document.createElement('div');
        p2pRow.className = 'mb-3 d-flex align-items-center';

        const p2pLabel = document.createElement('span');
        p2pLabel.className = 'me-2';
        p2pLabel.textContent = 'P2P-оценивание';

        const p2pSwitchWrapper = document.createElement('div');
        p2pSwitchWrapper.className = 'form-check form-switch';

        const p2pSwitch = document.createElement('input');
        p2pSwitch.type = 'checkbox';
        p2pSwitch.className = 'form-check-input';
        p2pSwitch.id = 'peerReviewToggle';

// 2. reviewPackageSize input
        const reviewGroup = document.createElement('div');
        reviewGroup.className = 'mb-3';

        const reviewInput = document.createElement('input');
        reviewInput.type = 'number';
        reviewInput.min = '1';
        reviewInput.step = '1';
        reviewInput.className = 'form-control';
        reviewInput.id = 'reviewPackageSize';
        reviewInput.placeholder = 'Введите размер пакета проверки';
        reviewInput.disabled = true;

        p2pSwitch.addEventListener('change', () => {
            reviewInput.disabled = !p2pSwitch.checked;
            if (reviewInput.disabled) reviewInput.value = '';
        });

// Блокируем минус нажатиями с клавиатуры
        reviewInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'Minus') {
                e.preventDefault();
            }
        });

// Блокируем вставку текста с минусом или с нулями в начале
        reviewInput.addEventListener('paste', (e) => {
            const pasted = e.clipboardData.getData('text');
            if (pasted.includes('-') || /^0\d*|^0$/.test(pasted)) {
                e.preventDefault();
            }
        });

// Контроль при вводе: убираем нули
        reviewInput.addEventListener('input', () => {
            let value = reviewInput.value;

            // Удалить все символы, кроме цифр
            value = value.replace(/[^\d]/g, '');

            // Удалить ведущие нули и запретить ноль вообще
            if (value.startsWith('0')) {
                value = '';
            }

            reviewInput.value = value;
        });


        p2pSwitchWrapper.appendChild(p2pSwitch);
        p2pRow.appendChild(p2pLabel);
        p2pRow.appendChild(p2pSwitchWrapper);
        rightPart.appendChild(p2pRow);

        reviewGroup.appendChild(reviewInput);
        rightPart.appendChild(reviewGroup);

// 3. penaltyInput
        const penaltyGroup = document.createElement('div');
        penaltyGroup.className = 'mb-3';

        const penaltyLabel = document.createElement('label');
        penaltyLabel.className = 'mb-2';
        penaltyLabel.setAttribute('for', 'penaltyInput');
        penaltyLabel.textContent = 'Штраф за пропуск проверки';

        const penaltyInput = document.createElement('input');
        penaltyInput.type = 'number';
        penaltyInput.className = 'form-control';
        penaltyInput.id = 'penaltyInput';
        penaltyInput.min = '0';
        penaltyInput.max = '100';
        penaltyInput.step = '1';
        penaltyInput.placeholder = '0–100%';

        penaltyInput.addEventListener('input', () => {
            let value = penaltyInput.value;

            // Удаление всех символов, кроме цифр
            value = value.replace(/[^\d]/g, '');

            // Удаление ведущих нулей, кроме случая "0"
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
            }

            // Преобразуем в число
            let numericValue = parseInt(value, 10);

            if (isNaN(numericValue)) {
                penaltyInput.value = '';
                return;
            }

            // Ограничиваем от 0 до 100
            if (numericValue > 100) {
                numericValue = 100;
            }

            penaltyInput.value = numericValue;
        });

// Запрет на ввод минуса с клавиатуры
        penaltyInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'Minus') {
                e.preventDefault();
            }
        });

// Защита от вставки с минусом или ведущими нулями
        penaltyInput.addEventListener('paste', (e) => {
            const pasted = e.clipboardData.getData('text');

            // Блокируем, если содержит минус или начинается с 0 (и не просто "0")
            if (pasted.includes('-') || (/^0\d/.test(pasted))) {
                e.preventDefault();
            }
        });

        penaltyGroup.appendChild(penaltyLabel);
        penaltyGroup.appendChild(penaltyInput);
        rightPart.appendChild(penaltyGroup);

// 4. deadlineInput
        const deadlineGroup = document.createElement('div');
        deadlineGroup.className = 'mb-3';

        const deadlineLabel = document.createElement('label');
        deadlineLabel.className = 'mb-2';
        deadlineLabel.setAttribute('for', 'deadlineInput');
        deadlineLabel.textContent = 'Срок сдачи';

        const deadlineInput = document.createElement('input');
        deadlineInput.type = 'datetime-local';
        deadlineInput.className = 'form-control';
        deadlineInput.id = 'deadlineInput';
        deadlineInput.onkeydown = () => false;

        deadlineGroup.appendChild(deadlineLabel);
        deadlineGroup.appendChild(deadlineInput);
        rightPart.appendChild(deadlineGroup);

// 5. pointsInput
        const pointsGroup = document.createElement('div');
        pointsGroup.className = 'mb-3';

        const pointsLabel = document.createElement('label');
        pointsLabel.className = 'mb-2';
        pointsLabel.setAttribute('for', 'pointsInput');
        pointsLabel.textContent = 'Баллы';

        const pointsInput = document.createElement('input');
        pointsInput.type = 'number';
        pointsInput.className = 'form-control';
        pointsInput.id = 'pointsInput';
        pointsInput.min = '0';
        pointsInput.max = '100';
        pointsInput.step = '1';
        pointsInput.placeholder = '0–100';

        pointsInput.addEventListener('input', () => {
            let value = pointsInput.value;

            // Удаление всех символов, кроме цифр
            value = value.replace(/[^\d]/g, '');

            // Удаление ведущих нулей, кроме случая "0"
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
            }

            let numericValue = parseInt(value, 10);

            if (isNaN(numericValue)) {
                pointsInput.value = '';
                return;
            }

            if (numericValue > 100) {
                numericValue = 100;
            }

            pointsInput.value = numericValue;
        });

// Запрет на ввод минуса с клавиатуры
        pointsInput.addEventListener('keydown', (e) => {
            if (e.key === '-' || e.key === 'Minus') {
                e.preventDefault();
            }
        });

// Защита от вставки с минусом или ведущими нулями
        pointsInput.addEventListener('paste', (e) => {
            const pasted = e.clipboardData.getData('text');

            // Блокируем, если содержит минус или начинается с 0 (и не просто "0")
            if (pasted.includes('-') || (/^0\d/.test(pasted))) {
                e.preventDefault();
            }
        });


        pointsGroup.appendChild(pointsLabel);
        pointsGroup.appendChild(pointsInput);
        rightPart.appendChild(pointsGroup);

// 6. Критерии оценивания
        const criteriaLabelWrapper = document.createElement('div');
        criteriaLabelWrapper.className = 'mb-2';

        const criteriaLabel = document.createElement('label');
        criteriaLabel.textContent = 'Критерии оценивания';

        criteriaLabelWrapper.appendChild(criteriaLabel);
        rightPart.appendChild(criteriaLabelWrapper);

// 7. Dropdown для критериев
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'dropdown mb-2';

        const dropdownBtn = document.createElement('button');
        dropdownBtn.className = 'btn btn-secondary dropdown-toggle';
        dropdownBtn.type = 'button';
        dropdownBtn.setAttribute('data-bs-toggle', 'dropdown');
        dropdownBtn.textContent = 'Добавить критерий';

        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';

        const addNewLi = document.createElement('li');
        const addNewA = document.createElement('a');
        addNewA.className = 'dropdown-item';
        addNewA.href = '#';
        addNewA.id = 'addNewCriterion';
        addNewA.textContent = 'Добавить критерий';
        addNewLi.appendChild(addNewA);

        const selectExistingLi = document.createElement('li');
        const selectExistingA = document.createElement('a');
        selectExistingA.className = 'dropdown-item';
        selectExistingA.href = '#';
        selectExistingA.id = 'selectExistingCriteria';
        selectExistingA.textContent = 'Выбрать существующий';
        selectExistingLi.appendChild(selectExistingA);

        dropdownMenu.appendChild(addNewLi);
        dropdownMenu.appendChild(selectExistingLi);

        dropdownWrapper.appendChild(dropdownBtn);
        dropdownWrapper.appendChild(dropdownMenu);
        rightPart.appendChild(dropdownWrapper);

// 8. criteriaList
        const criteriaList = document.createElement('div');
        criteriaList.id = 'criteriaList';
        rightPart.appendChild(criteriaList);

        modalRow.appendChild(rightPart);
    }

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


