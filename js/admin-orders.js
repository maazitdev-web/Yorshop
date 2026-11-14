
// ==========================================
// YOURSHOP - ADMIN ORDERS MANAGEMENT
// MYSQL + JWT AUTHENTICATION
// + ACTIVITY LOG INTEGRATION
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

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

    const API_URL = "http://localhost:3000/api/orders";
    const TOKEN_KEY = "yourshop-admin-token";

    let orders = [];

    if (!ordersList || !searchInput || !statusFilter) {
        console.error("Admin orders HTML elements are missing.");
        return;
    }

    // ======================================
    // 2. JWT AUTHENTICATION HELPERS
    // ======================================

    function getAdminToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getAuthHeaders(additionalHeaders = {}) {
        const token = getAdminToken();

        if (!token) {
            throw new Error("Admin login required. Please log in again.");
        }

        return {
            ...additionalHeaders,
            "Authorization": `Bearer ${token}`
        };
    }

    // ======================================
    // 3. HELPER FUNCTIONS
    // ======================================

    function getCustomerName(order) {
        return order.customer_name || "Guest Customer";
    }

    function getCustomerEmail(order) {
        return order.email || "N/A";
    }

    function getCustomerPhone(order) {
        return order.phone || "N/A";
    }

    function getOrderId(order) {
        return "YS" + order.id;
    }

    function getOrderTotal(order) {
        return Number(order.total_amount) || 0;
    }

    function getOrderDate(order) {
        if (!order.created_at) return "N/A";

        const date = new Date(order.created_at);

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

    // ======================================
    // 4. UPDATE ORDER STATISTICS
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
    // 5. LOAD ORDERS FROM MYSQL
    // JWT TOKEN REQUIRED
    // ======================================

    async function loadOrders() {
        ordersList.innerHTML = `
            <tr>
                <td colspan="6">
                    Loading orders from MySQL...
                </td>
            </tr>
        `;

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    data.message || "Your admin session has expired. Please log in again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Backend error: " + response.status
                );
            }

            if (!data.success || !Array.isArray(data.orders)) {
                throw new Error("Invalid order data received.");
            }

            orders = data.orders;

            console.log("Orders loaded from MySQL:", orders.length);

            updateStatistics();
            displayOrders();

        } catch (error) {
            console.error("Unable to load orders:", error.message);

            orders = [];

            ordersList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:25px;">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

            updateStatistics();
        }
    }

    // ======================================
    // 6. UPDATE ORDER STATUS IN MYSQL
    // JWT TOKEN REQUIRED
    // ======================================

    async function updateOrderStatus(orderId, newStatus, selectElement) {
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

        const previousStatus = selectElement.dataset.previousStatus;

        const order = orders.find(
            item => Number(item.id) === Number(orderId)
        );

        if (!order) {
            alert("Order not found.");
            return;
        }

        const oldStatus = getStatus(order);

        if (oldStatus === newStatus) return;

        selectElement.disabled = true;

        try {
            const response = await fetch(
                `${API_URL}/${orderId}/status`,
                {
                    method: "PATCH",

                    headers: getAuthHeaders({
                        "Content-Type": "application/json"
                    }),

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const result = await response.json();

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    result.message || "Admin session expired. Please log in again."
                );
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Status update failed."
                );
            }

            // Update local order data
            order.status = result.status;

            // ==================================
            // SAVE ADMIN ACTIVITY
            // ==================================

            if (typeof window.logAdminActivity === "function") {
                window.logAdminActivity(
                    "Order Status Updated",
                    `Order ${getOrderId(order)} changed from ${formatStatus(oldStatus)} to ${formatStatus(result.status)}.`,
                    "orders"
                );

                console.log("Order activity saved.");
            } else {
                console.warn("Admin Activity Logger is not loaded.");
            }

            selectElement.dataset.previousStatus = result.status;

            updateStatistics();
            displayOrders();

            alert("Order status updated successfully!");

        } catch (error) {
            console.error("Status update error:", error);

            selectElement.value = previousStatus;

            alert(error.message);

        } finally {
            selectElement.disabled = false;
        }
    }

    // ======================================
    // 7. DISPLAY ORDERS
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
                customer.includes(searchText);

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

            return `
                <tr>
                    <td>${escapeHTML(getOrderId(order))}</td>

                    <td>${escapeHTML(getCustomerName(order))}</td>

                    <td>${escapeHTML(getOrderDate(order))}</td>

                    <td>${formatPrice(getOrderTotal(order))}</td>

                    <td>
                        <select
                            class="order-status-select"
                            data-order-id="${escapeHTML(order.id)}"
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
                            data-id="${escapeHTML(order.id)}">
                            View
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ======================================
    // 8. ORDER STATUS DROPDOWN EVENT
    // ======================================

    ordersList.addEventListener("change", event => {
        const select = event.target.closest(
            ".order-status-select"
        );

        if (!select) return;

        updateOrderStatus(
            select.dataset.orderId,
            select.value,
            select
        );
    });

    // ======================================
    // 9. VIEW ORDER DETAILS
    // ======================================

    function viewOrder(orderId) {
        const order = orders.find(
            item => Number(item.id) === Number(orderId)
        );

        if (!order) return;

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const productsHTML = items.length
            ? items.map(item => `
                <div class="modal-product-row">
                    <div class="modal-product-info">
                        <h4>${escapeHTML(item.product_name)}</h4>
                        <p>Quantity: ${Number(item.quantity) || 0}</p>
                        <p>Unit price: ${formatPrice(item.price)}</p>
                    </div>

                    <div class="modal-product-price">
                        ${formatPrice(item.subtotal)}
                    </div>
                </div>
            `).join("")
            : `<p class="modal-empty">No product details available.</p>`;

        const modal = document.createElement("div");

        modal.className = "order-modal-overlay";
        modal.id = "order-details-modal";

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
                            <strong>${escapeHTML(order.payment_method || "N/A")}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Address</span>
                            <strong>${escapeHTML(order.address || "N/A")}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>City</span>
                            <strong>${escapeHTML(order.city || "N/A")}</strong>
                        </div>

                        <div class="modal-info-card">
                            <span>Postal Code</span>
                            <strong>${escapeHTML(order.postal_code || "N/A")}</strong>
                        </div>

                    </div>

                    <div class="modal-products-section">
                        <h3>Ordered Products</h3>
                        ${productsHTML}
                    </div>

                    <div class="modal-total-section">
                        <span>Subtotal</span>
                        <strong>${formatPrice(order.subtotal)}</strong>
                    </div>

                    <div class="modal-total-section">
                        <span>Shipping</span>
                        <strong>${formatPrice(order.shipping_cost)}</strong>
                    </div>

                    <div class="modal-total-section">
                        <span>Order Total</span>
                        <strong>${formatPrice(order.total_amount)}</strong>
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
    // 10. VIEW BUTTON EVENT
    // ======================================

    ordersList.addEventListener("click", event => {
        const button = event.target.closest(
            'button[data-action="view"]'
        );

        if (!button) return;

        viewOrder(button.dataset.id);
    });

    // ======================================
    // 11. SEARCH AND FILTER
    // ======================================

    searchInput.addEventListener("input", displayOrders);

    statusFilter.addEventListener("change", displayOrders);

    // ======================================
    // 12. INITIALIZE
    // ======================================

    await loadOrders();

    console.log(
        "YourShop Admin Orders page loaded successfully."
    );
});
