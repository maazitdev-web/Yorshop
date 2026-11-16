
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. HTML ELEMENTS
    // ============================================

    const form = document.getElementById("forgot-password-form");
    const emailInput = document.getElementById("forgot-email");
    const message = document.getElementById("forgot-message");

    const emailStep = document.getElementById("email-step");
    const resetStep = document.getElementById("reset-step");

    const resetCodeInput = document.getElementById("reset-code");
    const newPasswordInput = document.getElementById("reset-new-password");
    const confirmPasswordInput = document.getElementById("reset-confirm-password");

    const updateButton = document.getElementById("update-password-btn");

    // ============================================
    // 2. STORAGE
    // ============================================

    const CUSTOMERS_KEY = "yourshop-customers";

    let selectedCustomerId = null;
    let recoveryCode = null;

    // ============================================
    // 3. MESSAGE
    // ============================================

    function showMessage(text, color = "#dc2626") {
        message.textContent = text;
        message.style.color = color;
    }

    // ============================================
    // 4. FIND CUSTOMER ACCOUNT
    // ============================================

    form.addEventListener("submit", event => {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();

        if (!email) {
            showMessage("Please enter your email address.");
            return;
        }

        try {
            const customers = JSON.parse(
                localStorage.getItem(CUSTOMERS_KEY) || "[]"
            );

            if (!Array.isArray(customers)) {
                throw new Error("Customer account data is invalid.");
            }

            const customer = customers.find(user =>
                String(user.email || "").trim().toLowerCase() === email
            );

            if (!customer) {
                showMessage("No account was found with this email address.");
                return;
            }

            selectedCustomerId = customer.id;

            // Generate a six-digit demo recovery code.
            recoveryCode = String(
                Math.floor(100000 + Math.random() * 900000)
            );

            emailStep.hidden = true;
            resetStep.hidden = false;

            showMessage(
                "Demo recovery code: " + recoveryCode,
                "#16a34a"
            );

            console.log("Demo recovery code generated.");

        } catch (error) {
            console.error("Account lookup error:", error);
            showMessage(error.message || "Unable to find your account.");
        }
    });

    // ============================================
    // 5. UPDATE PASSWORD
    // ============================================

    updateButton.addEventListener("click", () => {
        const enteredCode = resetCodeInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!enteredCode || !newPassword || !confirmPassword) {
            showMessage("Please complete all fields.");
            return;
        }

        if (enteredCode !== recoveryCode) {
            showMessage("Incorrect recovery code.");
            return;
        }

        if (newPassword.length < 8) {
            showMessage("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("New passwords do not match.");
            return;
        }

        try {
            const customers = JSON.parse(
                localStorage.getItem(CUSTOMERS_KEY) || "[]"
            );

            if (!Array.isArray(customers)) {
                throw new Error("Customer account data is invalid.");
            }

            const customerIndex = customers.findIndex(customer =>
                String(customer.id) === String(selectedCustomerId)
            );

            if (customerIndex === -1) {
                throw new Error("Customer account could not be found.");
            }

            // Update only the selected customer's password.
            customers[customerIndex] = {
                ...customers[customerIndex],
                password: newPassword
            };

            localStorage.setItem(
                CUSTOMERS_KEY,
                JSON.stringify(customers)
            );

            showMessage(
                "Password reset successfully! Redirecting to login...",
                "#16a34a"
            );

            // Prevent reuse of the recovery code.
            recoveryCode = null;
            selectedCustomerId = null;

            updateButton.disabled = true;

            setTimeout(() => {
                window.location.href = "./customer-login.html";
            }, 1800);

        } catch (error) {
            console.error("Password reset error:", error);
            showMessage(error.message || "Unable to reset your password.");
        }
    });

    console.log("YourShop Forgot Password loaded successfully.");
});
