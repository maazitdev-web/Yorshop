
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const form = document.getElementById("admin-login-form");
    const message = document.getElementById("login-message");
    const loginButton = document.getElementById("login-button");

    if (!form || !message || !loginButton) return;

    const ADMIN_EMAIL = "admin@yourshop.com";
    const ADMIN_PASSWORD = "admin123";

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("admin-email")
            .value.trim().toLowerCase();

        const password = document.getElementById("admin-password").value;

        message.textContent = "";
        message.className = "message";

        if (!email || !password) {
            message.textContent = "Please enter your email and password.";
            message.classList.add("error");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        if (
            email !== ADMIN_EMAIL ||
            password !== ADMIN_PASSWORD
        ) {
            message.textContent = "Invalid admin email or password.";
            message.classList.add("error");

            loginButton.disabled = false;
            loginButton.textContent = "Login to Dashboard";
            return;
        }

        const adminSession = {
            role: "admin",
            email: ADMIN_EMAIL,
            loggedInAt: new Date().toISOString()
        };

        sessionStorage.setItem(
            "yourshop-admin-session",
            JSON.stringify(adminSession)
        );

        message.textContent = "Login successful! Redirecting...";
        message.classList.add("success");

        setTimeout(() => {
            window.location.href = "./admin.html";
        }, 800);
    });
});

