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

async function loadUsers() {
    const token = localStorage.getItem('jwtToken');
    //const courseId = new URLSearchParams(window.location.search).get('id'); потом связать с курсом
    const courseId = '2f93aecb-235d-4b63-b4ea-3fff41ead0b3';

    api.fetchWithAuth(`/Course/${courseId}/users`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                window.location.href = 'authorization.html';
            } else {
                console.warn('Ошибка при получении пользователей:', response.status);
            }
        }
        return response.json();
    })
    .then(users => {
        renderUsers(users);
    })
    .catch(error => {
        console.error('Ошибка при загрузке пользователей:', error);
    });
}


function renderUsers({ owner, teachers, students }) {
  const template = document.getElementById('userTemplate');
  const teachersList = document.getElementById('teachersList');
  const studentsList = document.getElementById('studentsList');
  const teachersSection = document.getElementById('teachersSection');
  const studentsSection = document.getElementById('studentsSection');

  teachersList.innerHTML = '';
  studentsList.innerHTML = '';

  let hasTeachers = false;
  let hasStudents = false;

  if (owner) {
    const ownerCard = createUserCard(template, owner);
    ownerCard.querySelector('.card').classList.add('owner-highlight');
    teachersList.appendChild(ownerCard);
    hasTeachers = true;
  }

  (teachers || []).forEach(teacher => {
    const teacherCard = createUserCard(template, teacher);
    teachersList.appendChild(teacherCard);
    hasTeachers = true;
  });

  (students || []).forEach(student => {
    const studentCard = createUserCard(template, student);
    studentsList.appendChild(studentCard);
    hasStudents = true;
  });

  teachersSection.style.display = hasTeachers ? '' : 'none';
  studentsSection.style.display = hasStudents ? '' : 'none';
}

function createUserCard(template, user) {
  const clone = template.content.cloneNode(true);
  clone.querySelector('.userFullName').textContent = user.fullName;
  clone.querySelector('.userEmail').textContent = user.email;
  return clone;
}

loadUsers()