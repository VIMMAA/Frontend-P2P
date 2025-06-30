import {ApiClient} from "./requests/ApiClient.js";

let solutionAttachedFiles = [];

const solutionInput = document.getElementById("solutionFilesInput");
const solutionAttachBtn = document.getElementById("attachSolutionFilesBtn");
const solutionFileList = document.getElementById("solutionAttachedFilesList");
const gradesCheckGrades = document.getElementById("gradesCheckGrades");


function renderGradesCheck() {

}

const complaintModal = new bootstrap.Modal(document.getElementById("complaintModal"));

solutionAttachBtn.addEventListener("click", () => solutionInput.click());

solutionInput.addEventListener("change", async () => {
    const newFiles = Array.from(solutionInput.files);

    const base64Files = await Promise.all(
        newFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        name: file.name,
                        data: reader.result.split(",")[1]
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        })
    );

    solutionAttachedFiles = solutionAttachedFiles.concat(base64Files);
    renderSolutionAttachedFiles();
});

function renderSolutionAttachedFiles() {
    solutionFileList.innerHTML = "";
    solutionAttachedFiles.forEach((file, index) => {
        const div = document.createElement("div");
        div.className = "d-flex justify-content-between align-items-center border rounded p-2 mb-2";
        div.innerHTML = `
            <span class="text-truncate" style="max-width: 85%;">${file.name}</span>
            <button type="button" class="btn-close ms-3" data-index="${index}"></button>
        `;
        solutionFileList.appendChild(div);
    });

    solutionFileList.querySelectorAll("button").forEach(btn => {
        const index = parseInt(btn.dataset.index, 10);
        btn.addEventListener("click", () => {
            solutionAttachedFiles.splice(index, 1);
            renderSolutionAttachedFiles();
        });
    });
}

export class TaskSolution {
    constructor(taskId) {
        this.taskId = taskId;
        this.api = new ApiClient();
        this.currentUserFullName = "";
        this.attachedFiles = [];
        this.comments = [];
        this.grades = [];
        this.finalGrade = 0;
        this.solutionForCheckModels = []
        this.taskTitle = "";
        this.taskDescription = "";
        this.taskDate = "";
    }


    async fetchGrades() {
        try {
            const response = await this.api.fetchWithAuth(`/CheckAssignments/solution/${this.solutionId}`);

            if (!response.ok) throw new Error("Ошибка при отправке комментария");

            let responseData = await response.json();
            this.solutionForCheckModels = responseData.solutionForCheckModels;
            this.finalGrade = responseData.finalGrade;
            this.solutionForCheckModels.forEach(el => {
                this.grades.push(el);
            });
            //this.grades = responseData.assesments;

        } catch (err) {
            console.error("ошибка", err);
        }
    }


    //"solutionForCheckModels": [
    //     {
    //         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //         "assements": [
    //             {
    //                 "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //                 "score": 0,
    //                 "maxScore": 0,
    //                 "remark": "string"
    //             }
    //         ],
    //         "solutionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //         "comment": "string",
    //         "authortId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //         "dueTime": "2025-06-30T02:53:05.172Z",
    //         "isChecked": true
    //     }
    // ],
    //"

