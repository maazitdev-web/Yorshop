
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const form = document.getElementById("customer-register-form");
    const message = document.getElementById("register-message");

    if (!form || !message) return;

    const submitButton = form.querySelector(".account-submit");

    // ======================================
    // 2. LOCAL STORAGE KEY
    // ======================================

    const CUSTOMERS_KEY = "yourshop-customers";

    // ======================================
    // 3. GET REGISTERED CUSTOMERS
    // ======================================

    function getCustomers() {
        try {
            const customers = JSON.parse(
                localStorage.getItem(CUSTOMERS_KEY) || "[]"
            );

            return Array.isArray(customers) ? customers : [];

        } catch (error) {
            console.error("Customer storage error:", error);
            return [];
        }
    }

    // ======================================
    // 4. REGISTRATION FORM
    // ======================================

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();

        const email = document
            .getElementById("register-email")
            .value.trim()
            .toLowerCase();

        const phone = document.getElementById("register-phone").value.trim();

        const password = document.getElementById("register-password").value;

        const confirmPassword = document.getElementById("confirm-password").value;

        const terms = document.getElementById("accept-terms").checked;

        // ==================================
        // 5. VALIDATION
        // ==================================

        message.style.color = "#dc2626";
        message.textContent = "";

        if (!name || !email || !phone || !password || !confirmPassword) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        if (password.length < 8) {
            message.textContent =
                "Password must contain at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (!terms) {
            message.textContent =
                "Please accept the Terms and Conditions.";
            return;
        }

        // ==================================
        // 6. CREATE CUSTOMER ACCOUNT
        // ==================================

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";
        }

        try {
            const customers = getCustomers();

            // Check duplicate email
            const existingCustomer = customers.some(
                customer =>
                    customer.email &&
                    customer.email.toLowerCase() === email
            );

            if (existingCustomer) {
                message.textContent =
                    "An account with this email already exists.";
                return;
            }

            // Create customer object
            const newCustomer = {
                id: Date.now().toString(),
                name: name,
                email: email,
                phone: phone,
                password: password,
                createdAt: new Date().toISOString()
            };

            // Save customer
            customers.push(newCustomer);

            localStorage.setItem(
                CUSTOMERS_KEY,
                JSON.stringify(customers)
            );

            // ==================================
            // 7. SUCCESS MESSAGE
            // ==================================

            message.style.color = "#16a34a";

            message.textContent =
                "Account created successfully! Redirecting to login...";

            form.reset();

setTimeout(() => {
    window.location.replace("./customer-login.html");
}, 1500);

        } catch (error) {
            console.error("Registration error:", error);

            message.style.color = "#dc2626";

            message.textContent =
                "Unable to save your account in this browser.";

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Create Account";
            }
        }
    });
});
