
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. GET HTML ELEMENTS
    // ============================================

    const form = document.getElementById("profile-form");

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");
    const countryInput = document.getElementById("profile-country");

    const editButton = document.getElementById("edit-profile");
    const saveButton = document.getElementById("save-profile");
    const cancelButton = document.getElementById("cancel-profile");

    const message = document.getElementById("profile-message");

    const sidebarName = document.querySelector(".profile-user h3");
    const sidebarEmail = document.querySelector(".profile-user p");
sessionStorage.setItem(
    CUSTOMER_SESSION_KEY,
    JSON.stringify(customerSession)
);
    // ============================================
    // 3. DISPLAY MESSAGE
    // ============================================

    function showMessage(text, color = "#64748b") {
        message.textContent = text;
        message.style.color = color;
    }

    // ============================================
    // 4. EDIT MODE
    // ============================================

    function setEditMode(enabled) {
        nameInput.disabled = !enabled;
        phoneInput.disabled = !enabled;
        countryInput.disabled = !enabled;

        // Email cannot be changed here.
        emailInput.disabled = true;

        editButton.hidden = enabled;
        saveButton.hidden = !enabled;
        cancelButton.hidden = !enabled;
    }

    // ============================================
    // 5. DISPLAY CUSTOMER INFORMATION
    // ============================================

    function displayProfile(customer) {
        nameInput.value = customer.name || "";
        emailInput.value = customer.email || "";
        phoneInput.value = customer.phone || "";
        countryInput.value = customer.country || "";

        if (sidebarName) {
            sidebarName.textContent = customer.name || "Customer";
        }

        if (sidebarEmail) {
            sidebarEmail.textContent = customer.email || "";
        }
    }

    // ============================================
    // 6. LOAD CUSTOMER PROFILE
    // ============================================

    function loadProfile() {
        try {
            const customers = JSON.parse(
                localStorage.getItem(CUSTOMERS_KEY) || "[]"
            );

            if (!Array.isArray(customers)) {
                throw new Error("Customer data is invalid.");
            }

            currentCustomer = customers.find(customer =>
                String(customer.id) === String(customerSession.userId)
            );

            if (!currentCustomer) {
                throw new Error("Your customer account could not be found.");
            }

            displayProfile(currentCustomer);

            originalValues = {
                name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                country: countryInput.value
            };

            console.log("Customer profile loaded successfully.");

        } catch (error) {
            console.error("Profile loading error:", error);
            showMessage(error.message, "#dc2626");
            editButton.disabled = true;
        }
    }

    // ============================================
    // 7. EDIT PROFILE
    // ============================================

    editButton.addEventListener("click", () => {
        originalValues = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            country: countryInput.value
        };

        setEditMode(true);
        showMessage("");
        nameInput.focus();
    });

    // ============================================
    // 8. CANCEL EDITING
    // ============================================

    cancelButton.addEventListener("click", () => {
        nameInput.value = originalValues.name;
        emailInput.value = originalValues.email;
        phoneInput.value = originalValues.phone;
        countryInput.value = originalValues.country;

        setEditMode(false);
        showMessage("Changes discarded.");
    });

    // ============================================
    // 9. SAVE PROFILE
    // ============================================

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const country = countryInput.value.trim();

        if (!name) {
            showMessage("Please enter your full name.", "#dc2626");
            nameInput.focus();
            return;
        }

        if (name.length > 100) {
            showMessage(
                "Name cannot exceed 100 characters.",
                "#dc2626"
            );
            return;
        }

        if (phone.length > 30) {
            showMessage(
                "Phone number cannot exceed 30 characters.",
                "#dc2626"
            );
            return;
        }

        if (country.length > 60) {
            showMessage(
                "Country cannot exceed 60 characters.",
                "#dc2626"
            );
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const customers = JSON.parse(
                localStorage.getItem(CUSTOMERS_KEY) || "[]"
            );

            if (!Array.isArray(customers)) {
                throw new Error("Customer data is invalid.");
            }

            const customerIndex = customers.findIndex(customer =>
                String(customer.id) === String(customerSession.userId)
            );

            if (customerIndex === -1) {
                throw new Error("Customer account not found.");
            }

            // Update only the logged-in customer's record.
            customers[customerIndex] = {
                ...customers[customerIndex],
                name,
                phone,
                country
            };

            localStorage.setItem(
                CUSTOMERS_KEY,
                JSON.stringify(customers)
            );

            currentCustomer = customers[customerIndex];

            // Update the active customer session.
            customerSession.name = name;
            customerSession.phone = phone;

localStorage.setItem(
    CUSTOMER_SESSION_KEY,
    JSON.stringify(customerSession)
);

            displayProfile(currentCustomer);

            originalValues = {
                name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                country: countryInput.value
            };

            setEditMode(false);

            showMessage(
                "Your profile has been updated successfully!",
                "#16a34a"
            );

            console.log("Customer profile updated successfully.");

        } catch (error) {
            console.error("Profile update error:", error);
            showMessage(
                error.message || "Unable to update your profile.",
                "#dc2626"
            );

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Changes";
        }
    });

    // ============================================
    // 10. INITIALIZE PROFILE PAGE
    // ============================================

    setEditMode(false);
    loadProfile();

});
