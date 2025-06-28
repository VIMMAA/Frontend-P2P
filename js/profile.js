import {ApiClient} from "./requests/ApiClient.js";

const userEmail = localStorage.getItem('userEmail');
const token = localStorage.getItem('jwtToken');

const authElements = document.querySelectorAll('.auth-only');
const guestElements = document.querySelectorAll('.guest-only');
const emailElement = document.getElementById('userEmail');
const api = new ApiClient()

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

    api.fetchWithAuth('/User/logout', {
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

const saveProfileButton = document.getElementById('saveProfileButton');
const inputFirstName = document.getElementById('inputFirstName');
const inputMiddleName = document.getElementById('inputMiddleName');
const inputLastName = document.getElementById('inputLastName');
const inputBirthDate = document.getElementById('inputBirthDate');
const inputEmail = document.getElementById('inputEmail');


function resetFieldHighlight() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });
}

function getProfile() {
    if (!token) {
        window.location.href = 'authorization.html';
        return;
    }

    api.fetchWithAuth('/User/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userEmail');
                window.location.href = 'authorization.html';
            }
            throw new Error('Ошибка получения профиля');
        }
        return response.json();
    })
    .then(data => {
        const profile = data.profile;

        inputFirstName.value = profile.firstName || '';
        inputMiddleName.value = profile.middleName || '';
        inputLastName.value = profile.lastName || '';
        inputEmail.value = profile.email || '';
        inputBirthDate.value = profile.birthday ? profile.birthday.slice(0, 10) : '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка загрузки.');
    });
}

function validateProfileData() {
    let isValid = true;

    if (!inputMiddleName.value.trim()) {
        isValid = false;
        setInvalid('inputMiddleName', 'middleNameFeedback', 'Пожалуйста, введите вашу фамилию.');
    } else {
        setValid('inputMiddleName');
    }

    if (!inputFirstName.value.trim()) {
        isValid = false;
        setInvalid('inputFirstName', 'firstNameFeedback', 'Пожалуйста, введите ваше имя.');
    } else {
        setValid('inputFirstName');
    }

    if (!inputLastName.value.trim()) {
        isValid = false;
        setInvalid('inputLastName', 'lastNameFeedback', 'Пожалуйста, введите ваше отчество.');
    } else {
        setValid('inputLastName');
    }

    return isValid;
}

function updateProfile() {
    if (!token) {
        window.location.href = 'authorization.html';
        return;
    }

    if (!validateProfileData()) {
        return;
    }

    const updatedProfileData = {
        firstName: inputFirstName.value.trim(),
        middleName: inputMiddleName.value.trim(),
        lastName: inputLastName.value.trim(),
    };

    api.fetchWithAuth('/User/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfileData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(serverError => {
                if (response.status === 400 && serverError.errors) {
                    alert('Ошибка обновления профиля');
                } else if (response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userEmail');
                    window.location.href = 'authorization.html';
                }
                throw new Error('Ошибка обновления профиля');
            });
        }

        if (response.status === 200) {
            alert('Профиль обновлён!');
            resetFieldHighlight();
        }

        return response.text().then(text => {
            if (text) {
                try {
                    return JSON.parse(text);
                } catch (error) {
                    return {};
                }
            }
            return {};
        });
    })
    .then(() => {
        updateNavbar();
        getProfile();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при обновлении профиля.');
    });
}

saveProfileButton.addEventListener('click', updateProfile);

getProfile();

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