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
