// Toggle between the login form and register form
function showForm(formID) {
    document.querySelectorAll(".formBox").forEach(form => form.classList.remove("active"));
    document.getElementById(formID).classList.add("active");
}

// ==========================
// Mock authentication
// In a real app, these would send data to a backend API (fetch + POST)
// and the backend would return a real user + role after checking the database.
// Here we just simulate it so you can see how the "role decides the view" idea works.
// ==========================

const loginForm = document.getElementById("loginFormEl");
const registerForm = document.getElementById("registerFormEl");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // stop the page from reloading

    const email = loginForm.email.value;

    // Mock rule just for this demo: if the email contains "provider",
    // log the user in as a Game Companion. Otherwise, log in as a Player.
    // (A real app would look this up from the database instead.)
    const role = email.toLowerCase().includes("provider") ? "provider" : "user";
    const name = email.split("@")[0];

    saveCurrentUser({ name, email, role });
    window.location.href = "dashboard.html";
});

registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = registerForm.name.value;
    const email = registerForm.email.value;
    const role = registerForm.role.value;

    if (!role) {
        alert("Please select a role.");
        return;
    }

    saveCurrentUser({ name, email, role });
    window.location.href = "dashboard.html";
});

// Store the "logged in" user in localStorage so dashboard.html can read it.
// This is only for this demo — a real app would use a proper auth token/session instead.
function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

// ==========================
// Testing shortcut — skips the form entirely and jumps straight to
// dashboard.html with a fake logged-in user, so you can quickly check
// how each view looks without typing in the form every time.
// Remove this before treating the project as a real app.
// ==========================
function testLogin(role) {
    const fakeUser = {
        name: role === "provider" ? "TestCompanion" : "TestPlayer",
        email: role === "provider" ? "provider@test.com" : "player@test.com",
        role: role
    };
    saveCurrentUser(fakeUser);
    window.location.href = "dashboard.html";
}