    async sendComment(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        try {
            const response = await this.api.fetchWithAuth(`/Comment/${this.taskId}/task`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text: trimmed})
            });

            if (!response.ok) throw new Error("Ошибка при отправке комментария");

            this.comments.push({author: this.currentUserFullName, text: trimmed});
            this.renderComments();
        } catch (err) {
            console.error("Не удалось отправить комментарий:", err);
        }
    }


    async sendSolution() {
        const content = document.getElementById("solutionContent").value.trim();
        if (!content && solutionAttachedFiles.length === 0) return;

        try {
            const response = await this.api.fetchWithAuth(`/Solution/${this.taskId}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    content,
                    attachmentPath: "",
                    files: solutionAttachedFiles
                })
            });

            if (!response.ok) throw new Error("Ошибка при отправке решения");

            // После успешной отправки:
            const courseId = getCourseIdFromURL();
            await this.renderSolution(courseId);
        } catch (err) {
            console.error("Не удалось отправить решение:", err);
        }
    }


    async fetchAuthorName(authorId) {
        try {
            const response = await this.api.fetchWithAuth(`/User/profile/${authorId}`);
            if (!response.ok) throw new Error("Ошибка получения профиля");

            const data = await response.json();
            return `${data.lastName} ${data.firstName}`;
        } catch (err) {
            console.error("Ошибка при получении имени автора:", err);
            return "Неизвестный пользователь";
        }
    }

    async loadComments() {
        const response = await this.api.fetchWithAuth(`/Comment/${this.taskId}/task/list`);
        if (!response.ok) throw new Error(`Ошибка загрузки комментариев: ${response.status}`);

        const commentsData = await response.json();
        this.comments = [];

        for (const c of commentsData) {
            const authorName = await this.fetchAuthorName(c.authorId);
            this.comments.push({
                author: authorName,
                text: c.text
            });
        }
    }

    async loadDataFromServer() {
        try {
            const taskResp = await this.api.fetchWithAuth(`/Task/${this.taskId}/materialWork`);
            if (!taskResp.ok) throw new Error(`Ошибка загрузки задания: ${taskResp.status}`);

            const taskData = await taskResp.json();

            this.taskTitle = taskData.name;
            this.taskDescription = taskData.description;
            this.taskDate = new Date(taskData.createTime).toLocaleDateString("ru-RU");
            this.taskAuthorId = taskData.authorId;

            this.attachedFiles = taskData.attachedFiles.map(f => ({
                name: f.name,
                url: `${this.api.baseUrl}/File/${f.id}/download`
            }));

            // Получение текущего пользователя
            const profileResp = await this.api.fetchWithAuth(`/User/profile`);
            if (profileResp.ok) {
                const profileData = await profileResp.json();
                this.currentUserFullName = `${profileData.profile.lastName} ${profileData.profile.firstName}`;
            } else {
                console.warn("Не удалось загрузить профиль текущего пользователя");
            }

            await this.loadComments();

        } catch (err) {
            console.error("Ошибка при загрузке данных:", err);
        }
    }

    renderFiles() {
        const ul = document.getElementById("attachedFiles");
        ul.innerHTML = "";
        this.attachedFiles.forEach(file => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${file.url}" download>${file.name}</a>`;
            ul.appendChild(li);
        });
    }

    renderComments() {
        const list = document.getElementById("commentsList");
        list.innerHTML = "";
        this.comments.forEach(c => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `<strong>${c.author}:</strong> ${c.text}`;
            list.appendChild(li);
        });
    }

    addComment(text) {
        const trimmed = text.trim();
        if (trimmed !== "") {
            this.comments.push({author: this.currentUserFullName, text: trimmed});
            this.renderComments();
        }
    }

    renderGrades() {
        const container = document.getElementById("gradesList");
        container.innerHTML = "";
        let total = 0;

        this.grades.forEach(grade => {
            total += grade.score;
            const card = document.createElement("div");
            const author = this.fetchAuthorName(grade.authorId);
            card.className = "card mb-2";
            card.innerHTML = `
            <div class="card-body">
              <h6 class="card-title">${author}</h6>
            </div>`;
            container.appendChild(card);
        });

        const avg = this.grades.length > 0 ? (total / this.grades.length).toFixed(1) : "-";
        document.getElementById("averageGrade").textContent = avg;
    }

    async renderTaskInfo() {
        const titleElem = document.getElementById("solutionModalLabel");
        const descriptionElem = document.querySelector("#solutionModal .modal-body .col-md-8 p");

        let authorName = "Автор неизвестен";
        try {
            const response = await this.api.fetchWithAuth(`/User/profile/${this.taskAuthorId}`);
            if (response.ok) {
                const data = await response.json();
                authorName = `${data.lastName} ${data.firstName}`;
            } else {
                console.warn("Не удалось получить имя автора задания");
            }
        } catch (err) {
            console.error("Ошибка при получении автора:", err);
        }

        // Обновление заголовка модального окна
        titleElem.textContent = `${this.taskTitle} · ${this.taskDate} · ${authorName}`;

        // Обновление содержимого левой части (описание)
        if (descriptionElem) {
            descriptionElem.textContent = this.taskDescription;
        }
    }

    async renderSolution(courseId) {
        try {
            const resp = await this.api.fetchWithAuth(`/Solution/${courseId}/${this.taskId}/list`);
            const data = await resp.json();

            const submittedBlock = document.getElementById("submittedSolution");
            const formBlock = document.getElementById("solutionForm");

            if (data.length === 0) {
                formBlock.style.display = "block";
                submittedBlock.style.display = "none";
            } else {
                const solution = data[0];
                this.solutionId = solution.id; // сохраняем ID решения

                document.getElementById("submittedText").textContent = solution.content;
                const fileList = document.getElementById("solutionFiles");
                fileList.innerHTML = "";

                solution.attachedFiles.forEach(file => {
                    const li = document.createElement("li");
                    li.innerHTML = `<a href="${this.api.baseUrl}/File/${file.id}/download" download>${file.name}</a>`;
                    fileList.appendChild(li);
                });

                formBlock.style.display = "none";
                submittedBlock.style.display = "block";

                const deleteBtn = document.getElementById("deleteSolutionBtn");
                if (deleteBtn) {
                    deleteBtn.onclick = async () => {
                        if (confirm("Вы уверены, что хотите удалить решение?")) {
                            try {
                                const delResp = await this.api.fetchWithAuth(`/Solution/${this.taskId}/${solution.id}`, {
                                    method: "DELETE"
                                });

                                if (!delResp.ok) throw new Error("Ошибка при удалении решения");

                                // Обновим отображение
                                await this.renderSolution(courseId);
                            } catch (err) {
                                console.error("Не удалось удалить решение:", err);
                                alert("Не удалось удалить решение. Повторите попытку.");
                            }
                        }
                    };
                }
            }
        } catch (err) {
            console.error("Ошибка загрузки решения:", err);
        }
    }

    async initModalHandlers(modalId) {
        document.getElementById(modalId).addEventListener('shown.bs.modal', async () => {
            await this.loadDataFromServer();
            await this.renderTaskInfo();
            await this.fetchGrades()
            this.renderFiles();
            this.renderComments();
            this.renderGrades();

            const courseId = getCourseIdFromURL();
            await this.renderSolution(courseId);
        });

        const commentInput = document.getElementById("newComment");
        const commentButton = document.querySelector(".send-comment-2");

        if (commentButton) {
            commentButton.addEventListener("click", async () => {
                await this.sendComment(commentInput.value);
                commentInput.value = "";
            });
        }

        const saveBtn = document.getElementById("saveSolutionBtn");
        if (saveBtn) {
            saveBtn.addEventListener("click", async () => {
                await this.sendSolution();
            });
        }

        const downloadAllBtn = document.getElementById("downloadAllBtn");
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener("click", async () => {
                console.log("djidfjkdjkdfjk")

                await this.downloadAll();
            })
        }

        const appealBtn = document.getElementById("appealBtn");
        if (appealBtn) {
            appealBtn.addEventListener("click", async () => {
                complaintModal.show()
                //await this.postAppeal();
            })
        }
    }

    async postAppeal() {

        // let requestBody = {
        //     description: complaintModal.description,
        //     studentId: userId,
        //     solutionId: complaintModal.id
        // }
        //
        // try {
        //     const response = await this.api.fetchWithAuth('/Report', {
        //         method: 'POST',
        //         body: JSON.stringify(requestBody)
        //     })
        // } catch (e) {
        //
        // }
    }

    async downloadAll() {
        try {
            const response = await this.api.fetchWithAuth(`/Task/${this.taskId}/materialWork`);
            if (!response.ok) {
                throw new Error("Ошибка при получении данных: " + response.statusText);
            }

            const data = await response.json();
            const files = data.attachedFiles || [];

            if (files.length === 0) {
                alert("Нет прикреплённых файлов.");
                return;
            }

            files.forEach(file => {
                // Преобразуем base64 в Blob и скачиваем
                const byteCharacters = atob(file.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray]);

                // Создаем ссылку и кликаем по ней
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = file.name || 'downloaded-file';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        } catch (error) {
            console.error("Ошибка при скачивании файлов:", error);
            alert("Не удалось скачать файлы: " + error.message);
        }
    }
}


function getCourseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}


