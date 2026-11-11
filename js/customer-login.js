document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("customer-login-form");
    const message = document.getElementById("login-message");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        message.style.color = "#dc2626";

        if (!email || !password) {
            message.textContent = "Please enter your email and password.";
            return;
        }

        if (password.length < 8) {
            message.textContent = "Password must contain at least 8 characters.";
            return;
        }

        message.style.color = "#16a34a";
        message.textContent = "Form validation successful! Login will be connected later.";
    });
});