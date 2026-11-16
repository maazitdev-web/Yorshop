
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. HTML ELEMENTS
    // ============================================

    const form = document.getElementById("change-password-form");

    const currentPassword = document.getElementById("current-password");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-new-password");

    const message = document.getElementById("password-message");

    // ============================================
    // 2. STORAGE KEYS AND CUSTOMER SESSION
    // ============================================

    const CUSTOMERS_KEY = "yourshop-customers";
    const SESSION_KEY = "yourshop-customer-session";

    let customerSession = null;

    try {
        customerSession = JSON.parse(
            sessionStorage.getItem(SESSION_KEY) || "null"
        );
    } catch (error) {
        customerSession = null;
    }

    if (
        !customerSession ||
        customerSession.role !== "customer" ||
        !customerSession.userId
    ) {
        alert("Please log in to change your password.");
        window.location.replace("./customer-login.html");
        return;
    }

    // ============================================
    // 3. LOAD REGISTERED CUSTOMERS
    // ============================================

    function getCustomers() {
        const customers = JSON.parse(
            localStorage.getItem(CUSTOMERS_KEY) || "[]"
        );

        if (!Array.isArray(customers)) {
            throw new Error("Customer account data is invalid.");
        }

        return customers;
    }

    function showMessage(text, color = "#dc2626") {
        message.textContent = text;
        message.style.color = color;
    }

    // ============================================
    // 4. SHOW / HIDE PASSWORD
    // ============================================

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

    // ============================================
    // 5. UPDATE CUSTOMER PASSWORD
    // ============================================

    form.addEventListener("submit", event => {
        event.preventDefault();

        const current = currentPassword.value;
        const newPass = newPassword.value;
        const confirm = confirmPassword.value;

        if (!current || !newPass || !confirm) {
            showMessage("Please complete all password fields.");
            return;
        }

        if (newPass.length < 8) {
            showMessage(
                "New password must contain at least 8 characters."
            );
            return;
        }

        if (newPass === current) {
            showMessage(
                "Your new password must be different from your current password."
            );
            return;
        }

        if (newPass !== confirm) {
            showMessage("New passwords do not match.");
            return;
        }

        try {
            const customers = getCustomers();

            // Find only the logged-in customer's account.
            const customerIndex = customers.findIndex(customer =>
                String(customer.id) === String(customerSession.userId)
            );

            if (customerIndex === -1) {
                showMessage("Customer account not found.");
                return;
            }

            const customer = customers[customerIndex];

            // Verify the current password.
            if (customer.password !== current) {
                showMessage("Your current password is incorrect.");
                return;
            }

            // Save the new password.
            customers[customerIndex] = {
                ...customer,
                password: newPass
            };

            localStorage.setItem(
                CUSTOMERS_KEY,
                JSON.stringify(customers)
            );

            showMessage(
                "Password updated successfully!",
                "#16a34a"
            );

            form.reset();

            document.querySelectorAll(".toggle-password").forEach(button => {
                button.textContent = "Show";
            });

            console.log("Customer password updated successfully.");

        } catch (error) {
            console.error("Password update error:", error);
            showMessage(
                error.message || "Unable to update your password."
            );
        }
    });

    console.log("YourShop Change Password loaded successfully.");

});
