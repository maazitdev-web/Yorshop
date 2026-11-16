
 // ==========================================
 // YOURSHOP - ADMIN ORDERS MANAGEMENT
 // FRONTEND-ONLY VERSION
 // LOCALSTORAGE + ACTIVITY LOG
 // ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. ADMIN AUTHENTICATION
    // ======================================

    let adminSession = null;

    try {
        adminSession = JSON.parse(
            sessionStorage.getItem("yourshop-admin-session") || "null"
        );
    } catch (error) {
        adminSession = null;
    }

    if (
        !adminSession ||
        adminSession.role !== "admin" ||
        adminSession.email !== "admin@yourshop.com"
    ) {
        sessionStorage.removeItem("yourshop-admin-session");
        window.location.replace("./admin-login.html");
        return;
    }

    // ======================================
    // 2. GET HTML ELEMENTS
    // ======================================

    const ordersList = document.getElementById("admin-orders-list");
    const searchInput = document.getElementById("order-search");
    const statusFilter = document.getElementById("order-status-filter");

    const totalOrders = document.getElementById("admin-total-orders");
    const pendingOrders = document.getElementById("admin-pending-orders");
    const completedOrders = document.getElementById("admin-completed-orders");
    const cancelledOrders = document.getElementById("admin-cancelled-orders");

    const ORDERS_KEY = "yourshop-orders";

    let orders = [];

    if (!ordersList || !searchInput || !statusFilter) {
        console.error("Admin orders HTML elements are missing.");
        return;
    }

    // ======================================
    // 3. LOCALSTORAGE HELPERS
    // ======================================

    function getOrdersFromStorage() {
        try {
            const savedOrders = JSON.parse(
                localStorage.getItem(ORDERS_KEY) || "[]"
            );

            return Array.isArray(savedOrders) ? savedOrders : [];
        } catch (error) {
            console.error("Error loading orders:", error);
            return [];
        }
    }

    function saveOrders() {
        try {
            localStorage.setItem(
                ORDERS_KEY,
                JSON.stringify(orders)
            );
            return true;
        } catch (error) {
            console.error("Error saving orders:", error);
            alert("Unable to save the order. Please check browser storage.");
            return false;
        }
    }

    // ======================================
    // 4. HELPER FUNCTIONS
    // ======================================

    function getCustomerName(order) {
        return (
            order.customerName ||
            order.customer_name ||
            order.customer?.name ||
            order.name ||
            "Guest Customer"
        );
    }

    function getCustomerEmail(order) {
        return (
            order.customerEmail ||
            order.email ||
            order.customer?.email ||
            "N/A"
        );
    }

    function getCustomerPhone(order) {
        return (
            order.customerPhone ||
            order.phone ||
            order.customer?.phone ||
            "N/A"
        );
    }

    function getOrderId(order) {
        return "YS" + (order.id ?? order.orderId ?? "N/A");
    }

    function getOrderTotal(order) {
        return Number(
            order.total ??
            order.total_amount ??
            order.grandTotal ??
            0
        ) || 0;
    }

    function getOrderDate(order) {
        const value =
            order.createdAt ||
            order.created_at ||
            order.date ||
            order.timestamp;

        if (!value) return "N/A";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "N/A";

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function getStatus(order) {
        const status = String(order.status || "pending")
            .trim()
            .toLowerCase();

        if (["complete", "completed"].includes(status)) {
            return "delivered";
        }

        if (["cancel", "canceled"].includes(status)) {
            return "cancelled";
        }

        return status;
    }

    function formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function formatPrice(amount) {
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

    function getOrderItems(order) {
        return Array.isArray(order.items) ? order.items : [];
    }

    // ======================================
    // 5. UPDATE ORDER STATISTICS
    // ======================================

    function updateStatistics() {
        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        if (pendingOrders) {
            pendingOrders.textContent = orders.filter(
                order => getStatus(order) === "pending"
            ).length;
        }

        if (completedOrders) {
            completedOrders.textContent = orders.filter(
                order => getStatus(order) === "delivered"
            ).length;
        }

        if (cancelledOrders) {
            cancelledOrders.textContent = orders.filter(
                order => getStatus(order) === "cancelled"
            ).length;
        }
    }

    // ======================================
    // 6. LOAD ORDERS FROM LOCALSTORAGE
    // ======================================

    function loadOrders() {
        orders = getOrdersFromStorage();

        console.log("Orders loaded from LocalStorage:", orders.length);

        updateStatistics();
        displayOrders();
    }

    // ======================================
    // 7. UPDATE ORDER STATUS
    // ======================================

    function updateOrderStatus(orderId, newStatus, selectElement) {
        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(newStatus)) {
            alert("Invalid order status.");
            return;
        }

        const order = orders.find(item =>
            String(item.id ?? item.orderId) === String(orderId)
        );

        if (!order) {
            alert("Order not found.");
            return;
        }

        const oldStatus = getStatus(order);

        if (oldStatus === newStatus) return;

        const confirmed = window.confirm(
            `Change order ${getOrderId(order)} from ${formatStatus(oldStatus)} to ${formatStatus(newStatus)}?`
        );

        if (!confirmed) {
            selectElement.value = oldStatus;
            return;
        }

        const oldOrderData = { ...order };

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        if (!saveOrders()) {
            Object.assign(order, oldOrderData);
            selectElement.value = oldStatus;
            return;
        }

        // Save admin activity
        if (typeof window.logAdminActivity === "function") {
            window.logAdminActivity(
                "Order Status Updated",
                `Order ${getOrderId(order)} changed from ${formatStatus(oldStatus)} to ${formatStatus(newStatus)}.`,
                "orders"
            );
        }

        console.log(
            `Order ${getOrderId(order)} status updated:`,
            oldStatus,
            "to",
            newStatus
        );

        updateStatistics();
        displayOrders();

        alert("Order status updated successfully!");
    }

    // ======================================
    // 8. DISPLAY ORDERS
    // ======================================

    function displayOrders() {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;

        const filteredOrders = orders.filter(order => {
            const orderId = getOrderId(order).toLowerCase();
            const customer = getCustomerName(order).toLowerCase();
            const status = getStatus(order);

            const matchesSearch =
                orderId.includes(searchText) ||
                customer.toLowerCase().includes(searchText) ||
                getCustomerEmail(order).toLowerCase().includes(searchText);

            let matchesStatus = selectedStatus === "all";

            if (selectedStatus === "completed") {
                matchesStatus = status === "delivered";
            } else if (selectedStatus === "processing") {
                matchesStatus = [
                    "confirmed",
                    "processing",
                    "shipped"
                ].includes(status);
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
            const status = getStatus(order);
            const id = order.id ?? order.orderId;

            return `
                <tr>
                    <td>${escapeHTML(getOrderId(order))}</td>

                    <td>${escapeHTML(getCustomerName(order))}</td>

                    <td>${escapeHTML(getOrderDate(order))}</td>

                    <td>${formatPrice(getOrderTotal(order))}</td>

                    <td>
                        <select
                            class="order-status-select"
                            data-order-id="${escapeHTML(id)}"
                            data-previous-status="${escapeHTML(status)}">

                            <option value="pending" ${status === "pending" ? "selected" : ""}>Pending</option>
                            <option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option>
                            <option value="processing" ${status === "processing" ? "selected" : ""}>Processing</option>
                            <option value="shipped" ${status === "shipped" ? "selected" : ""}>Shipped</option>
                            <option value="delivered" ${status === "delivered" ? "selected" : ""}>Delivered</option>
                            <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>

                        </select>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="view-order-button"
                            data-action="view"
                            data-id="${escapeHTML(id)}">
                            View
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ======================================
    // 9. ORDER STATUS DROPDOWN EVENT
    // ======================================

    ordersList.addEventListener("change", event => {
        const select = event.target.closest(".order-status-select");

        if (!select) return;

        updateOrderStatus(
            select.dataset.orderId,
            select.value,
            select
        );
    });

    // ======================================
    // 10. VIEW ORDER DETAILS
    // ======================================

    function viewOrder(orderId) {
        const order = orders.find(item =>
            String(item.id ?? item.orderId) === String(orderId)
        );

        if (!order) return;

        const items = getOrderItems(order);

        const productsHTML = items.length
            ? items.map(item => {
                const name =
                    item.product_name ||
                    item.name ||
                    item.title ||
                    "Product";

                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;

                const subtotal = Number(
                    item.subtotal ??
                    item.total ??
                    price * quantity
                ) || 0;

                return `
                    <div class="modal-product-row">
                        <div class="modal-product-info">
                            <h4>${escapeHTML(name)}</h4>
                            <p>Quantity: ${quantity}</p>
                            <p>Unit price: ${formatPrice(price)}</p>
                        </div>

                        <div class="modal-product-price">
                            ${formatPrice(subtotal)}
                        </div>
                    </div>
                `;
            }).join("")
            : `<p class="modal-empty">No product details available.</p>`;

        const modal = document.createElement("div");

        modal.className = "order-modal-overlay";
        modal.id = "order-details-modal";

        const address = order.address || order.shippingAddress?.address || "N/A";
        const city = order.city || order.shippingAddress?.city || "N/A";
        const postalCode = order.postalCode || order.postal_code || "N/A";

        const paymentMethod =
            order.paymentMethod ||
            order.payment_method ||
            "N/A";

        const subtotal = Number(
            order.subtotal ?? order.subTotal ?? getOrderTotal(order)
        ) || 0;

        const shipping = Number(
            order.shippingCost ?? order.shipping_cost ?? order.shipping ?? 0
        ) || 0;

        modal.innerHTML = `
            <div class="order-details-modal">

                <div class="order-modal-header">
                    <div>
                        <h2>Order Details</h2>
                        <p>${escapeHTML(getOrderId(order))}</p>
                    </div>

                    <button
                        type="button"
                        class="close-order-modal"
                        aria-label="Close">
                        &times;
                    </button>
                </div>

                <div class="order-modal-body">

                    <div class="modal-info-grid">

                        <div class="modal-info-card">
                            <span>Customer Name</span>
                            <strong>${escapeHTML(getCustomerName(order))}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Email Address</span>
                            <strong>${escapeHTML(getCustomerEmail(order))}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Phone Number</span>
                            <strong>${escapeHTML(getCustomerPhone(order))}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Order Date</span>
                            <strong>${escapeHTML(getOrderDate(order))}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Order Status</span>
                            <strong>${escapeHTML(formatStatus(getStatus(order)))}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Payment Method</span>
                            <strong>${escapeHTML(paymentMethod)}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Address</span>
                            <strong>${escapeHTML(address)}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>City</span>
                            <strong>${escapeHTML(city)}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Postal Code</span>
                            <strong>${escapeHTML(postalCode)}</strong>
                        </div>

                    </div>

                    <div class="modal-products-section">
                        <h3>Ordered Products</h3>
                        ${productsHTML}
                    </div>

                    <div class="modal-total-section">
                        <span>Subtotal</span>
                        <strong>${formatPrice(subtotal)}</strong>
                    </div>

                    <div class="modal-total-section">
                        <span>Shipping</span>
                        <strong>${formatPrice(shipping)}</strong>
                    </div>

                    <div class="modal-total-section">
                        <span>Order Total</span>
                        <strong>${formatPrice(getOrderTotal(order))}</strong>
                    </div>

                </div>

                <div class="order-modal-footer">
                    <button type="button" class="modal-close-button">
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
    // 11. VIEW BUTTON EVENT
    // ======================================

    ordersList.addEventListener("click", event => {
        const button = event.target.closest(
            'button[data-action="view"]'
        );

        if (!button) return;

        viewOrder(button.dataset.id);
    });

    // ======================================
    // 12. SEARCH AND FILTER
    // ======================================

    searchInput.addEventListener("input", displayOrders);
    statusFilter.addEventListener("change", displayOrders);

    // ======================================
    // 13. INITIALIZE
    // ======================================

    loadOrders();

    console.log("YourShop Admin Orders loaded successfully.");
});
