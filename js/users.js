document.addEventListener("DOMContentLoaded", () => {
    const users = [
        { firstName: "Иван", lastName: "Иванов" },
        { firstName: "Мария", lastName: "Петрова" },
        { firstName: "Алексей", lastName: "Сидоров" },
        { firstName: "Ольга", lastName: "Кузнецова" },
        { firstName: "Дмитрий", lastName: "Смирнов" },
        { firstName: "Екатерина", lastName: "Орлова" },
        { firstName: "Никита", lastName: "Волков" },
        { firstName: "Иван", lastName: "Иванов" },
        { firstName: "Мария", lastName: "Петрова" },
        { firstName: "Алексей", lastName: "Сидоров" },
        { firstName: "Ольга", lastName: "Кузнецова" },
        { firstName: "Дмитрий", lastName: "Смирнов" },
        { firstName: "Екатерина", lastName: "Орлова" },
        { firstName: "Никита", lastName: "Волков" },
        { firstName: "Иван", lastName: "Иванов" },
        { firstName: "Мария", lastName: "Петрова" },
        { firstName: "Алексей", lastName: "Сидоров" },
        { firstName: "Ольга", lastName: "Кузнецова" },
        { firstName: "Дмитрий", lastName: "Смирнов" },
        { firstName: "Екатерина", lastName: "Орлова" },
        { firstName: "Никита", lastName: "Волков" },
    ];

    const listGroup = document.createElement("ul");
    listGroup.className = "list-group";

    users.forEach((user, index) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex align-items-center";

        const avatar = document.createElement("img");
        avatar.src = `https://i.pravatar.cc/40?img=${index + 1}`;
        avatar.alt = "Аватар";
        avatar.className = "rounded-circle me-3";
        avatar.width = 40;
        avatar.height = 40;

        const fullName = document.createElement("span");
        fullName.textContent = `${user.firstName} ${user.lastName}`;

        listItem.appendChild(avatar);
        listItem.appendChild(fullName);
        listGroup.appendChild(listItem);
    });

    document.querySelector(".container").appendChild(listGroup);
});
