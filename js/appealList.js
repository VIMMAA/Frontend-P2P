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

document.querySelectorAll('.appeal-card').forEach(card => {
    card.addEventListener('click', () => {
      const solutionId = card.getAttribute('data-solution-id');
      window.location.href = `/solutions/${solutionId}`;
    });
  });


// async function loadAppeals() {
//   const token = localStorage.getItem('jwtToken');

//   fetch('', {   //добавить подключение к api
//     method: 'GET',
//     headers: {
//       accept: 'application/json',
//       Authorization: `Bearer ${token}`
//     }
//   })
//     .then(response => {
//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.removeItem('jwtToken');
//           window.location.href = 'authorization.html';
//         } else {
//           console.warn('Ошибка при получении жалоб:', response.status);
//         }
//       }
//       return response.json();
//     })
//     .then(appeals => {
//       renderAppeals(appeals);
//     })
//     .catch(error => {
//       console.error('Ошибка при загрузке жалоб:', error);
//     });
// }


function renderAppeals(appeals) {
  const template = document.getElementById('appealTemplate');
  const container = document.getElementById('appealsList');
  container.innerHTML = '';

  appeals.forEach(appeal => {
    const clone = template.content.cloneNode(true);

    const modalId = `appealModal${appeal.id}`;
    const card = clone.querySelector('.appeal-card');
    const modal = clone.querySelector('.appealModal');

    card.querySelector('.appealNum').textContent = appeal.id;
    card.querySelector('.appealAuthor').textContent = `Автор: ${appeal.authorFullName}`;
    card.querySelector('.appealTitle').textContent = `Тема: ${appeal.topic}`;

    const btn = card.querySelector('[data-bs-toggle="modal"]');
    btn.setAttribute('data-bs-target', `#${modalId}`);

    modal.setAttribute('id', modalId);
    modal.querySelector('.appealModalTitle').textContent = `Жалоба №${appeal.id}`;
    modal.querySelector('.appealModalAuthor').textContent = appeal.authorFullName;
    modal.querySelector('.appealModalTarget').textContent = appeal.targetFullName;
    modal.querySelector('.appealModalTopic').textContent = appeal.topic;
    modal.querySelector('.appealModalDescription').textContent = appeal.description;

    const reviewedBtn = card.querySelectorAll('.appealBtn')[1];
        reviewedBtn.addEventListener('click', () => {
        console.log(`Жалоба ${appeal.id} отмечена как рассмотренная`);
    });

    card.setAttribute('data-solution-id', appeal.solutionId || appeal.id);
    card.addEventListener('click', () => {
    const solutionId = card.dataset.solutionId;
    if (solutionId) {
        window.location.href = `/solutions/${solutionId}`; //добавить переход на решение студента
    }
    });


    container.appendChild(clone);
  });
}

//это я тестил
async function loadAppeals() {
  const appeals = [
    {
      id: 1123123,
      authorFullName: 'Иванов Иван',
      targetFullName: 'Петров Петр',
      topic: 'Лабораторная №1',
      description: 'Я считаю, что оценка была выставлена без учёта критериев. Прошу пересмотреть.'
    },
    {
      id: 21231231,
      authorFullName: 'Сидорова Анна',
      targetFullName: 'Кузнецов Алексей',
      topic: 'Лабораторная №4',
      description: 'Преподаватель позволил себе некорректные высказывания во время консультации.'
    },
    {
      id: 3123123,
      authorFullName: 'Марков Илья',
      targetFullName: 'Программа курса',
      topic: 'Лабораторная №10',
      description: 'Задания не соответствуют лекциям, неясные формулировки.'
    }
  ];

  renderAppeals(appeals);
}

loadAppeals();