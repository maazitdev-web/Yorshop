
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("customer-login-form");
    const message = document.getElementById("login-message");

    if (!form) return;

    const submitButton = form.querySelector(".account-submit");

    form.addEventListener("submit", async (event) => {
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

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Signing In...";

            message.style.color = "#2563eb";
            message.textContent = "Verifying your account...";

            const response = await fetch("http://localhost:3000/api/customer/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            // Save customer authentication information
            localStorage.setItem("customerToken", data.token);
            localStorage.setItem("customerUser", JSON.stringify(data.user));

            message.style.color = "#16a34a";
            message.textContent = "Login successful! Redirecting...";

            setTimeout(() => {
                window.location.href = "./customer-dashboard.html";
            }, 1200);

        } catch (error) {
            message.style.color = "#dc2626";
            message.textContent = error.message || "Unable to connect to the server.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Sign In";
        }
    });
});
