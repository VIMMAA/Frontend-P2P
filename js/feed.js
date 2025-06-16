const postTitleInput = document.getElementById('postTitle');
const publishBtn = document.getElementById('publishBtn');
const postForm = document.getElementById('postForm');
const postList = document.getElementById('postList');

// Функция для проверки, достаточно ли букв в теме поста
function validateTitle(title) {
    const letterCount = (title.match(/[a-zA-Zа-яА-Я]/g) || []).length;
    return letterCount >= 4;
}

// Проверка валидности темы
postTitleInput.addEventListener('input', () => {
    const isValid = validateTitle(postTitleInput.value);
    publishBtn.disabled = !isValid;
});

// При клике "Опубликовать"
publishBtn.addEventListener('click', () => {
    const type = document.getElementById('postType').value;
    const title = postTitleInput.value;
    const description = document.getElementById('postDescription').value;
    const author = 'Вы'; // можно заменить на имя авторизованного пользователя
    const now = new Date().toLocaleString();

    const postCard = document.createElement('div');
    postCard.className = 'card card-post';
    postCard.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${title}</h5>
      <p class="card-subtitle text-muted mb-1">${author} · ${now}</p>
      <p class="card-text">${description}</p>
    </div>
  `;

    postList.prepend(postCard); // Добавить в начало списка

    // Закрыть модалку, очистить форму
    const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
    modal.hide();
    postForm.reset();
    publishBtn.disabled = true;
});
