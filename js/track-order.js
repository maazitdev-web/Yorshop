
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. GET PAGE ELEMENTS AND CUSTOMER DETAILS
    // ============================================

    const trackingContent = document.getElementById("tracking-content");
    const token = localStorage.getItem("customerToken");

    const params = new URLSearchParams(window.location.search);
    const requestedOrderId = (params.get("orderId") || "").trim();

    const API_URL = "http://localhost:3000/api/customer/orders";

    const statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered"
    ];

    console.log("YourShop tracking page initialized.");
    console.log("Requested order ID:", requestedOrderId);

    // ============================================
    // 2. CHECK TRACKING CONTAINER
    // ============================================

    if (!trackingContent) {
        console.error(
            'Tracking container not found. Check that track-order.html has id="tracking-content".'
        );
        return;
    }

    // ============================================
    // 3. HELPER FUNCTIONS
    // ============================================

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
        return "$" + (Number(amount) || 0).toFixed(2);
    }

    function formatDate(value) {
        if (!value) return "Not available";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        });
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
        if (!status) return "Pending";

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function showError(title, message) {
        trackingContent.innerHTML = `
            <div class="tracking-card error-state">
                <h2>${escapeHTML(title)}</h2>
                <p>${escapeHTML(message)}</p>

                <a href="./my-orders.html" class="back-button">
                    Back to My Orders
                </a>
            </div>
        `;
    }

    // ============================================
    // 4. ORDER PROGRESS TIMELINE
    // ============================================

    function getTimelineHTML(status) {
        const currentIndex = statuses.indexOf(status);

        const progress = currentIndex < 0
            ? 0
            : (currentIndex / (statuses.length - 1)) * 86;

        return `
            <div class="timeline">

                <div
                    class="timeline-progress"
                    style="width: ${progress}%">
                </div>

                ${statuses.map((step, index) => {
                    let className = "";

                    if (currentIndex >= 0 && index < currentIndex) {
                        className = "completed";
                    } else if (index === currentIndex) {
                        className = "current";
                    }

                    return `
                        <div class="timeline-step ${className}">
                            <div class="timeline-dot"></div>

                            <div class="timeline-label">
                                ${formatStatus(step)}
                            </div>
                        </div>
                    `;
                }).join("")}

            </div>
        `;
    }

    // ============================================
    // 5. ORDER STATUS MESSAGE
    // ============================================

    function getStatusMessage(status) {
        const messages = {
            pending:
                "Your order has been received and is waiting for confirmation.",

            confirmed:
                "Your order has been confirmed. Thank you for shopping with YourShop!",

            processing:
                "Your order is being prepared for shipment.",

            shipped:
                "Great news! Your order is on its way.",

            delivered:
                "Your order has been delivered successfully.",

            cancelled:
                "This order has been cancelled. Please contact customer support if you need assistance."
        };

        return messages[status] ||
            "Your order status is being updated.";
    }

    // ============================================
    // 6. DISPLAY PURCHASED PRODUCTS
    // ============================================

    function getProductsHTML(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return "<p>Product information is unavailable.</p>";
        }

        return items.map(item => {
            const name =
                item.product_name ||
                item.name ||
                "Product";

            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;

            const subtotal = item.subtotal != null
                ? Number(item.subtotal)
                : price * quantity;

            return `
                <div class="product-item">

                    <div>
                        <div class="product-name">
                            ${escapeHTML(name)}
                        </div>

                        <div class="product-quantity">
                            Quantity: ${quantity}
                        </div>
                    </div>

                    <div class="product-price">
                        ${formatPrice(subtotal)}
                    </div>

                </div>
            `;
        }).join("");
    }

    // ============================================
    // 7. DISPLAY SELECTED ORDER
    // ============================================

    function renderOrder(order) {
        const orderId = order.id ?? order.order_id;
        const status = normalizeStatus(order.status);

        const statusClass =
            statuses.includes(status) || status === "cancelled"
                ? status
                : "pending";

        const isCancelled = status === "cancelled";

        trackingContent.innerHTML = `

            <!-- ORDER PROGRESS -->

            <section class="tracking-card">

                <div class="order-header">

                    <div>
                        <h2>
                            Order #${escapeHTML(orderId)}
                        </h2>

                        <p class="order-date">
                            Placed on ${escapeHTML(formatDate(order.created_at))}
                        </p>
                    </div>

                    <span class="status-badge status-${statusClass}">
                        ${escapeHTML(formatStatus(status))}
                    </span>

                </div>

                <h3 class="section-title" style="margin-top: 25px;">
                    Order Progress
                </h3>

                ${
                    isCancelled
                        ? `
                            <div class="status-message cancelled-message">
                                ${escapeHTML(getStatusMessage(status))}
                            </div>
                        `
                        : `
                            ${getTimelineHTML(status)}

                            <div class="status-message">
                                ${escapeHTML(getStatusMessage(status))}
                            </div>
                        `
                }

            </section>


            <!-- ORDER INFORMATION -->

            <section class="tracking-card">

                <h3 class="section-title">
                    Order Information
                </h3>

                <div class="detail-grid">

                    <div class="detail-item">
                        <span>Order Number</span>
                        <strong>#${escapeHTML(orderId)}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Payment Method</span>
                        <strong>
                            ${escapeHTML(order.payment_method || "Cash on Delivery")}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Order Total</span>
                        <strong>
                            ${formatPrice(order.total_amount)}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Order Date</span>
                        <strong>
                            ${escapeHTML(formatDate(order.created_at))}
                        </strong>
                    </div>

                </div>

            </section>


            <!-- SHIPPING ADDRESS -->

            <section class="tracking-card">

                <h3 class="section-title">
                    Shipping Address
                </h3>

                <div class="detail-grid">

                    <div class="detail-item">
                        <span>Customer</span>
                        <strong>
                            ${escapeHTML(order.customer_name || "Customer")}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Phone</span>
                        <strong>
                            ${escapeHTML(order.phone || "Not available")}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Email</span>
                        <strong>
                            ${escapeHTML(order.email || "Not available")}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Address</span>
                        <strong>
                            ${escapeHTML(order.address || "Not available")}
                            ${escapeHTML(order.city || "")}
                        </strong>
                    </div>

                </div>

            </section>


            <!-- PURCHASED PRODUCTS -->

            <section class="tracking-card">

                <h3 class="section-title">
                    Purchased Products
                </h3>

                ${getProductsHTML(order.items)}

            </section>


            <!-- BACK BUTTON -->

            <div style="margin: 20px 0;">
                <a href="./my-orders.html" class="back-button">
                    Back to My Orders
                </a>
            </div>

        `;
    }

    // ============================================
    // 8. LOAD AND SELECT CUSTOMER ORDER
    // ============================================

    async function loadOrder() {

        // Check login
        if (!token) {
            showError(
                "Login Required",
                "Please log in to your customer account to track your order."
            );
            return;
        }

        // Check order ID in URL
        if (!requestedOrderId) {
            showError(
                "Order Not Selected",
                "No order ID was found. Please open tracking from your My Orders page."
            );
            console.error("Missing orderId in tracking URL.");
            return;
        }

        trackingContent.innerHTML = `
            <div class="tracking-card">
                <p>Loading your order details...</p>
            </div>
        `;

        try {
            // Fetch orders from customer API
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            console.log("Customer orders API response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load your orders."
                );
            }

            if (data.success === false) {
                throw new Error(
                    data.message || "The API could not retrieve your orders."
                );
            }

            // Support both direct and nested response formats
            const orders = Array.isArray(data.orders)
                ? data.orders
                : Array.isArray(data.data?.orders)
                    ? data.data.orders
                    : [];

            console.log(
                "Available order IDs:",
                orders.map(item => item.id ?? item.order_id)
            );

            console.log(
                "Requested order ID:",
                requestedOrderId
            );

            // Match order ID as a string to avoid number/string mismatch
            const selectedOrder = orders.find(item => {
                const currentId = item.id ?? item.order_id;

                return String(currentId).trim() ===
                    String(requestedOrderId).trim();
            });

            // Check whether the order was found
            if (!selectedOrder) {
                console.error(
                    "Order not found. Requested ID:",
                    requestedOrderId
                );

                showError(
                    "Order Not Found",
                    `We could not find order #${requestedOrderId} in your account.`
                );

                return;
            }

            console.log("Selected order:", selectedOrder);

            // Display the selected order
            renderOrder(selectedOrder);

            console.log(
                "Order tracking loaded successfully:",
                selectedOrder.id ?? selectedOrder.order_id
            );

        } catch (error) {
            console.error("Order tracking error:", error);

            showError(
                "Unable to Load Tracking",
                error.message || "Please check your connection and try again."
            );
        }
    }

    // ============================================
    // 9. START TRACKING
    // ============================================

    loadOrder();

});
