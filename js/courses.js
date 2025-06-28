import {ApiClient} from "./requests/ApiClient.js";

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
const api = new ApiClient();

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
            const response = await api.fetchWithAuth(`/Course`, {
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
                loadCourses();
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
            const response = await api.fetchWithAuth(`/Course/register?code=${encodeURIComponent(code)}`, {
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
                loadCourses();
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

function renderCourses(courses) {
    const container = document.getElementById('coursesContainer');
    const template = document.getElementById('courseCardTemplate');

    container.innerHTML = '';

    courses.forEach(course => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.courseTitle').textContent = course.courseName;

        const chapterEl = clone.querySelector('.courseChapter').closest('p');
        if (course.chapter && course.chapter !== '-') {
        clone.querySelector('.courseChapter').textContent = course.chapter;
        } else {
        chapterEl.classList.add('d-none');
        }

        //clone.querySelector('.courseAuthor').textContent = course.author || '—'; потом добавлю имя создателя курса

        const courseBox = clone.querySelector('.courseBox');
        courseBox.style.cursor = 'pointer';
        courseBox.addEventListener('click', () => {
            window.location.href = `feed.html?id=${course.courseId}`; //добавить переход на страницу с информацией о курсе
        });

        const deleteBtn = clone.querySelector('.btn-delete');
        const leaveBtn = clone.querySelector('.btn-leave');

        deleteBtn.addEventListener('click', (e) => e.stopPropagation());
        leaveBtn.addEventListener('click', (e) => e.stopPropagation());

        if (course.role === 'Owner') {
            deleteBtn.classList.remove('d-none');
            deleteBtn.onclick = () => {
                if (confirm(`Вы уверены, что хотите удалить курс "${course.courseName}"?`)) {
                    deleteCourse(course.courseId);
                }
            };
        } else {
            leaveBtn.classList.remove('d-none');
            leaveBtn.onclick = () => {
                if (confirm(`Вы уверены, что хотите покинуть курс "${course.courseName}"?`)) {
                    leaveCourse(course.courseId);
                }
            };
        }


        container.appendChild(clone);
    });
}

function loadCourses() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error("Нет токена");
        return;
    }

    api.fetchWithAuth(`/Course/list`, {
        method: 'GET',
        headers: {
        accept: '*/*',
        'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userEmail');
            window.location.href = 'authorization.html';
        }else {
            console.warn(`Error: ${response.status}`);
        }
    })
    .then(data => {
        const courses = [
        ...(data.ownedCourses || []),
        ...(data.teachingCourses || []),
        ...(data.studentCourses || [])
        ];
        renderCourses(courses);
    })
    .catch(error => {
        if (error !== 'Unauthorized') {
        console.error("Ошибка при загрузке курсов:", error);
        }
    });
}

loadCourses();

async function deleteCourse(courseId) {
  const token = localStorage.getItem('jwtToken');
  if (!token) return;

  try {
    const response = await api.fetchWithAuth(`/Course/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      loadCourses();
    } else {
      console.error(`Ошибка при удалении курса (${response.status})`);
    }
  } catch (error) {
    console.error("Ошибка при удалении курса:", error);
  }
}

async function leaveCourse(courseId) {
  const token = localStorage.getItem('jwtToken');
  if (!token) return;

  try {
    const response = await api.fetchWithAuth(`/Course/leave/${courseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      loadCourses();
    } else {
      console.error(`Ошибка при выходе из курса (${response.status})`);
    }
  } catch (error) {
    console.error("Ошибка при выходе из курса:", error);
  }
}