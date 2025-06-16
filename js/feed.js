let posts = [];

let postList = document.getElementById('postList');
const content = document.getElementById('content');
const createPostBtn = document.getElementById('createPostBtn');

function renderPostList() {
    postList.innerHTML = '';
    posts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.style.cursor = 'pointer';
        card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${post.title}</h5>
        <p class="card-text">${post.description}</p>
        <p class="card-subtitle text-muted">${post.author} · ${post.date}</p>
      </div>
    `;
        card.addEventListener('click', () => viewPost(index));
        postList.appendChild(card);
    });
}

function viewPost(index) {
    const post = posts[index];
    content.innerHTML = `
    <div class="card">
      <div class="card-body">
        <input type="text" id="editTitle" class="form-control fs-5 fw-bold mb-2" value="${post.title}" disabled>
        <textarea id="editDescription" class="form-control mb-2" rows="6" maxlength="1000" disabled>${post.description}</textarea>
        <div class="mb-2">Автор: ${post.author}</div>
        <div class="mb-2">Дата: ${post.date}</div>
        <button class="btn btn-outline-primary" id="editBtn">Изменить</button>
      </div>
    </div>
  `;

    document.getElementById('editBtn').addEventListener('click', () => {
        const titleInput = document.getElementById('editTitle');
        const descInput = document.getElementById('editDescription');
        const btn = document.getElementById('editBtn');
        if (btn.textContent === 'Изменить') {
            titleInput.disabled = false;
            descInput.disabled = false;
            btn.textContent = 'Сохранить';
        } else {
            if ((titleInput.value.match(/[a-zA-Zа-яА-Я]/g) || []).length >= 4 && descInput.value.length <= 1000) {
                posts[index].title = titleInput.value;
                posts[index].description = descInput.value;
                renderMainContent();
            }
        }
    });
}

function renderCreateForm() {
    content.innerHTML = `
    <div class="card">
      <div class="card-body">
        <input type="text" id="newTitle" class="form-control mb-2" placeholder="Тема">
        <textarea id="newDescription" class="form-control mb-2" rows="6" maxlength="1000" placeholder="Описание" style="resize: none;"></textarea>
        <input type="file" id="newFiles" class="form-control mb-2" multiple>
        <input type="text" id="newLink" class="form-control mb-3" placeholder="Ссылка на материалы">
        <button class="btn btn-primary" id="publishBtn" disabled>Опубликовать</button>
      </div>
    </div>
  `;

    const titleInput = document.getElementById('newTitle');
    const descInput = document.getElementById('newDescription');
    const fileInput = document.getElementById('newFiles');
    const publishBtn = document.getElementById('publishBtn');

    function validate() {
        const letterCount = (titleInput.value.match(/[a-zA-Zа-яА-Я]/g) || []).length;
        publishBtn.disabled = !(letterCount >= 4 && descInput.value.length <= 1000 && fileInput.files.length <= 5);
    }

    titleInput.addEventListener('input', validate);
    descInput.addEventListener('input', validate);
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 5) {
            alert('Можно загрузить до 5 файлов.');
            fileInput.value = '';
        }
        validate();
    });

    publishBtn.addEventListener('click', () => {
        const newPost = {
            title: titleInput.value,
            description: descInput.value,
            files: Array.from(fileInput.files),
            link: document.getElementById('newLink').value,
            author: 'Вы',
            date: new Date().toLocaleString()
        };
        posts.unshift(newPost);
        renderMainContent();
    });
}

function renderMainContent() {
    content.innerHTML = `
    <button id="createPostBtn" class="btn btn-primary mb-3">Создать пост</button>
    <div id="postList"></div>
  `;
    postList = document.getElementById('postList');
    document.getElementById('createPostBtn').addEventListener('click', renderCreateForm);
    renderPostList();
}

createPostBtn.addEventListener('click', renderCreateForm);
renderPostList();
