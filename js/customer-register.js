document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("customer-register-form");
    const message = document.getElementById("register-message");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const phone = document.getElementById("register-phone").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const terms = document.getElementById("accept-terms").checked;

        message.style.color = "#dc2626";

        if (!name || !email || !phone || !password || !confirmPassword) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        if (password.length < 8) {
            message.textContent = "Password must contain at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (!terms) {
            message.textContent = "Please accept the Terms and Conditions.";
            return;
        }

        message.style.color = "#16a34a";
        message.textContent = "Form validation successful! Account creation will be connected later.";
    });
});