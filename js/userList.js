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
    const courseId = new URLSearchParams(window.location.search).get('id');

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
  const card = clone.querySelector('.card');

  clone.querySelector('.userFullName').textContent = user.fullName;
  clone.querySelector('.userEmail').textContent = user.email;

  card.addEventListener('click', () => {
    const token = localStorage.getItem('jwtToken');
    console.log('JWT токен:', token);

    const payload = parseJwt(token);
    console.log('Payload из JWT:', payload);

    if (!payload) {
        localStorage.removeItem('jwtToken');
        window.location.href = 'authorization.html';
        return;
    }

    const currentUserId = payload.sub || payload.userId || (payload.nameid && payload.nameid[0]);
    const userRole = 'owner'; //потом получать роль из localStorage

        if (userRole === 'owner' || userRole === 'teacher') {
            openUserModal(user.id, user.fullName);
        } else if (userRole === 'student') {
            if (user.id === currentUserId) {
            openUserModal(user.id, user.fullName);
            } else {
            alert('Вы можете просматривать только свои оценки.');
            }
        } else {
            alert('У вас нет прав для просмотра оценок.');
        }
    });

  return clone;
}

// function openUserModal(userId, userFullName) {
//     const modal = new bootstrap.Modal(document.getElementById('userModal'));
//     const modalTitle = document.getElementById('userModalLabel');
//     const gradesTableBody = document.getElementById('gradesTableBody');
//     const totalGrade = document.getElementById('totalGrade');

//     modalTitle.textContent = `Оценки пользователя: ${userFullName}`;
//     gradesTableBody.innerHTML = '';
//     totalGrade.textContent = '';

//     const token = localStorage.getItem('jwtToken');

//     fetch(``, { //добавить ссылку на запрос
//         method: 'GET',
//         headers: {
//         accept: 'application/json',
//         Authorization: `Bearer ${token}`
//         }
//     })
//     .then(response => response.json())
//     .then(grades => {
//         let sum = 0;
//         grades.forEach(grade => {
//             const row = document.createElement('tr');

//             const taskCell = document.createElement('td');
//             taskCell.textContent = grade.TaskName;

//             const scoreCell = document.createElement('td');
//             scoreCell.textContent = grade.Score;
//             scoreCell.style.cursor = 'pointer';

//             scoreCell.addEventListener('click', () => {
//             window.location.href = `solution.html?id=${grade.SolutionId}`;
//             });

//             scoreCell.addEventListener('mouseover', () => {
//             scoreCell.style.backgroundColor = '#e6f7ff';
//             });
//             scoreCell.addEventListener('mouseout', () => {
//             scoreCell.style.backgroundColor = '';
//             });

//             row.appendChild(taskCell);
//             row.appendChild(scoreCell);
//             gradesTableBody.appendChild(row);

//             sum += grade.Score;
//         });

//         totalGrade.textContent = sum;
//         modal.show();
//     })
//     .catch(error => {
//         console.error('Ошибка при загрузке оценок:', error);
//     });
// }

function openUserModal(userId, userFullName) {
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    const modalTitle = document.getElementById('userModalLabel');
    const gradesTableBody = document.getElementById('gradesTableBody');
    const totalGrade = document.getElementById('totalGrade');

    modalTitle.textContent = `Успеваемость: ${userFullName}`;
    gradesTableBody.innerHTML = '';
    totalGrade.textContent = '';

    let grades = [];

    //это тестовые данные
    if (userId === '31fd0c6d-a4c7-4ec7-b8d2-af0c916f2e5f') {
        grades = [
        {
            GradeId: '11111111-1111-1111-1111-111111111111',
            Score: 95,
            TaskName: 'Задание 1',
            SolutionId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        },
        {
            GradeId: '22222222-2222-2222-2222-222222222222',
            Score: 88,
            TaskName: 'Задание 2',
            SolutionId: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        }
        ];
    } else if (userId === '58cbbda3-922f-4400-acf9-fecc6b24828e') {
        grades = [
        {
            GradeId: '33333333-3333-3333-3333-333333333333',
            Score: 75,
            TaskName: 'Задание A',
            SolutionId: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        },
        {
            GradeId: '44444444-4444-4444-4444-444444444444',
            Score: 80,
            TaskName: 'Задание B',
            SolutionId: 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        },
        {
            GradeId: '55555555-5555-5555-5555-555555555555',
            Score: 90,
            TaskName: 'Задание C',
            SolutionId: 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        }
        ];
    }

    let sum = 0;
    grades.forEach(grade => {
        const row = document.createElement('tr');

        const taskCell = document.createElement('td');
        taskCell.textContent = grade.TaskName;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = grade.Score;
        scoreCell.style.cursor = 'pointer';
        scoreCell.addEventListener('click', () => {
            window.location.href = `solution.html?id=${grade.SolutionId}`; //добавить ссылку на решение
        });


        scoreCell.addEventListener('mouseover', () => {
            scoreCell.style.backgroundColor = '#e6f7ff';
        });
        scoreCell.addEventListener('mouseout', () => {
            scoreCell.style.backgroundColor = '';
        });

        row.appendChild(taskCell);
        row.appendChild(scoreCell);
        gradesTableBody.appendChild(row);

        sum += grade.Score;
    });


    totalGrade.textContent = sum;
    modal.show();
}

loadUsers()


function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}