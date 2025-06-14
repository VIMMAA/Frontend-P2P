const courses = [
    { name: "Матанализ", link: "/courses/math-analysis" },
    { name: "Программирование", link: "/courses/programming" },
    { name: "МКН1", link: "/courses/mkn1" },
    { name: "Парадигмы программирования", link: "/courses/paradigms" },
    { name: "МКН2", link: "/courses/mkn2" }
];

const container = document.getElementById("course-container");

courses.forEach(course => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
    <a href="${course.link}" class="card-link">
      <div class="card course-card h-100 text-center p-4">
        <div class="card-body d-flex flex-column justify-content-center">
          <h5 class="card-title">${course.name}</h5>
        </div>
      </div>
    </a>
  `;

    container.appendChild(col);
});
