// ============================================
// YOURSHOP - CUSTOMER MY ORDERS
// Backend-connected customer order history
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. HTML ELEMENTS AND ORDER DATA
    // ========================================

    const ordersList = document.getElementById("customer-orders-list");
    const orderFilter = document.getElementById("order-filter");

    let customerOrders = [];

    if (!ordersList) {
        console.warn("Customer orders list not found.");
        return;
    }

    // ========================================
    // 2. HELPER FUNCTIONS
    // ========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function formatPrice(amount) {
        const price = Number(amount) || 0;

        if (typeof window.formatPrice === "function") {
            return window.formatPrice(price);
        }

        return `$${price.toFixed(2)}`;
    }

    function normalizeStatus(status) {
        const value = String(status || "pending")
            .toLowerCase()
            .trim();

        if (value === "completed") return "delivered";
        if (value === "canceled") return "cancelled";

        return value;
    }

    function formatStatus(status) {
        return normalizeStatus(status)
            .replace(/-/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function getOrderId(order) {
        return (
            order.orderId ||
            order.id ||
            order.orderNumber ||
            "N/A"
        );
    }

    function getOrderItems(order) {
        if (Array.isArray(order.items)) {
            return order.items;
        }

        if (Array.isArray(order.products)) {
            return order.products;
        }

        return [];
    }

    function getOrderTotal(order) {
        if (order.total_amount !== undefined &&
            order.total_amount !== null) {
            return Number(order.total_amount) || 0;
        }

        if (order.total !== undefined &&
            order.total !== null) {
            return Number(order.total) || 0;
        }

        if (order.grandTotal !== undefined &&
            order.grandTotal !== null) {
            return Number(order.grandTotal) || 0;
        }

        if (order.totalAmount !== undefined &&
            order.totalAmount !== null) {
            return Number(order.totalAmount) || 0;
        }

        return getOrderItems(order).reduce((total, item) => {
            if (item.subtotal !== undefined &&
                item.subtotal !== null) {
                return total + (Number(item.subtotal) || 0);
            }

            const price = Number(
                item.price || item.discountedPrice || 0
            );

            const quantity = Number(item.quantity) || 1;

            return total + price * quantity;
        }, 0);
    }

    function getOrderDate(order) {
        return (
            order.created_at ||
            order.createdAt ||
            order.orderDate ||
            order.date ||
            ""
        );
    }

    function formatDateTime(dateValue) {
        if (!dateValue) return "Date unavailable";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function getCustomerName(order) {
        return (
            order.customer_name ||
            order.customerName ||
            order.name ||
            order.customer?.name ||
            "Customer"
        );
    }

    function getPaymentMethod(order) {
        return (
            order.payment_method ||
            order.paymentMethod ||
            order.payment ||
            "Cash on Delivery"
        );
    }

    function getOrders() {
        return customerOrders;
    }

    // ========================================
    // 3. ORDER STATUS TIMELINE
    // ========================================

    const orderStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered"
    ];

    function getStatusMessage(status) {
        if (status === "cancelled") {
            return `
                <div class="order-cancelled-message">
                    This order has been cancelled.
                </div>
            `;
        }

        const currentIndex = orderStatuses.indexOf(status);

        return `
            <div class="order-timeline">

                ${orderStatuses.map((step, index) => {

                    let className = "";

                    if (currentIndex >= 0 && index < currentIndex) {
                        className = "completed";
                    } else if (
                        currentIndex >= 0 &&
                        index === currentIndex
                    ) {
                        className = "current";
                    }

                    return `
                        <div class="timeline-step ${className}">

                            <span class="timeline-dot"></span>

                            <span class="timeline-label">
                                ${formatStatus(step)}
                            </span>

                        </div>
                    `;

                }).join("")}

            </div>
        `;
    }

    // ========================================
    // 4. ORDER STATUS INFORMATION
    // ========================================

    function getStatusInformation(status) {

        const messages = {
            pending: "Your order is waiting for confirmation.",
            confirmed: "Your order has been confirmed.",
            processing: "Your order is being prepared.",
            shipped: "Your order is on its way.",
            delivered: "Your order has been delivered.",
            cancelled: "This order has been cancelled."
        };

        return messages[status] ||
            "Your order status is being updated.";
    }

    // ========================================
    // 5. ORDER PRODUCTS HTML
    // ========================================

    function getProductsHTML(order) {

        const items = getOrderItems(order);

        if (items.length === 0) {
            return `
                <p class="order-no-products">
                    Product information unavailable.
                </p>
            `;
        }

        return items.map(item => {

            const name =
                item.product_name ||
                item.name ||
                item.productName ||
                item.title ||
                "Product";

            const image =
                item.image ||
                item.productImage ||
                item.images?.[0] ||
                "";

            const quantity = Number(item.quantity) || 1;

            const price = Number(
                item.price ||
                item.discountedPrice ||
                0
            );

            return `
                <div class="order-product-item">

                    ${image ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            class="order-product-image"
                            loading="lazy"
                        >
                    ` : ""}

                    <div class="order-product-info">

                        <h4>${escapeHTML(name)}</h4>

                        <p>
                            Quantity: ${quantity}
                        </p>

                        <p>
                            ${formatPrice(price)}
                        </p>

                    </div>

                </div>
            `;

        }).join("");
    }

    // ========================================
    // 6. ORDER DETAILS MODAL
    // ========================================

    function showOrderDetails(orderIndex) {

        const order = getOrders()[orderIndex];

        if (!order) {
            alert("Order not found.");
            return;
        }

        const orderId = getOrderId(order);

        const status = normalizeStatus(order.status);

        const modalHTML = `
            <div class="order-details-modal" id="order-details-modal">

                <div class="order-details-content">

                    <button
                        type="button"
                        class="close-order-modal"
                        aria-label="Close order details"
                    >
                        &times;
                    </button>

                    <h2>Order Details</h2>

                    <div class="order-details-header">

                        <p>
                            <strong>Order ID:</strong>
                            ${escapeHTML(orderId)}
                        </p>

                        <p>
                            <strong>Order Date:</strong>
                            ${escapeHTML(formatDateTime(getOrderDate(order)))}
                        </p>

                        <p>
                            <strong>Customer:</strong>
                            ${escapeHTML(getCustomerName(order))}
                        </p>

                        <p>
                            <strong>Payment:</strong>
                            ${escapeHTML(getPaymentMethod(order))}
                        </p>

                        <p>
                            <strong>Status:</strong>

                            <span class="order-status status-${escapeHTML(status)}">
                                ${escapeHTML(formatStatus(status))}
                            </span>
                        </p>

                    </div>

                    <h3>Order Progress</h3>

                    ${getStatusMessage(status)}

                    <p class="order-status-information">
                        ${escapeHTML(getStatusInformation(status))}
                    </p>

                    <h3>Products</h3>

                    <div class="order-details-products">
                        ${getProductsHTML(order)}
                    </div>

                    <div class="order-details-total">

                        <span>Order Total</span>

                        <strong>
                            ${formatPrice(getOrderTotal(order))}
                        </strong>

                    </div>

                    <div class="order-details-actions">

                        <a
                            href="./track-order.html"
                            class="order-btn track-btn"
                        >
                            Track Order
                        </a>

                        <button
                            type="button"
                            class="order-btn shop-btn close-modal-button"
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.getElementById(
            "order-details-modal"
        )?.remove();

        document.body.insertAdjacentHTML(
            "beforeend",
            modalHTML
        );

        const modal = document.getElementById(
            "order-details-modal"
        );

        function closeModal() {
            modal?.remove();

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        modal.querySelector(
            ".close-order-modal"
        )?.addEventListener("click", closeModal);

        modal.querySelector(
            ".close-modal-button"
        )?.addEventListener("click", closeModal);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener(
            "keydown",
            handleEscape
        );
    }

    // ========================================
    // 7. RENDER CUSTOMER ORDERS
    // ========================================

    function renderOrders() {

        const selectedFilter = orderFilter?.value || "all";

        const filteredOrders = getOrders()
            .map((order, index) => ({
                order,
                index
            }))
            .filter(({ order }) => {

                if (selectedFilter === "all") {
                    return true;
                }

                return normalizeStatus(order.status) ===
                    selectedFilter;

            })
            .sort((a, b) => {

                const dateA =
                    new Date(getOrderDate(a.order)).getTime() || 0;

                const dateB =
                    new Date(getOrderDate(b.order)).getTime() || 0;

                return dateB - dateA;
            });

        if (filteredOrders.length === 0) {

            ordersList.innerHTML = `
                <div class="empty-orders">

                    <div class="empty-icon">📦</div>

                    <h3>No Orders Found</h3>

                    <p>
                        You don't have any orders in this category yet.
                    </p>

                    <a href="./index.html" class="order-btn shop-btn">
                        Start Shopping
                    </a>

                </div>
            `;

            return;
        }

        ordersList.innerHTML = filteredOrders.map(
            ({ order, index }) => {

                const orderId = getOrderId(order);

                const status = normalizeStatus(order.status);

                const date = formatDateTime(
                    getOrderDate(order)
                );

                return `
                    <article class="order-card">

                        <div class="order-card-header">

                            <div>

                                <h3>
                                    Order #${escapeHTML(orderId)}
                                </h3>

                                <p>${escapeHTML(date)}</p>

                            </div>

                            <span class="order-status status-${escapeHTML(status)}">
                                ${escapeHTML(formatStatus(status))}
                            </span>

                        </div>

                        <div class="order-card-body">

                            <div class="order-products">
                                ${getProductsHTML(order)}
                            </div>

                            ${getStatusMessage(status)}

                            <p class="order-status-information">
                                ${escapeHTML(getStatusInformation(status))}
                            </p>

                        </div>

                        <div class="order-bottom">

                            <div class="order-total">

                                <span>Total</span>

                                <strong>
                                    ${formatPrice(getOrderTotal(order))}
                                </strong>

                            </div>

                            <div class="order-actions">

                                <button
                                    type="button"
                                    class="order-btn view-details-btn"
                                    data-index="${index}"
                                >
                                    View Details
                                </button>

<a href="./track-order.html?orderId=${encodeURIComponent(getOrderId(order))}"
   class="order-btn track-btn">
    Track Order
</a>

                                <a
                                    href="./index.html"
                                    class="order-btn shop-btn"
                                >
                                    Shop More
                                </a>

                            </div>

                        </div>

                    </article>
                `;

            }
        ).join("");
    }

    // ========================================
    // 8. VIEW ORDER DETAILS BUTTON
    // ========================================

    ordersList.addEventListener("click", event => {

        const button = event.target.closest(
            ".view-details-btn"
        );

        if (!button) return;

        const orderIndex = Number(button.dataset.index);

        if (!Number.isInteger(orderIndex)) return;

        showOrderDetails(orderIndex);

    });

    // ========================================
    // 9. ORDER FILTER
    // ========================================

    orderFilter?.addEventListener("change", () => {
        renderOrders();
    });

    // ========================================
    // 10. OPEN ORDER FROM NOTIFICATION
    // ========================================

    function openOrderFromNotification() {

        const params = new URLSearchParams(
            window.location.search
        );

        const requestedOrderId = params.get("orderId");

        if (!requestedOrderId) return;

        const orderIndex = getOrders().findIndex(order =>
            String(getOrderId(order)) ===
            String(requestedOrderId)
        );

        if (orderIndex === -1) {

            console.warn(
                "Order not found:",
                requestedOrderId
            );

            return;
        }

        showOrderDetails(orderIndex);
    }

    // ========================================
    // 11. LOAD CUSTOMER ORDERS FROM BACKEND
    // ========================================

    async function loadCustomerOrders() {

        const token = localStorage.getItem("customerToken");

        if (!token) {

            ordersList.innerHTML = `
                <div class="empty-orders">

                    <div class="empty-icon">🔒</div>

                    <h3>Please Login</h3>

                    <p>
                        Please log in to view your orders.
                    </p>

                    <a href="./index.html" class="order-btn shop-btn">
                        Back to Store
                    </a>

                </div>
            `;

            return;
        }

        ordersList.innerHTML = `
            <div class="empty-orders">

                <div class="empty-icon">📦</div>

                <h3>Loading Your Orders...</h3>

                <p>
                    Please wait while we retrieve your orders.
                </p>

            </div>
        `;

        try {

            const response = await fetch(
                "http://localhost:3000/api/customer/orders",
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load your orders."
                );
            }

            customerOrders = Array.isArray(data.orders)
                ? data.orders
                : [];

            renderOrders();

            openOrderFromNotification();

            console.log(
                "My Orders loaded successfully:",
                customerOrders.length
            );

        } catch (error) {

            console.error(
                "My Orders loading error:",
                error
            );

            ordersList.innerHTML = `
                <div class="empty-orders">

                    <div class="empty-icon">⚠️</div>

                    <h3>Unable to Load Orders</h3>

                    <p>
                        Please refresh the page and try again.
                    </p>

                </div>
            `;
        }
    }

    // ========================================
    // 12. INITIALIZE
    // ========================================

    loadCustomerOrders();

    console.log(
        "YourShop customer orders page initialized."
    );

});