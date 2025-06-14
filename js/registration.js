localStorage.removeItem('jwtToken');
localStorage.removeItem('userEmail');
localStorage.removeItem('userRole');

document.addEventListener('DOMContentLoaded', function () {
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
});

document.getElementById('registrationForm').addEventListener('submit', function(event){
    event.preventDefault();

    const firstName = document.getElementById('inputFirstName').value;
    const middleName = document.getElementById('inputMiddleName').value;
    const lastName = document.getElementById('inputLastName').value;
    const password = document.getElementById('inputPassword').value;
    const email = document.getElementById('inputEmail').value;
    const birthDate = document.getElementById('inputDate').value 
    ? document.getElementById('inputDate').value 
    : null;

    let isValid = true;

    if (!firstName){
        isValid = false;
        setInvalid('inputFirstName', 'firstNameFeedback', 'Пожалуйста, введите имя.')
    }
    else {
        setValid('inputFirstName');
    }

    if (!middleName){
        isValid = false;
        setInvalid('inputMiddleName', 'middleNameFeedback', 'Пожалуйста, введите фамилию.')
    }
    else {
        setValid('inputMiddleName');
    }

    if (!lastName){
        isValid = false;
        setInvalid('inputLastName', 'lastNameFeedback', 'Пожалуйста, введите отчество.')
    }
    else {
        setValid('inputLastName');
    }

    if (birthDate){
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        if (birthDateObj >= today) {
            isValid = false;
            setInvalid('inputDate', 'dateFeedback', 'Дата рождения не может быть позже текущей даты.');
        }
        else {
            setValid('inputDate');
        }
    }
    else {
        isValid = false;
        setInvalid('inputDate', 'dateFeedback', 'Пожалуйста, укажите дату рождения.');
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
        isValid = false;
        setInvalid('inputEmail', 'emailFeedback', 'Пожалуйста, введите корректный email.');
    } 
    else {
        setValid('inputEmail');
    }

    const passwordReg = /^(?=.*\d).{6,}$/;
    if (!passwordReg.test(password)) {
        isValid = false;
        setInvalid('inputPassword', 'passwordFeedback', 'Пароль должен содержать минимум 6 символов, включая хотя бы одну цифру.');
    } 
    else {
        setValid('inputPassword');
    }

    if (isValid){
        const data = {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            password: password,
            email: email,
            birthday: birthDate,
        };

        const registrationId = new URLSearchParams(window.location.search).get('id');

        const registrationUrl = //подключить к api
        
        fetch(registrationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok){
                return response.json().then(error => Promise.reject(error));
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', data.role)
                alert('Регистрация прошла успешно!');
                
            }
        })
        .catch(error => {
            console.error('Ошибка при регистрации:', error);
            alert('Ошибка при регистрации: ' + error);
        });
    }
});

function setInvalid(inputId, feedbackId, message) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    input.classList.add('is-invalid');
    feedback.textContent = message;
}

function setValid(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}