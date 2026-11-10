
// ==========================================
// YOURSHOP - ORDER TRACKING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const ORDERS_KEY = "yourshop-orders";

    const trackingForm = document.getElementById("tracking-form");
    const orderIdInput = document.getElementById("tracking-order-id");
    const trackingMessage = document.getElementById("tracking-message");
    const trackingResult = document.getElementById("tracking-result");

    const steps = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered"
    ];

    // ======================================
    // 1. STORAGE
    // ======================================

    function getOrders() {
        try {
            const orders = JSON.parse(
                localStorage.getItem(ORDERS_KEY)
            );

            return Array.isArray(orders) ? orders : [];
        } catch (error) {
            console.error("Could not load orders:", error);
            return [];
        }
    }

    // ======================================
    // 2. HELPERS
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$" + Number(amount || 0).toFixed(2);
    }

    function getOrderId(order) {
        return String(
            order.orderId ??
            order.id ??
            order.orderNumber ??
            ""
        );
    }

    function getCustomer(order) {
        if (typeof order.customer === "object" && order.customer !== null) {
            return order.customer.name ||
                order.customer.fullName ||
                order.customerName ||
                "Customer";
        }

        return order.customerName ||
            order.name ||
            order.customer ||
            "Customer";
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

    function getStatus(order) {
        const status = String(order.status || "pending")
            .trim()
            .toLowerCase();

        if (status === "complete" || status === "completed") {
            return "delivered";
        }

        if (status === "cancel" || status === "canceled") {
            return "cancelled";
        }

        if (steps.includes(status) || status === "cancelled") {
            return status;
        }

        return "pending";
    }

    function getStatusLabel(status) {
        const labels = {
            pending: "Pending",
            confirmed: "Confirmed",
            processing: "Processing",
            shipped: "Shipped",
            delivered: "Delivered",
            cancelled: "Cancelled"
        };

        return labels[status] || "Pending";
    }

    function showMessage(message, type) {
        trackingMessage.textContent = message;
        trackingMessage.className = type || "";
    }

    // ======================================
    // 3. DISPLAY ORDER INFORMATION
    // ======================================

    function displayOrder(order) {
        const orderId = getOrderId(order);
        const status = getStatus(order);

        trackingResult.hidden = false;

        document.getElementById("result-order-id").textContent =
            "Order #" + orderId;

        const orderDate = order.orderDate || order.date;

        document.getElementById("result-order-date").textContent =
            orderDate
                ? "Placed on " + new Date(orderDate).toLocaleDateString()
                : "Order date unavailable";

        document.getElementById("result-customer").textContent =
            getCustomer(order);

        document.getElementById("result-payment").textContent =
            order.paymentMethod || "Not specified";

        document.getElementById("result-total").textContent =
            formatPrice(order.total);

        document.getElementById("result-city").textContent =
            order.city || order.customerCity || "Not specified";

        const statusBadge = document.getElementById("result-status");

        statusBadge.textContent = getStatusLabel(status);
        statusBadge.className = "status-badge";

        if (status === "delivered") {
            statusBadge.classList.add("status-delivered");
        } else if (status === "cancelled") {
            statusBadge.classList.add("status-cancelled");
        } else if (status === "processing" || status === "shipped") {
            statusBadge.classList.add("status-processing");
        }

        displayProgress(status);
        displayProducts(order);

        document.getElementById("tracking-cancelled").hidden =
            status !== "cancelled";
    }

    // ======================================
    // 4. DELIVERY PROGRESS
    // ======================================

    function displayProgress(status) {
        const timelineSteps = document.querySelectorAll(".timeline-step");
        const description = document.getElementById("progress-description");

        timelineSteps.forEach(step => {
            step.classList.remove("completed", "current");
        });

        if (status === "cancelled") {
            description.textContent =
                "This order was cancelled. Its delivery process has stopped.";
            return;
        }

        const currentIndex = steps.indexOf(status);

        timelineSteps.forEach((step, index) => {
            if (index <= currentIndex) {
                step.classList.add("completed");
            }

            if (index === currentIndex) {
                step.classList.add("current");
            }
        });

        const descriptions = {
            pending: "We have received your order and are waiting to confirm it.",
            confirmed: "Your order has been confirmed.",
            processing: "Your order is being prepared for shipment.",
            shipped: "Your order has been shipped and is on its way.",
            delivered: "Your order has been successfully delivered."
        };

        description.textContent =
            descriptions[status] || descriptions.pending;
    }

    // ======================================
    // 5. DISPLAY ORDER PRODUCTS
    // ======================================

    function displayProducts(order) {
        const productsContainer =
            document.getElementById("tracking-products");

        const products = getOrderProducts(order);

        if (products.length === 0) {
            productsContainer.innerHTML =
                "<p>No product details are available.</p>";
            return;
        }

        productsContainer.innerHTML = products.map(product => {
            const name = product.name ||
                product.title ||
                "Product";

            const quantity = Number(product.quantity) || 1;

            const price = Number(
                product.finalPrice ??
                product.price ??
                0
            );

            return `
                <div class="tracking-product">
                    <span>
                        ${escapeHTML(name)}
                        × ${quantity}
                    </span>

                    <strong>${formatPrice(price * quantity)}</strong>
                </div>
            `;
        }).join("");
    }

    // ======================================
    // 6. FIND ORDER
    // ======================================

    trackingForm.addEventListener("submit", event => {
        event.preventDefault();

        const enteredId = orderIdInput.value.trim();

        trackingResult.hidden = true;

        if (!enteredId) {
            showMessage("Please enter your Order ID.", "error");
            return;
        }

        const orders = getOrders();

        const order = orders.find(item =>
            getOrderId(item).toLowerCase() === enteredId.toLowerCase()
        );

        if (!order) {
            showMessage(
                "Order not found. Please check your Order ID.",
                "error"
            );
            return;
        }

        showMessage("Order found successfully!", "success");

        displayOrder(order);

        trackingResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

});
