import {ApiClient} from "./requests/ApiClient.js";

const userEmail = localStorage.getItem('userEmail');
const token = localStorage.getItem('jwtToken');

const authElements = document.querySelectorAll('.auth-only');
const guestElements = document.querySelectorAll('.guest-only');
const emailElement = document.getElementById('userEmail');
const api = new ApiClient();

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

const userRole = localStorage.getItem('userRole');
if (userRole === 'student') {
    window.location.href = 'courses.html';
}

async function loadAppeals() {
  const token = localStorage.getItem('jwtToken');

  api.fetchWithAuth('/Report', {
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
          console.warn('Ошибка при получении жалоб:', response.status);
        }
      }
      return response.json();
    })
    .then(appeals => {
      renderAppeals(appeals);
    })
    .catch(error => {
      console.error('Ошибка при загрузке жалоб:', error);
    });
}


function renderAppeals(appeals) {
  const template = document.getElementById('appealTemplate');
  const container = document.getElementById('appealsList');
  container.innerHTML = '';

  appeals.forEach(appeal => {
    const clone = template.content.cloneNode(true);

    const modalId = `appealModal${appeal.id}`;
    const card = clone.querySelector('.appeal-card');
    const modal = clone.querySelector('.appealModal');

    card.querySelector('.appealNum').textContent = appeal.numb;
    card.querySelector('.appealAuthor').textContent = `Автор: ${appeal.author}`;
    card.querySelector('.appealTitle').textContent = `Тема: ${appeal.theme}`;

    const btn = card.querySelector('[data-bs-toggle="modal"]');
    btn.setAttribute('data-bs-target', `#${modalId}`);

    modal.setAttribute('id', modalId);
    modal.querySelector('.appealModalTitle').textContent = `Жалоба №${appeal.numb}`;
    modal.querySelector('.appealModalAuthor').textContent = appeal.author;
    modal.querySelector('.appealModalTarget').textContent = appeal.studentRep;
    modal.querySelector('.appealModalTopic').textContent = appeal.theme;
    modal.querySelector('.appealModalDescription').textContent = appeal.description;

    const reviewedBtn = card.querySelectorAll('.appealBtn')[1];
    reviewedBtn.addEventListener('click', (event) => {
      event.stopPropagation();

      if (!confirm(`Подтвердите удаление жалобы №${appeal.numb}?`)) return;

      api.fetchWithAuth(`/Reports/${appeal.id}`, {
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
      })
      .then(response => {
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        alert('Заявка успешно отмечена как рассмотренная.');
        card.remove();
      })
      .catch(err => {
        console.error('Ошибка при удалении жалобы:', err);
        alert('Не удалось отметить заявку как рассмотренную.');
      });
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


loadAppeals();