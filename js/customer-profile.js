
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

    // Sidebar elements
    const sidebarName = document.querySelector(".profile-user h3");
    const sidebarEmail = document.querySelector(".profile-user p");

    const API_URL = "http://localhost:3000/api/customer/me";

    let originalValues = {};

    // ============================================
    // 2. DISPLAY PROFILE MESSAGE
    // ============================================

    function showMessage(text, color) {
        message.textContent = text;
        message.style.color = color;
    }

    // ============================================
    // 3. ENABLE / DISABLE FORM
    // ============================================

    function setEditMode(enabled) {
        nameInput.disabled = !enabled;
        phoneInput.disabled = !enabled;

        // Email and country remain read-only.
        emailInput.disabled = true;
        countryInput.disabled = true;

        editButton.hidden = enabled;
        saveButton.hidden = !enabled;
        cancelButton.hidden = !enabled;
    }

    // ============================================
    // 4. DISPLAY CUSTOMER INFORMATION
    // ============================================

    function displayProfile(customer) {
        nameInput.value = customer.name || "";
        emailInput.value = customer.email || "";
        phoneInput.value = customer.phone || "";

        // Country is not stored in the current users table.
        countryInput.value = "";

        if (sidebarName) {
            sidebarName.textContent = customer.name || "Customer";
        }

        if (sidebarEmail) {
            sidebarEmail.textContent = customer.email || "";
        }
    }

    // ============================================
    // 5. LOAD CUSTOMER PROFILE FROM BACKEND
    // ============================================

    async function loadProfile() {
        const token = localStorage.getItem("customerToken");

        if (!token) {
            showMessage(
                "Please log in to view your profile.",
                "#dc2626"
            );

            editButton.disabled = true;
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load profile."
                );
            }

            if (!data.user) {
                throw new Error("Customer profile not found.");
            }

            displayProfile(data.user);

            originalValues = {
                name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                country: countryInput.value
            };

            localStorage.setItem(
                "yourshop-profile",
                JSON.stringify(data.user)
            );

            console.log("Customer profile loaded successfully.");

        } catch (error) {
            console.error("Profile loading error:", error);

            showMessage(
                error.message || "Unable to load your profile.",
                "#dc2626"
            );
        }
    }

    // ============================================
    // 6. EDIT PROFILE BUTTON
    // ============================================

    editButton.addEventListener("click", () => {
        originalValues = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            country: countryInput.value
        };

        setEditMode(true);

        showMessage("", "");
        nameInput.focus();
    });

    // ============================================
    // 7. CANCEL EDITING
    // ============================================

    cancelButton.addEventListener("click", () => {
        nameInput.value = originalValues.name;
        emailInput.value = originalValues.email;
        phoneInput.value = originalValues.phone;
        countryInput.value = originalValues.country;

        setEditMode(false);

        showMessage("Changes discarded.", "#64748b");
    });

    // ============================================
    // 8. SAVE PROFILE TO DATABASE
    // ============================================

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("customerToken");

        if (!token) {
            showMessage(
                "Please log in again to update your profile.",
                "#dc2626"
            );
            return;
        }

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

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

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update profile."
                );
            }

            if (!data.user) {
                throw new Error("Updated profile data is missing.");
            }

            // Display updated customer information.
            displayProfile(data.user);

            // Save updated profile locally.
            localStorage.setItem(
                "yourshop-profile",
                JSON.stringify(data.user)
            );

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
    // 9. INITIALIZE PROFILE PAGE
    // ============================================

    setEditMode(false);
    loadProfile();

});
