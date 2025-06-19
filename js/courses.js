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

    fetch('https://a34448-3f82.u.d-f.pw/api/User/logout', {
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

document.addEventListener("DOMContentLoaded", () => {
    const createCourseForm = document.getElementById("createCourseForm");

    createCourseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("courseName").value.trim();
        const chapter = document.getElementById("courseChapter").value.trim();
        const subject = document.getElementById("courseSubject").value.trim();
        const audience = document.getElementById("courseAudience").value.trim();

        let isValid = true;

        if (!name) {
            isValid = false;
            setInvalid('courseName', 'courseNameFeedback', 'Пожалуйста, введите название курса.');
        } else {
            setValid('courseName');
        }

        if (!isValid) return;

        const courseData = {
            name,
            chapter: chapter || "-",
            subject: subject || "-",
            audience: audience || "-"
        };

        try {
            const response = await fetch("https://a34448-3f82.u.d-f.pw/api/Course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                const result = await response.json();
                alert("Курс успешно создан!");
                createCourseForm.reset();
                resetFieldHighlight();
                const collapseCreate = document.getElementById("collapseCreate");
                const bsCollapse = bootstrap.Collapse.getInstance(collapseCreate);
                bsCollapse.hide();
            } else if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userEmail');
                window.location.href = 'authorization.html';
            } else {
                const errorText = await response.text();
                alert("Ошибка при создании курса: " + errorText);
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке запроса.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const joinCourseForm = document.getElementById("joinCourseForm");

    joinCourseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const code = document.getElementById("joinCode").value.trim();

        if (!code) {
            setInvalid('joinCode', 'joinCodeFeedback', 'Пожалуйста, введите код курса.');
            return;
        } else {
            setValid('joinCode');
        }

        try {
            const response = await fetch(`https://a34448-3f82.u.d-f.pw/api/Course/register?code=${encodeURIComponent(code)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                joinCourseForm.reset();
                const collapseJoin = document.getElementById("collapseJoin");
                const bsCollapse = bootstrap.Collapse.getInstance(collapseJoin);
                bsCollapse.hide();
                setValid('joinCode');
                resetFieldHighlight();
            } else if (response.status === 409) {
                const errorResult = await response.json();
                setInvalid('joinCode', 'joinCodeFeedback', errorResult.message);
            } else if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userEmail');
                window.location.href = 'authorization.html';
            } else {
                const errorResult = await response.json();
                setInvalid('joinCode', 'joinCodeFeedback', errorResult.message);
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке запроса.");
        }
    });
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

function resetFieldHighlight() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });
}