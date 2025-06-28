export function generateRightPartModal(modalRow) {
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