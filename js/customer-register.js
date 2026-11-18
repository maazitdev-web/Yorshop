
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const form = document.getElementById("customer-register-form");
    const message = document.getElementById("register-message");

    if (!form || !message) return;

    const submitButton = form.querySelector(".account-submit");

    const CUSTOMERS_KEY = "yourshop-customers";

    function getCustomers() {
        try {
            const customers = JSON.parse(
                localStorage.getItem(CUSTOMERS_KEY)
            );

            return Array.isArray(customers) ? customers : [];
        } catch (error) {
            return [];
        }
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim().toLowerCase();
        const phone = document.getElementById("register-phone").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const terms = document.getElementById("accept-terms").checked;

        message.style.color = "#dc2626";
        message.textContent = "";

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

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";
        }

        try {
            const customers = getCustomers();

            const existingCustomer = customers.some(
                customer => customer.email.toLowerCase() === email
            );

            if (existingCustomer) {
                message.textContent = "An account with this email already exists.";
                return;
            }

            const newCustomer = {
                id: Date.now().toString(),
                name,
                email,
                phone,
                password,
                createdAt: new Date().toISOString()
            };

            customers.push(newCustomer);

            localStorage.setItem(
                CUSTOMERS_KEY,
                JSON.stringify(customers)
            );

            message.style.color = "#16a34a";
            message.textContent =
                "Account created successfully! Redirecting to login...";

            form.reset();

            setTimeout(() => {
                window.location.href = "./customer-login.html";
            }, 1500);

        } catch (error) {
            message.style.color = "#dc2626";
            message.textContent = "Unable to save your account in this browser.";
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Create Account";
            }
        }
    });
});
