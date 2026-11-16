
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const form = document.getElementById("customer-login-form");
    const message = document.getElementById("login-message");

    if (!form || !message) return;

    const submitButton = form.querySelector(".account-submit");

    // ======================================
    // 2. STORAGE KEYS
    // ======================================

    const CUSTOMERS_KEY = "yourshop-customers";
    const SESSION_KEY = "yourshop-customer-session";

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
    // 4. LOGIN FORM
    // ======================================

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document
            .getElementById("login-email")
            .value.trim()
            .toLowerCase();

        const password = document
            .getElementById("login-password")
            .value;

        message.style.color = "#dc2626";
        message.textContent = "";

        // ==================================
        // 5. VALIDATION
        // ==================================

        if (!email || !password) {
            message.textContent =
                "Please enter your email and password.";
            return;
        }

        if (password.length < 8) {
            message.textContent =
                "Password must contain at least 8 characters.";
            return;
        }

        // ==================================
        // 6. CHECK CUSTOMER ACCOUNT
        // ==================================

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Signing In...";
        }

        try {
            const customers = getCustomers();

            const customer = customers.find(
                user =>
                    user.email &&
                    user.email.toLowerCase() === email &&
                    user.password === password
            );

            if (!customer) {
                message.textContent = "Invalid email or password.";
                return;
            }

            // ==================================
            // 7. CREATE COMPATIBLE SESSION
            // ==================================

            const customerId = customer.id || customer.userId;

            if (!customerId) {
                message.textContent =
                    "Customer account ID is missing.";
                return;
            }

            const customerSession = {
                id: customerId,
                userId: customerId,
                role: "customer",
                name: customer.name || "",
                email: customer.email || "",
                phone: customer.phone || "",
                loggedInAt: new Date().toISOString()
            };

            // Save the same session in both storage types.
            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(customerSession)
            );

            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify(customerSession)
            );

            // ==================================
            // 8. SUCCESS
            // ==================================

            message.style.color = "#16a34a";
            message.textContent =
                "Login successful! Redirecting...";

            window.location.href = "./customer-dashboard.html";

        } catch (error) {
            console.error("Login error:", error);

            message.textContent =
                "Unable to log in. Please try again.";

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Sign In";
            }
        }
    });
});
