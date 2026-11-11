
/* ==========================================
   YOURSHOP - SHIPPING MANAGEMENT
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. STORAGE
    // ======================================

    const STORAGE_KEY = "yourshop-shipping-methods";

    const shippingForm = document.getElementById("shipping-form");
    const methodList = document.getElementById("shipping-method-list");

    const methodIdInput = document.getElementById("shipping-method-id");
    const nameInput = document.getElementById("shipping-name");
    const typeInput = document.getElementById("shipping-type");
    const priceInput = document.getElementById("shipping-price");
    const minimumInput = document.getElementById("shipping-minimum");
    const daysInput = document.getElementById("shipping-days");
    const zoneInput = document.getElementById("shipping-zone");
    const activeInput = document.getElementById("shipping-active");

    const formTitle = document.getElementById("shipping-form-title");
    const submitButton = document.getElementById("shipping-submit-button");
    const cancelButton = document.getElementById("shipping-cancel-edit");
    const message = document.getElementById("shipping-message");

    const totalMethods = document.getElementById("shipping-total-methods");
    const activeMethods = document.getElementById("shipping-active-methods");
    const totalZones = document.getElementById("shipping-total-zones");
    const freeMethods = document.getElementById("shipping-free-methods");

    if (!shippingForm || !methodList) {
        console.error("Shipping Management elements not found.");
        return;
    }

    // ======================================
    // 2. DEFAULT SHIPPING METHODS
    // ======================================

    const defaultMethods = [
        {
            id: "SHIP-001",
            name: "Standard Delivery",
            type: "standard",
            price: 5,
            minimum: 100,
            days: "3-5 Business Days",
            zone: "All Areas",
            active: true
        },
        {
            id: "SHIP-002",
            name: "Express Delivery",
            type: "express",
            price: 12,
            minimum: 0,
            days: "1-2 Business Days",
            zone: "All Areas",
            active: true
        },
        {
            id: "SHIP-003",
            name: "Overnight Delivery",
            type: "overnight",
            price: 20,
            minimum: 0,
            days: "Next Business Day",
            zone: "Major Cities",
            active: true
        }
    ];

    // ======================================
    // 3. STORAGE HELPERS
    // ======================================

    function loadMethods() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            if (Array.isArray(saved)) {
                return saved;
            }

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(defaultMethods)
            );

            return [...defaultMethods];

        } catch (error) {
            console.error("Could not load shipping methods:", error);
            return [...defaultMethods];
        }
    }

    let shippingMethods = loadMethods();

    function saveMethods() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(shippingMethods)
            );

            return true;

        } catch (error) {
            console.error("Could not save shipping methods:", error);
            showMessage("Could not save shipping methods.", "error");
            return false;
        }
    }

    // ======================================
    // 4. HELPER FUNCTIONS
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$ " + Number(amount).toFixed(2);
    }

    function generateId() {
        return "SHIP-" + Date.now() + "-" +
            Math.floor(Math.random() * 1000);
    }

    function getTypeLabel(type) {
        const labels = {
            standard: "Standard",
            express: "Express",
            overnight: "Overnight"
        };

        return labels[type] || type;
    }

    function showMessage(text, type = "success") {
        message.textContent = text;
        message.className = "shipping-message " + type;

        setTimeout(() => {
            message.textContent = "";
            message.className = "shipping-message";
        }, 3500);
    }

    // ======================================
    // 5. ACTIVITY LOG
    // ======================================

    function logActivity(action, details) {
        if (typeof window.logAdminActivity === "function") {
            window.logAdminActivity(
                action,
                details,
                "shipping"
            );
        }
    }

    // ======================================
    // 6. UPDATE STATISTICS
    // ======================================

    function updateStatistics() {
        totalMethods.textContent = shippingMethods.length;

        activeMethods.textContent =
            shippingMethods.filter(method => method.active).length;

        const zones = new Set(
            shippingMethods.map(method =>
                String(method.zone).trim().toLowerCase()
            ).filter(Boolean)
        );

        totalZones.textContent = zones.size;

        freeMethods.textContent =
            shippingMethods.filter(method =>
                Number(method.minimum) > 0
            ).length;
    }

    // ======================================
    // 7. DISPLAY SHIPPING METHODS
    // ======================================

    function displayMethods() {
        if (shippingMethods.length === 0) {
            methodList.innerHTML = `
                <tr>
                    <td colspan="8" class="shipping-empty">
                        No shipping methods found.
                    </td>
                </tr>
            `;

            updateStatistics();
            return;
        }

        methodList.innerHTML = shippingMethods.map(method => `
            <tr>
                <td>
                    <strong>${escapeHTML(method.name)}</strong>
                </td>

                <td>
                    ${escapeHTML(getTypeLabel(method.type))}
                </td>

                <td>
                    ${formatPrice(method.price)}
                </td>

                <td>
                    ${
                        Number(method.minimum) > 0
                            ? `Free over ${formatPrice(method.minimum)}`
                            : "Not available"
                    }
                </td>

                <td>
                    ${escapeHTML(method.days)}
                </td>

                <td>
                    ${escapeHTML(method.zone)}
                </td>

                <td>
                    <span class="shipping-status ${
                        method.active ? "active" : "inactive"
                    }">
                        ${method.active ? "Active" : "Inactive"}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="shipping-action-button shipping-edit-button"
                        data-action="edit"
                        data-id="${escapeHTML(method.id)}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="shipping-action-button shipping-delete-button"
                        data-action="delete"
                        data-id="${escapeHTML(method.id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");

        updateStatistics();
    }

    // ======================================
    // 8. RESET FORM
    // ======================================

    function resetForm() {
        shippingForm.reset();

        methodIdInput.value = "";
        activeInput.checked = true;

        formTitle.textContent = "Add Shipping Method";
        submitButton.textContent = "Add Shipping Method";

        cancelButton.hidden = true;
    }

    // ======================================
    // 9. ADD / UPDATE SHIPPING METHOD
    // ======================================

    shippingForm.addEventListener("submit", event => {
        event.preventDefault();

        const id = methodIdInput.value.trim();

        const name = nameInput.value.trim();
        const type = typeInput.value;
        const price = Number(priceInput.value);
        const minimum = minimumInput.value.trim() === ""
            ? 0
            : Number(minimumInput.value);

        const days = daysInput.value.trim();
        const zone = zoneInput.value.trim();

        if (
            !name ||
            !days ||
            !zone ||
            !["standard", "express", "overnight"].includes(type) ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isFinite(minimum) ||
            minimum < 0
        ) {
            showMessage("Please enter valid shipping information.", "error");
            return;
        }

        const methodData = {
            name,
            type,
            price,
            minimum,
            days,
            zone,
            active: activeInput.checked
        };

        // UPDATE EXISTING METHOD

        if (id) {
            const index = shippingMethods.findIndex(
                method => String(method.id) === id
            );

            if (index === -1) {
                showMessage("Shipping method not found.", "error");
                return;
            }

            const oldName = shippingMethods[index].name;

            shippingMethods[index] = {
                ...shippingMethods[index],
                ...methodData
            };

            if (!saveMethods()) return;

            logActivity(
                "Shipping method updated",
                `${oldName} was updated.`
            );

            showMessage("Shipping method updated successfully.");

        } else {

            // ADD NEW METHOD

            methodData.id = generateId();

            shippingMethods.unshift(methodData);

            if (!saveMethods()) {
                shippingMethods.shift();
                return;
            }

            logActivity(
                "Shipping method added",
                `${methodData.name} was added.`
            );

            showMessage("Shipping method added successfully.");
        }

        resetForm();
        displayMethods();
    });

    // ======================================
    // 10. EDIT / DELETE METHODS
    // ======================================

    methodList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        const method = shippingMethods.find(
            item => String(item.id) === id
        );

        if (!method) return;

        // EDIT

        if (action === "edit") {
            methodIdInput.value = method.id;
            nameInput.value = method.name;
            typeInput.value = method.type;
            priceInput.value = method.price;
            minimumInput.value = method.minimum;
            daysInput.value = method.days;
            zoneInput.value = method.zone;
            activeInput.checked = method.active;

            formTitle.textContent = "Edit Shipping Method";
            submitButton.textContent = "Update Shipping Method";
            cancelButton.hidden = false;

            shippingForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        // DELETE

        if (action === "delete") {
            const confirmed = confirm(
                `Are you sure you want to delete "${method.name}"?`
            );

            if (!confirmed) return;

            shippingMethods = shippingMethods.filter(
                item => String(item.id) !== id
            );

            if (!saveMethods()) return;

            logActivity(
                "Shipping method deleted",
                `${method.name} was deleted.`
            );

            displayMethods();
            showMessage("Shipping method deleted successfully.");
        }
    });

    // ======================================
    // 11. CANCEL EDIT
    // ======================================

    cancelButton.addEventListener("click", () => {
        resetForm();
        showMessage("Editing cancelled.");
    });

    // ======================================
    // 12. INITIALIZE
    // ======================================

    displayMethods();

    console.log("YourShop Shipping Management loaded successfully.");

});
