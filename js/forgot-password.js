
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgot-password-form");
    const emailInput = document.getElementById("forgot-email");
    const message = document.getElementById("forgot-message");

    if (!form || !emailInput || !message) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        message.style.color = "#dc2626";

        if (!email) {
            message.textContent = "Please enter your email address.";
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            message.textContent = "Please enter a valid email address.";
            return;
        }

        message.style.color = "#16a34a";
        message.textContent =
            "Your email is valid. Password reset will be available when backend authentication is connected.";

        form.reset();
    });
});
