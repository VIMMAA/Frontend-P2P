export function validateRightForm(rightPartForm) {

    const p2pSwitch = rightPartForm.children[0].children[1].children[0]
    const reviewInput = rightPartForm.children[1].children[0]
    const penaltyInput = rightPartForm.children[2].children[1]
    const pointsInput = rightPartForm.children[4].children[1]

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

    penaltyInput.addEventListener('input', () => {
        let value = penaltyInput.value.replace(',', '.'); // Заменяем запятую на точку

        // Удаляем все символы кроме цифр и точки
        value = value.replace(/[^\d.]/g, '');

        // Разрешаем только одну точку
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        }

        let numericValue = parseFloat(value);

        if (isNaN(numericValue)) {
            penaltyInput.value = '';
            return;
        }

        // Ограничения: от 0 до 1 и не более двух знаков после точки
        if (numericValue < 0) numericValue = 0;
        if (numericValue > 1) numericValue = 1;

        // Обрезаем до двух знаков после запятой
        penaltyInput.value = numericValue.toFixed(2);
    });

// Запрет на минус и лишние точки с клавиатуры
    penaltyInput.addEventListener('keydown', (e) => {
        if (['-', 'Minus', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }

        // Запрещаем вторую точку
        if (e.key === '.' && penaltyInput.value.includes('.')) {
            e.preventDefault();
        }
    });

// Защита от некорректной вставки
    penaltyInput.addEventListener('paste', (e) => {
        const pasted = e.clipboardData.getData('text').replace(',', '.');
        const float = parseFloat(pasted);
        if (isNaN(float) || float < 0 || float > 1) {
            e.preventDefault();
        }
    });


//     pointsInput.addEventListener('input', () => {
//         let value = pointsInput.value;
//
//         // Удаление всех символов, кроме цифр
//         value = value.replace(/[^\d]/g, '');
//
//         // Удаление ведущих нулей, кроме случая "0"
//         if (value.length > 1 && value.startsWith('0')) {
//             value = value.replace(/^0+/, '');
//         }
//
//         let numericValue = parseInt(value, 10);
//
//         if (isNaN(numericValue)) {
//             pointsInput.value = '';
//             return;
//         }
//
//         if (numericValue > 100) {
//             numericValue = 100;
//         }
//
//         pointsInput.value = numericValue;
//     });
//
// // Запрет на ввод минуса с клавиатуры
//     pointsInput.addEventListener('keydown', (e) => {
//         if (e.key === '-' || e.key === 'Minus') {
//             e.preventDefault();
//         }
//     });
//
// // Защита от вставки с минусом или ведущими нулями
//     pointsInput.addEventListener('paste', (e) => {
//         const pasted = e.clipboardData.getData('text');
//
//         // Блокируем, если содержит минус или начинается с 0 (и не просто "0")
//         if (pasted.includes('-') || (/^0\d/.test(pasted))) {
//             e.preventDefault();
//         }
//     });
}