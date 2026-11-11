
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // 1. STORAGE
    // ==========================================

    const ADDRESSES_KEY = "yourshop-saved-addresses";

    const addressGrid = document.getElementById("address-grid");
    const addressForm = document.getElementById("address-form");
    const formWrapper = document.getElementById("address-form-wrapper");
    const formTitle = document.getElementById("address-form-title");
    const addressMessage = document.getElementById("address-message");

    const addButton = document.getElementById("add-address-btn");
    const cancelButton = document.getElementById("cancel-address-btn");

    let editingAddressId = null;

    // ==========================================
    // 2. LOAD AND SAVE ADDRESSES
    // ==========================================

    function loadAddresses() {
        try {
            const saved = JSON.parse(localStorage.getItem(ADDRESSES_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not load addresses:", error);
            return [];
        }
    }

    function saveAddresses(addresses) {
        try {
            localStorage.setItem(
                ADDRESSES_KEY,
                JSON.stringify(addresses)
            );
            return true;
        } catch (error) {
            console.error("Could not save addresses:", error);
            showMessage("Unable to save address. Please try again.", "error");
            return false;
        }
    }

    // ==========================================
    // 3. SECURITY: ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    // ==========================================
    // 4. SHOW MESSAGE
    // ==========================================

    function showMessage(message, type = "success") {
        addressMessage.textContent = message;
        addressMessage.style.color =
            type === "success" ? "#15803d" : "#dc2626";
    }

    // ==========================================
    // 5. DISPLAY ADDRESSES
    // ==========================================

    function displayAddresses() {
        const addresses = loadAddresses();

        if (addresses.length === 0) {
            addressGrid.innerHTML = `
                <div class="empty-addresses">
                    <div class="empty-icon">📍</div>
                    <h3>No Saved Addresses</h3>
                    <p>Add an address for faster checkout.</p>
                </div>
            `;
            return;
        }

        addressGrid.innerHTML = addresses.map(address => `
            <article class="address-card ${address.isDefault ? "default" : ""}">

                ${address.isDefault
                    ? '<span class="default-badge">DEFAULT ADDRESS</span>'
                    : ""
                }

                <h3>
                    ${escapeHTML(address.type)} Address
                </h3>

                <p>
                    <strong>${escapeHTML(address.name)}</strong><br>
                    ${escapeHTML(address.phone)}<br>
                    ${escapeHTML(address.details)}<br>
                    ${escapeHTML(address.city)},
                    ${escapeHTML(address.postalCode)}<br>
                    ${escapeHTML(address.country)}
                </p>

                <div class="address-actions">

                    <button class="address-action edit-address"
                        data-action="edit"
                        data-id="${escapeHTML(address.id)}">
                        Edit
                    </button>

                    <button class="address-action delete-address"
                        data-action="delete"
                        data-id="${escapeHTML(address.id)}">
                        Delete
                    </button>

                    ${!address.isDefault ? `
                        <button class="address-action default-address"
                            data-action="default"
                            data-id="${escapeHTML(address.id)}">
                            Set as Default
                        </button>
                    ` : ""}

                </div>

            </article>
        `).join("");
    }

    // ==========================================
    // 6. OPEN FORM
    // ==========================================

    function openForm(address = null) {
        addressForm.reset();
        editingAddressId = address ? address.id : null;

        formTitle.textContent = address
            ? "Edit Address"
            : "Add New Address";

        if (address) {
            document.getElementById("address-name").value = address.name;
            document.getElementById("address-phone").value = address.phone;
            document.getElementById("address-type").value = address.type;
            document.getElementById("address-country").value = address.country;
            document.getElementById("address-city").value = address.city;
            document.getElementById("address-postal").value = address.postalCode;
            document.getElementById("address-details").value = address.details;
        }

        addressMessage.textContent = "";
        formWrapper.classList.add("show");

        formWrapper.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function closeForm() {
        formWrapper.classList.remove("show");
        addressForm.reset();
        editingAddressId = null;
        addressMessage.textContent = "";
    }

    addButton.addEventListener("click", () => {
        openForm();
    });

    cancelButton.addEventListener("click", closeForm);

    // ==========================================
    // 7. ADD OR UPDATE ADDRESS
    // ==========================================

    addressForm.addEventListener("submit", event => {
        event.preventDefault();

        const addresses = loadAddresses();

        const address = {
            id: editingAddressId || (
                "ADDR-" + Date.now() + "-" +
                Math.random().toString(36).slice(2, 7)
            ),

            name: document.getElementById("address-name").value.trim(),
            phone: document.getElementById("address-phone").value.trim(),
            type: document.getElementById("address-type").value,
            country: document.getElementById("address-country").value.trim(),
            city: document.getElementById("address-city").value.trim(),
            postalCode: document.getElementById("address-postal").value.trim(),
            details: document.getElementById("address-details").value.trim(),

            isDefault: false
        };

        if (
            !address.name ||
            !address.phone ||
            !address.country ||
            !address.city ||
            !address.details
        ) {
            showMessage("Please complete all required fields.", "error");
            return;
        }

        if (editingAddressId) {
            const index = addresses.findIndex(
                item => item.id === editingAddressId
            );

            if (index === -1) {
                showMessage("Address not found. Please refresh the page.", "error");
                return;
            }

            address.isDefault = addresses[index].isDefault;
            addresses[index] = address;

        } else {
            address.isDefault = addresses.length === 0;
            addresses.push(address);
        }

        if (!saveAddresses(addresses)) return;

        displayAddresses();
        closeForm();

        alert(
            editingAddressId
                ? "Address updated successfully!"
                : "Address saved successfully!"
        );
    });

    // ==========================================
    // 8. EDIT, DELETE AND SET DEFAULT
    // ==========================================

    addressGrid.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const addressId = button.dataset.id;

        const addresses = loadAddresses();

        const index = addresses.findIndex(
            address => address.id === addressId
        );

        if (index === -1) return;

        if (action === "edit") {
            openForm(addresses[index]);
        }

        if (action === "delete") {
            const confirmed = confirm(
                "Are you sure you want to delete this address?"
            );

            if (!confirmed) return;

            addresses.splice(index, 1);

            // Keep one default address if any addresses remain.
            if (
                addresses.length > 0 &&
                !addresses.some(address => address.isDefault)
            ) {
                addresses[0].isDefault = true;
            }

            if (!saveAddresses(addresses)) return;

            displayAddresses();
        }

        if (action === "default") {
            addresses.forEach(address => {
                address.isDefault = address.id === addressId;
            });

            if (!saveAddresses(addresses)) return;

            displayAddresses();
        }
    });

    // ==========================================
    // 9. INITIALIZE
    // ==========================================

    displayAddresses();

});
