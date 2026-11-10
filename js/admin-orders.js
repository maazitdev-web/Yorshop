
// ==========================================
// YOURSHOP - ADMIN ORDERS MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "yourshop-orders";

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const ordersList = document.getElementById("admin-orders-list");
    const searchInput = document.getElementById("order-search");
    const statusFilter = document.getElementById("order-status-filter");

    const totalOrders = document.getElementById("admin-total-orders");
    const pendingOrders = document.getElementById("admin-pending-orders");
    const completedOrders = document.getElementById("admin-completed-orders");
    const cancelledOrders = document.getElementById("admin-cancelled-orders");

    if (!ordersList || !searchInput || !statusFilter) {
        console.error("Admin orders HTML elements are missing.");
        return;
    }

    // ======================================
    // 2. ORDER STATUSES
    // ======================================

    const ORDER_STATUSES = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ];

    // ======================================
    // 3. LOAD AND SAVE ORDERS
    // ======================================

    function getOrders() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Unable to load orders:", error);
            return [];
        }
    }

    let orders = getOrders();

    function saveOrders() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(orders)
            );

            return true;

        } catch (error) {
            console.error("Unable to save orders:", error);

            alert("Unable to save changes. Check your browser storage.");

            return false;
        }
    }

    // ======================================
    // 4. HELPER FUNCTIONS
    // ======================================

    function getCustomerName(order) {
        if (typeof order.customer === "object" && order.customer !== null) {
            return order.customer.name ||
                order.customer.fullName ||
                order.customerName ||
                "Guest Customer";
        }

        return order.customerName ||
            order.name ||
            order.customer ||
            "Guest Customer";
    }

    function getCustomerEmail(order) {
        if (typeof order.customer === "object" && order.customer !== null) {
            return order.customer.email || order.email || "N/A";
        }

        return order.email || "N/A";
    }

    function getCustomerPhone(order) {
        if (typeof order.customer === "object" && order.customer !== null) {
            return order.customer.phone || order.phone || "N/A";
        }

        return order.phone || "N/A";
    }

    function getOrderId(order, index) {
        return order.orderId ||
            order.id ||
            order.orderNumber ||
            `ORDER-${index + 1}`;
    }

    function getOrderTotal(order) {
        const total = Number(
            order.total ??
            order.totalAmount ??
            order.grandTotal ??
            0
        );

        return Number.isFinite(total) ? total : 0;
    }

    function getOrderDate(order) {
        const date = order.orderDate ||
            order.date ||
            order.createdAt;

        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function getStatus(order) {
        const status = String(order.status || "pending")
            .trim()
            .toLowerCase();

        // Support older order status names.
        if (["complete", "completed"].includes(status)) {
            return "delivered";
        }

        if (["cancel", "canceled"].includes(status)) {
            return "cancelled";
        }

        return ORDER_STATUSES.includes(status)
            ? status
            : "pending";
    }

    function formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(amount) || 0);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getOrderProducts(order) {
        if (Array.isArray(order.products)) {
            return order.products;
        }

        if (Array.isArray(order.items)) {
            return order.items;
        }

        return [];
    }

    // ======================================
    // 5. UPDATE STATISTICS
    // ======================================

    function updateStatistics() {
        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        if (pendingOrders) {
            pendingOrders.textContent = orders.filter(order =>
                getStatus(order) === "pending"
            ).length;
        }

        if (completedOrders) {
            completedOrders.textContent = orders.filter(order =>
                getStatus(order) === "delivered"
            ).length;
        }

        if (cancelledOrders) {
            cancelledOrders.textContent = orders.filter(order =>
                getStatus(order) === "cancelled"
            ).length;
        }
    }

    // ======================================
    // 6. DISPLAY ORDERS
    // ======================================

    function displayOrders() {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;

        const filteredOrders = orders.filter((order, index) => {
            const orderId = String(
                getOrderId(order, index)
            ).toLowerCase();

            const customer = getCustomerName(order).toLowerCase();
            const status = getStatus(order);

            const matchesSearch =
                orderId.includes(searchText) ||
                customer.includes(searchText);

            let matchesStatus = selectedStatus === "all";

            if (selectedStatus === "completed") {
                matchesStatus = status === "delivered";
            } else if (selectedStatus === "processing") {
                matchesStatus = ["confirmed", "processing", "shipped"]
                    .includes(status);
            } else if (selectedStatus !== "all") {
                matchesStatus = status === selectedStatus;
            }

            return matchesSearch && matchesStatus;
        });

        if (filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <tr>
                    <td colspan="6" class="no-admin-orders">
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }

        ordersList.innerHTML = filteredOrders.map(order => {
            const originalIndex = orders.indexOf(order);
            const status = getStatus(order);

            const statusOptions = ORDER_STATUSES.map(option => `
                <option value="${option}"
                    ${status === option ? "selected" : ""}>
                    ${formatStatus(option)}
                </option>
            `).join("");

            return `
                <tr>
                    <td>
                        ${escapeHTML(getOrderId(order, originalIndex))}
                    </td>

                    <td>
                        ${escapeHTML(getCustomerName(order))}
                    </td>

                    <td>
                        ${escapeHTML(getOrderDate(order))}
                    </td>

                    <td>
                        ${formatPrice(getOrderTotal(order))}
                    </td>

                    <td>
                        <span class="order-status ${escapeHTML(status)}">
                            ${escapeHTML(formatStatus(status))}
                        </span>
                    </td>

                    <td>
                        <button
                            class="view-order-button"
                            data-action="view"
                            data-index="${originalIndex}">
                            View
                        </button>

                        <button
                            class="view-order-button"
                            data-action="delete"
                            data-index="${originalIndex}">
                            Delete
                        </button>

                        <select
                            class="order-status-select"
                            data-index="${originalIndex}"
                            aria-label="Update order status">

                            ${statusOptions}

                        </select>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ======================================
    // 7. ORDER DETAILS MODAL
    // ======================================

    function viewOrder(index) {
        const order = orders[index];

        if (!order) return;

        const products = getOrderProducts(order);
        const status = getStatus(order);

        const productsHTML = products.length
            ? products.map(item => {
                const name = item.name || item.title || "Product";
                const quantity = Number(item.quantity) || 1;

                const price = Number(
                    item.finalPrice ??
                    item.price ??
                    0
                );

                return `
                    <div class="modal-product-row">
                        <div class="modal-product-info">
                            <h4>${escapeHTML(name)}</h4>
                            <p>Quantity: ${quantity}</p>
                        </div>

                        <div class="modal-product-price">
                            ${formatPrice(price * quantity)}
                        </div>
                    </div>
                `;
            }).join("")
            : `<p class="modal-empty">No product details available.</p>`;

        const modal = document.createElement("div");

        modal.className = "order-modal-overlay";
        modal.id = "order-details-modal";

        modal.innerHTML = `
            <div class="order-details-modal">

                <div class="order-modal-header">
                    <div>
                        <h2>Order Details</h2>
                        <p>
                            ${escapeHTML(getOrderId(order, index))}
                        </p>
                    </div>

                    <button
                        class="close-order-modal"
                        aria-label="Close">
                        &times;
                    </button>
                </div>

                <div class="order-modal-body">

                    <div class="modal-info-grid">

                        <div class="modal-info-card">
                            <span>Customer Name</span>
                            <strong>
                                ${escapeHTML(getCustomerName(order))}
                            </strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Email Address</span>
                            <strong>
                                ${escapeHTML(getCustomerEmail(order))}
                            </strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Phone Number</span>
                            <strong>
                                ${escapeHTML(getCustomerPhone(order))}
                            </strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Order Date</span>
                            <strong>
                                ${escapeHTML(getOrderDate(order))}
                            </strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Order Status</span>
                            <strong class="modal-order-status">
                                ${escapeHTML(formatStatus(status))}
                            </strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Payment Method</span>
                            <strong>
                                ${escapeHTML(
                                    order.paymentMethod ||
                                    order.payment ||
                                    "N/A"
                                )}
                            </strong>
                        </div>

                    </div>

                    <div class="modal-products-section">
                        <h3>Ordered Products</h3>
                        ${productsHTML}
                    </div>

                    <div class="modal-total-section">
                        <span>Order Total</span>
                        <strong>
                            ${formatPrice(getOrderTotal(order))}
                        </strong>
                    </div>

                </div>

                <div class="order-modal-footer">
                    <button class="modal-close-button">
                        Close
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(modal);

        function closeModal() {
            modal.remove();
            document.removeEventListener("keydown", handleEscape);
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        modal.querySelectorAll(
            ".close-order-modal, .modal-close-button"
        ).forEach(button => {
            button.addEventListener("click", closeModal);
        });

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener("keydown", handleEscape);
    }

    // ======================================
    // 8. VIEW AND DELETE BUTTONS
    // ======================================

    ordersList.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const index = Number(button.dataset.index);

        if (!Number.isInteger(index) || !orders[index]) {
            return;
        }

        if (button.dataset.action === "view") {
            viewOrder(index);
        }

        if (button.dataset.action === "delete") {
            const confirmed = confirm(
                "Are you sure you want to delete this order?"
            );

            if (!confirmed) return;

            const previousOrders = [...orders];

            orders.splice(index, 1);

            if (!saveOrders()) {
                orders = previousOrders;
                return;
            }

            refreshOrders();

            alert("Order deleted successfully!");
        }
    });

    // ======================================
    // 9. UPDATE ORDER STATUS
    // ======================================

    ordersList.addEventListener("change", event => {
        if (!event.target.matches(".order-status-select")) {
            return;
        }

        const index = Number(event.target.dataset.index);
        const newStatus = event.target.value;

        if (!Number.isInteger(index) || !orders[index]) {
            return;
        }

        if (!ORDER_STATUSES.includes(newStatus)) {
            return;
        }

        const previousOrder = { ...orders[index] };

        orders[index].status = newStatus;
        orders[index].statusUpdatedAt = new Date().toISOString();

        if (!saveOrders()) {
            orders[index] = previousOrder;
            displayOrders();
            return;
        }

        refreshOrders();

        alert(
            `Order status updated to ${formatStatus(newStatus)}!`
        );
    });

    // ======================================
    // 10. SEARCH AND FILTER
    // ======================================

    searchInput.addEventListener("input", displayOrders);

    statusFilter.addEventListener("change", displayOrders);

    // ======================================
    // 11. REFRESH
    // ======================================

    function refreshOrders() {
        updateStatistics();
        displayOrders();
    }

    // ======================================
    // 12. INITIALIZE
    // ======================================

    refreshOrders();

    console.log(
        "YourShop Admin Orders loaded:",
        orders.length
    );

});
