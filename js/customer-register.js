
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("customer-register-form");
    const message = document.getElementById("register-message");
    const submitButton = form.querySelector(".account-submit");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
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

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";
            message.style.color = "#2563eb";
            message.textContent = "Please wait while we create your account...";

            const response = await fetch("http://localhost:3000/api/customer/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed.");
            }

            message.style.color = "#16a34a";
            message.textContent = "Account created successfully! Redirecting to login...";

            form.reset();

            setTimeout(() => {
                window.location.href = "./customer-login.html";
            }, 2000);

        } catch (error) {
            message.style.color = "#dc2626";
            message.textContent = error.message || "Unable to connect to the server.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Create Account";
        }
    });
});
