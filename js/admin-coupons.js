
// ============================================
// YOURSHOP - ADMIN COUPON MANAGEMENT
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. STORAGE
    // ============================================

    const STORAGE_KEY = "yourshop-coupons";

    function loadCoupons() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Could not load coupons:", error);
            return [];
        }
    }

    function saveCoupons(coupons) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(coupons)
            );

            return true;
        } catch (error) {
            console.error("Could not save coupons:", error);
            alert("Could not save coupons. Please try again.");
            return false;
        }
    }

    let coupons = loadCoupons();

    // ============================================
    // 2. HTML ELEMENTS
    // ============================================

    const couponForm = document.getElementById("coupon-form");

    const codeInput = document.getElementById("coupon-admin-code");
    const typeInput = document.getElementById("coupon-type");
    const valueInput = document.getElementById("coupon-value");
    const minOrderInput = document.getElementById("coupon-min-order");
    const maxDiscountInput = document.getElementById("coupon-max-discount");
    const expiryInput = document.getElementById("coupon-expiry");
    const usageLimitInput = document.getElementById("coupon-usage-limit");
    const statusInput = document.getElementById("coupon-status");

    const editCodeInput = document.getElementById("coupon-edit-code");

    const formTitle = document.getElementById("coupon-form-title");
    const saveButton = document.getElementById("coupon-save-button");
    const cancelButton = document.getElementById("coupon-cancel-edit");
    const formMessage = document.getElementById("coupon-form-message");

    const tableBody = document.getElementById("coupon-table-body");
    const searchInput = document.getElementById("coupon-search");
    const resultsCount = document.getElementById("coupon-results-count");

    // ============================================
    // 3. HELPERS
    // ============================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function normalizeCode(code) {
        return String(code || "").trim().toUpperCase();
    }

    // Record admin activity.
    function logCouponActivity(action, details) {
        if (typeof window.logAdminActivity === "function") {
            window.logAdminActivity(
                action,
                details,
                "coupons"
            );
        }
    }

    function isExpired(coupon) {
        const expiry = coupon.expiryDate || coupon.expiry;

        if (!expiry) return false;

        const date = new Date(expiry);

        if (Number.isNaN(date.getTime())) return true;

        if (/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
            date.setHours(23, 59, 59, 999);
        }

        return new Date() > date;
    }

    function getDiscountLabel(coupon) {
        const type = coupon.type || coupon.discountType || "percentage";
        const value = Number(coupon.value ?? coupon.discountValue) || 0;

        return type === "fixed"
            ? "$" + value.toFixed(2) + " off"
            : value + "% off";
    }

    function getExpiryLabel(coupon) {
        const expiry = coupon.expiryDate || coupon.expiry;

        if (!expiry) return "No expiry";

        return escapeHTML(expiry);
    }

    function getUsageLabel(coupon) {
        const used = Number(coupon.usedCount) || 0;
        const limit = Number(coupon.usageLimit) || 0;

        return limit > 0
            ? `${used} / ${limit}`
            : `${used} / Unlimited`;
    }

    function showMessage(message, success) {
        formMessage.textContent = message;

        formMessage.style.color = success
            ? "#16a34a"
            : "#dc2626";
    }

    // ============================================
    // 4. UPDATE STATISTICS
    // ============================================

    function updateStatistics() {
        const total = coupons.length;

        const active = coupons.filter(coupon =>
            coupon.active !== false
        ).length;

        const inactive = total - active;

        const uses = coupons.reduce((sum, coupon) => {
            return sum + (Number(coupon.usedCount) || 0);
        }, 0);

        document.getElementById("coupon-total").textContent = total;
        document.getElementById("coupon-active").textContent = active;
        document.getElementById("coupon-inactive").textContent = inactive;
        document.getElementById("coupon-uses").textContent = uses;
    }

    // ============================================
    // 5. DISPLAY COUPONS
    // ============================================

    function displayCoupons(search = "") {
        const query = search.trim().toLowerCase();

        const filteredCoupons = coupons.filter(coupon => {
            return normalizeCode(coupon.code)
                .toLowerCase()
                .includes(query);
        });

        tableBody.innerHTML = "";

        if (filteredCoupons.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No coupons found.
                    </td>
                </tr>
            `;

            resultsCount.textContent = "Showing 0 coupons";
            return;
        }

        filteredCoupons.forEach(coupon => {
            const code = normalizeCode(coupon.code);

            const active = coupon.active !== false;
            const expired = isExpired(coupon);

            let statusText = "Active";
            let statusClass = "active";

            if (expired) {
                statusText = "Expired";
                statusClass = "expired";
            } else if (!active) {
                statusText = "Inactive";
                statusClass = "inactive";
            }

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <span class="coupon-code-label">
                        ${escapeHTML(code)}
                    </span>
                </td>

                <td>${escapeHTML(getDiscountLabel(coupon))}</td>

                <td>
                    $${(
                        Number(coupon.minOrder ?? coupon.minimumOrder) || 0
                    ).toFixed(2)}
                </td>

                <td>${getExpiryLabel(coupon)}</td>

                <td>${escapeHTML(getUsageLabel(coupon))}</td>

                <td>
                    <span class="coupon-status ${statusClass}">
                        ${statusText}
                    </span>
                </td>

                <td>
                    <div class="coupon-action-buttons">

                        <button
                            type="button"
                            class="coupon-edit-button"
                            data-action="edit"
                            data-code="${escapeHTML(code)}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="coupon-toggle-button"
                            data-action="toggle"
                            data-code="${escapeHTML(code)}"
                        >
                            ${active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                            type="button"
                            class="coupon-delete-button"
                            data-action="delete"
                            data-code="${escapeHTML(code)}"
                        >
                            Delete
                        </button>

                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        resultsCount.textContent =
            `Showing ${filteredCoupons.length} of ${coupons.length} coupons`;
    }

    // ============================================
    // 6. RESET FORM
    // ============================================

    function resetForm() {
        couponForm.reset();

        editCodeInput.value = "";

        formTitle.textContent = "Create New Coupon";
        saveButton.textContent = "Create Coupon";

        codeInput.disabled = false;

        cancelButton.hidden = true;

        minOrderInput.value = "0";
        usageLimitInput.value = "100";
        statusInput.value = "true";

        showMessage("", true);
    }

    // ============================================
    // 7. CREATE OR UPDATE COUPON
    // ============================================

    couponForm.addEventListener("submit", event => {
        event.preventDefault();

        const code = normalizeCode(codeInput.value);

        const type = typeInput.value;

        const value = Number(valueInput.value);

        const minOrder = Number(minOrderInput.value);

        const maxDiscount = maxDiscountInput.value === ""
            ? 0
            : Number(maxDiscountInput.value);

        const usageLimit = Number(usageLimitInput.value);

        const expiryDate = expiryInput.value;

        const active = statusInput.value === "true";

        const originalCode = editCodeInput.value;

        // Validate code.
        if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
            showMessage(
                "Use 3–30 characters: letters, numbers, hyphens or underscores.",
                false
            );
            return;
        }

        // Validate discount.
        if (
            !Number.isFinite(value) ||
            value <= 0 ||
            (type === "percentage" && value > 100)
        ) {
            showMessage(
                "Enter a valid discount. Percentage must be 100 or less.",
                false
            );
            return;
        }

        if (
            !Number.isFinite(minOrder) ||
            minOrder < 0 ||
            !Number.isFinite(maxDiscount) ||
            maxDiscount < 0 ||
            !Number.isInteger(usageLimit) ||
            usageLimit < 0
        ) {
            showMessage(
                "Please check the order amount and usage limit.",
                false
            );
            return;
        }

        if (maxDiscount > 0 && type !== "percentage") {
            showMessage(
                "Maximum discount is only available for percentage coupons.",
                false
            );
            return;
        }

        if (
            expiryDate &&
            (
                Number.isNaN(new Date(expiryDate).getTime()) ||
                !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)
            )
        ) {
            showMessage("Please enter a valid expiry date.", false);
            return;
        }

        if (expiryDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(expiryDate + "T00:00:00");

            if (selectedDate < today) {
                showMessage("Expiry date cannot be in the past.", false);
                return;
            }
        }

        // Prevent duplicate codes.
        const duplicate = coupons.some(coupon => {
            const existingCode = normalizeCode(coupon.code);

            return existingCode === code &&
                existingCode !== originalCode;
        });

        if (duplicate) {
            showMessage("This coupon code already exists.", false);
            return;
        }

        // Keep a backup in case saving fails.
        const previousCoupons = coupons.map(coupon => ({
            ...coupon
        }));

        if (originalCode) {
            // UPDATE EXISTING COUPON.
            const index = coupons.findIndex(coupon =>
                normalizeCode(coupon.code) === originalCode
            );

            if (index === -1) {
                showMessage(
                    "Coupon not found. Refresh and try again.",
                    false
                );
                return;
            }

            const oldCoupon = coupons[index];

            coupons[index] = {
                ...oldCoupon,
                code: code,
                type: type,
                value: value,
                minOrder: minOrder,
                maxDiscount: maxDiscount,
                expiryDate: expiryDate,
                usageLimit: usageLimit,
                active: active
            };

        } else {
            // CREATE NEW COUPON.
            coupons.push({
                code: code,
                type: type,
                value: value,
                minOrder: minOrder,
                maxDiscount: maxDiscount,
                expiryDate: expiryDate,
                usageLimit: usageLimit,
                usedCount: 0,
                active: active
            });
        }

        // Save changes.
        if (!saveCoupons(coupons)) {
            coupons = previousCoupons;
            return;
        }

        // Record activity.
        if (originalCode) {
            logCouponActivity(
                "Coupon updated",
                `Administrator updated coupon ${code}.`
            );
        } else {
            logCouponActivity(
                "Coupon created",
                `Administrator created coupon ${code}.`
            );
        }

        updateStatistics();
        displayCoupons(searchInput.value);

        showMessage(
            originalCode
                ? "Coupon updated successfully!"
                : "Coupon created successfully!",
            true
        );

        resetForm();
    });

    // ============================================
    // 8. EDIT / TOGGLE / DELETE ACTIONS
    // ============================================

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const code = button.dataset.code;

        const index = coupons.findIndex(coupon =>
            normalizeCode(coupon.code) === code
        );

        if (index === -1) return;

        const coupon = coupons[index];

        // EDIT
        if (action === "edit") {
            codeInput.value = coupon.code;
            codeInput.disabled = false;

            typeInput.value =
                coupon.type || coupon.discountType || "percentage";

            valueInput.value =
                coupon.value ?? coupon.discountValue ?? "";

            minOrderInput.value =
                coupon.minOrder ?? coupon.minimumOrder ?? 0;

            maxDiscountInput.value =
                coupon.maxDiscount || "";

            expiryInput.value =
                coupon.expiryDate || coupon.expiry || "";

            usageLimitInput.value =
                Number(coupon.usageLimit) || 0;

            statusInput.value =
                coupon.active === false ? "false" : "true";

            editCodeInput.value = code;

            formTitle.textContent = "Edit Coupon";
            saveButton.textContent = "Update Coupon";

            cancelButton.hidden = false;

            showMessage("Editing " + code, true);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        // ACTIVATE / DEACTIVATE
        if (action === "toggle") {

            const previousCoupons = coupons.map(item => ({
                ...item
            }));

            const wasActive = coupon.active !== false;

            coupons[index].active = !wasActive;

            if (!saveCoupons(coupons)) {
                coupons = previousCoupons;
                updateStatistics();
                displayCoupons(searchInput.value);
                return;
            }

            // Record activity.
            if (wasActive) {
                logCouponActivity(
                    "Coupon deactivated",
                    `Administrator deactivated coupon ${code}.`
                );
            } else {
                logCouponActivity(
                    "Coupon activated",
                    `Administrator activated coupon ${code}.`
                );
            }

            updateStatistics();
            displayCoupons(searchInput.value);
        }

        // DELETE
        if (action === "delete") {

            const confirmed = confirm(
                `Are you sure you want to delete coupon ${code}?`
            );

            if (!confirmed) return;

            const previousCoupons = coupons.map(item => ({
                ...item
            }));

            coupons.splice(index, 1);

            if (!saveCoupons(coupons)) {
                coupons = previousCoupons;
                updateStatistics();
                displayCoupons(searchInput.value);
                return;
            }

            // Record activity.
            logCouponActivity(
                "Coupon deleted",
                `Administrator deleted coupon ${code}.`
            );

            if (editCodeInput.value === code) {
                resetForm();
            }

            updateStatistics();
            displayCoupons(searchInput.value);
        }
    });

    // ============================================
    // 9. CANCEL EDIT
    // ============================================

    cancelButton.addEventListener("click", resetForm);

    // ============================================
    // 10. SEARCH COUPONS
    // ============================================

    searchInput.addEventListener("input", () => {
        displayCoupons(searchInput.value);
    });

    // ============================================
    // 11. INITIALIZE
    // ============================================

    updateStatistics();
    displayCoupons();

    console.log(
        "YourShop Admin Coupons loaded successfully."
    );

});
