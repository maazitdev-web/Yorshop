
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("change-password-form");

    const currentPassword = document.getElementById("current-password");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-new-password");

    const message = document.getElementById("password-message");

    // SHOW / HIDE PASSWORD
    document.querySelectorAll(".toggle-password").forEach(button => {

        button.addEventListener("click", () => {

            const input = document.getElementById(button.dataset.target);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                button.textContent = "Hide";
            } else {
                input.type = "password";
                button.textContent = "Show";
            }

        });

    });

    // PASSWORD FORM VALIDATION
    form.addEventListener("submit", event => {

        event.preventDefault();

        const current = currentPassword.value;
        const newPass = newPassword.value;
        const confirm = confirmPassword.value;

        message.style.color = "#dc2626";

        if (!current || !newPass || !confirm) {
            message.textContent = "Please complete all password fields.";
            return;
        }

        if (newPass.length < 8) {
            message.textContent = "New password must contain at least 8 characters.";
            return;
        }

        if (newPass === current) {
            message.textContent = "Your new password must be different from your current password.";
            return;
        }

        if (newPass !== confirm) {
            message.textContent = "New passwords do not match.";
            return;
        }

        message.style.color = "#16a34a";

        message.textContent =
            "Validation successful! Password updating will be connected when backend authentication is ready.";

        form.reset();

        document.querySelectorAll(".toggle-password").forEach(button => {
            button.textContent = "Show";
        });

    });

    console.log("YourShop Change Password loaded successfully.");

});
