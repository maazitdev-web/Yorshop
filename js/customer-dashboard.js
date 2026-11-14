
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================
    // 1. STORAGE HELPERS
    // ============================================

    const getData = (key) => {
        try {
            const data = JSON.parse(localStorage.getItem(key));

            return data ?? [];
        } catch (error) {
            console.error(`Unable to load ${key}:`, error);
            return [];
        }
    };

    const getArray = (key) => {
        const data = getData(key);
        return Array.isArray(data) ? data : [];
    };

let orders = getArray("yourshop-orders");
    const addresses = getArray("yourshop-saved-addresses");
    const wishlist = getArray("yourshop-wishlist");
    const compare = getArray("yourshop-compare");

    // ============================================
    // 2. HELPER FUNCTIONS
    // ============================================

    function normalizeStatus(status) {
        const value = String(status || "pending").toLowerCase();

        if (value === "completed") return "delivered";
        if (value === "canceled") return "cancelled";

        return value;
    }

    function formatPrice(amount) {
        return typeof window.formatPrice === "function"
            ? window.formatPrice(amount)
            : `$${Number(amount || 0).toFixed(2)}`;
    }

    function formatDate(date) {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "N/A";

        return parsedDate.toLocaleDateString();
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

   function getOrderDate(order) {
    return new Date(
        order.created_at ||
        order.orderDate ||
        order.createdAt ||
        order.date ||
        0
    );
}
    function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// ============================================
// 3. CUSTOMER INFORMATION
// ============================================

// Load cached profile first so the dashboard can
// display existing information while the API loads.

const savedProfile = getData("yourshop-profile");

let profile = savedProfile &&
    typeof savedProfile === "object" &&
    !Array.isArray(savedProfile)
    ? savedProfile
    : {};

const customerNameElement =
    document.getElementById("dashboard-customer-name");

const customerEmailElement =
    document.getElementById("dashboard-customer-email");

const welcomeNameElement =
    document.getElementById("welcome-customer-name");

// Optional profile elements.
// Add these IDs to your HTML if you want to display them.

const customerPhoneElement =
    document.getElementById("dashboard-customer-phone");

const customerCreatedElement =
    document.getElementById("dashboard-customer-created");

function displayCustomerProfile(customer) {
    const customerName = customer.name || "Customer";
    const customerEmail = customer.email || "Not available";

    if (customerNameElement) {
        customerNameElement.textContent = customerName;
    }

    if (customerEmailElement) {
        customerEmailElement.textContent = customerEmail;
    }

    if (welcomeNameElement) {
        welcomeNameElement.textContent =
            customerName.split(" ")[0];
    }

    if (customerPhoneElement) {
        customerPhoneElement.textContent =
            customer.phone || "Not provided";
    }

    if (customerCreatedElement) {
        customerCreatedElement.textContent =
            formatDate(customer.created_at);
    }
}

// Display cached information immediately.
displayCustomerProfile(profile);

// Fetch the latest profile from the backend.
async function loadCustomerProfile() {
    const token = localStorage.getItem("customerToken");

    if (!token) {
        console.warn(
            "Customer login token not found. Using cached profile."
        );
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/api/customer/me",
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
                data.message || "Unable to load customer profile."
            );
        }

        if (!data.user) {
            throw new Error("Customer profile data is missing.");
        }

        // Update the current profile.
        profile = data.user;

        // Save the latest profile locally.
        localStorage.setItem(
            "yourshop-profile",
            JSON.stringify(profile)
        );

        // Display the latest information.
        displayCustomerProfile(profile);

        console.log("Customer profile loaded successfully.");

    } catch (error) {
        console.error(
            "Customer profile loading error:",
            error.message
        );
    }
}

loadCustomerProfile();

    // ============================================
    // 5. OTHER STATISTICS
    // ============================================

    setText("dashboard-address-count", addresses.length);
    setText("dashboard-wishlist-count", wishlist.length);
    setText("dashboard-compare-count", compare.length);

// ============================================
// 6. RECENT ORDERS
// ============================================

const recentOrdersContainer =
    document.getElementById("dashboard-recent-orders");

function updateOrderStatistics() {
    setText("dashboard-total-orders", orders.length);

    setText(
        "dashboard-pending-orders",
        orders.filter(order =>
            normalizeStatus(order.status) === "pending"
        ).length
    );

    setText(
        "dashboard-delivered-orders",
        orders.filter(order =>
            normalizeStatus(order.status) === "delivered"
        ).length
    );
}

function renderRecentOrders() {
    if (!recentOrdersContainer) return;

    const recentOrders = [...orders]
        .sort((a, b) => getOrderDate(b) - getOrderDate(a))
        .slice(0, 5);

    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <tr>
                <td colspan="4" class="empty-recent">
                    You haven't placed any orders yet.
                    <br>
                    <a href="./index.html">Start shopping</a>
                </td>
            </tr>
        `;
        return;
    }

    recentOrdersContainer.innerHTML = recentOrders.map(order => {
        const status = normalizeStatus(order.status);

        const orderId = order.id || order.orderId || "N/A";

        const date = formatDate(
            order.created_at ||
            order.orderDate ||
            order.createdAt ||
            order.date
        );

        const total = formatPrice(
            order.total_amount ??
            order.total ??
            order.grandTotal ??
            order.totalAmount ??
            0
        );

        return `
            <tr>
                <td>${escapeHTML(orderId)}</td>
                <td>${escapeHTML(date)}</td>
                <td>${escapeHTML(total)}</td>
                <td>${escapeHTML(status.toUpperCase())}</td>
            </tr>
        `;
    }).join("");
}

renderRecentOrders();
updateOrderStatistics();
    // ============================================
    // 7. RECENTLY PURCHASED PRODUCTS
    // ============================================

    function getOrderProducts(order) {
        const items = Array.isArray(order.items) && order.items.length
            ? order.items
            : Array.isArray(order.products)
                ? order.products
                : [];

        return items;
    }

    function getPurchasedProducts() {
        const sortedOrders = [...orders]
            .filter(order => normalizeStatus(order.status) !== "cancelled")
            .sort((a, b) => getOrderDate(b) - getOrderDate(a));

        const purchasedProducts = [];
        const seenProducts = new Set();

        sortedOrders.forEach(order => {
            const items = getOrderProducts(order);

            items.forEach(item => {
                const product = item.product &&
                    typeof item.product === "object"
                    ? item.product
                    : item;

                const id = product.id ??
                    product.productId ??
                    item.productId;

                const name = product.name ||
                    product.productName ||
                    item.name ||
                    item.productName ||
                    "Purchased Product";

                const uniqueKey = id != null
                    ? String(id)
                    : name.toLowerCase();

                if (seenProducts.has(uniqueKey)) return;

                seenProducts.add(uniqueKey);

                const image = product.image ||
                    product.images?.[0] ||
                    item.image ||
                    item.productImage ||
                    "";

                const price = Number(
                    item.finalPrice ??
                    item.discountedPrice ??
                    item.price ??
                    product.price ??
                    0
                );

                purchasedProducts.push({
                    id,
                    name,
                    image,
                    price,
                    quantity: Number(item.quantity) || 1,
                    status: normalizeStatus(order.status),
                    orderId: order.id || order.orderId || ""
                });
            });
        });

        return purchasedProducts.slice(0, 6);
    }

    function displayPurchasedProducts() {
        const container = document.getElementById(
            "dashboard-purchased-products"
        );

        if (!container) return;

        const purchasedProducts = getPurchasedProducts();

        if (purchasedProducts.length === 0) {
            container.innerHTML = `
                <p class="empty-recent">
                    You haven't purchased any products yet.
                    <br>
                    <a href="./index.html">Start shopping</a>
                </p>
            `;

            return;
        }

        container.innerHTML = purchasedProducts.map(product => {
            const productLink = product.id != null
                ? `./product-detail.html?id=${encodeURIComponent(product.id)}`
                : "./my-orders.html";

            return `
                <article class="purchased-product-card">

                    ${product.image ? `
                        <img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                            loading="lazy"
                        >
                    ` : `
                        <div style="
                            height:145px;
                            display:grid;
                            place-items:center;
                            background:#f8faff;
                            color:#8992a3;
                        ">
                            No Image
                        </div>
                    `}

                    <div class="purchased-product-info">

                        <h3>${escapeHTML(product.name)}</h3>

                        <p class="purchased-product-price">
                            ${formatPrice(product.price)}
                        </p>

                        <p>
                            Quantity: ${product.quantity}
                        </p>

                        <p>
                            Order: ${escapeHTML(product.orderId)}
                        </p>

                        <span class="purchased-product-status">
                            ${escapeHTML(product.status.toUpperCase())}
                        </span>

                        <br>

                        <a
                            href="${productLink}"
                            class="purchased-product-link"
                        >
                            View Product →
                        </a>

                    </div>

                </article>
            `;
        }).join("");
    }
    // ============================================
// LOAD CUSTOMER ORDERS FROM DATABASE
// ============================================

async function loadCustomerOrders() {
    const token = localStorage.getItem("customerToken");

    if (!token) {
        console.warn("Customer token not found.");
        return;
    }

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
                data.message || "Unable to load customer orders."
            );
        }

        orders = Array.isArray(data.orders)
            ? data.orders
            : [];

        // Update dashboard statistics.
        updateOrderStatistics();

        // Display actual database orders.
        renderRecentOrders();

        // Display purchased products.
        displayPurchasedProducts();

        console.log(
            "Customer orders loaded successfully:",
            orders.length
        );

    } catch (error) {
        console.error(
            "Customer orders loading error:",
            error.message
        );
    }
}

loadCustomerOrders();

    displayPurchasedProducts();

    // ============================================
    // 8. CUSTOMER DASHBOARD NOTIFICATIONS
    // ============================================

    function escapeNotificationHTML(value) {
        return escapeHTML(value);
    }

    function loadDashboardNotifications() {
        const notificationList = document.getElementById(
            "dashboard-notification-list"
        );

        const unreadCountElement = document.getElementById(
            "dashboard-unread-notifications"
        );

        const badge = document.getElementById(
            "dashboard-notification-badge"
        );

        if (!notificationList) return;

        const notifications = getArray("yourshop-notifications");

        const unreadNotifications = notifications.filter(
            notification => !notification.read
        );

        if (unreadCountElement) {
            unreadCountElement.textContent = unreadNotifications.length;
        }

        if (badge) {
            badge.textContent = unreadNotifications.length;
            badge.style.display = unreadNotifications.length
                ? "inline-block"
                : "none";
        }

        const latestNotifications = notifications.slice(0, 3);

        if (latestNotifications.length === 0) {
            notificationList.innerHTML = `
                <p class="empty-recent">
                    You don't have any notifications yet.
                </p>
            `;

            return;
        }

        notificationList.innerHTML = latestNotifications.map(notification => {
            const title = escapeNotificationHTML(notification.title);
            const message = escapeNotificationHTML(notification.message);

            const date = notification.createdAt
                ? formatDate(notification.createdAt)
                : "Recently";

            return `
                <div style="
                    padding:16px;
                    border:1px solid #edf0f5;
                    border-radius:9px;
                    background:${notification.read ? "#ffffff" : "#f0f6ff"};
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        align-items:center;
                        margin-bottom:7px;
                    ">

                        <strong style="
                            color:#102a56;
                            font-size:13px;
                        ">
                            ${title}
                        </strong>

                        <span style="
                            color:${notification.read ? "#8992a3" : "#2563eb"};
                            font-size:10px;
                            font-weight:600;
                        ">
                            ${notification.read ? "Read" : "Unread"}
                        </span>

                    </div>

                    <p style="
                        color:#667085;
                        font-size:12px;
                        margin-bottom:7px;
                    ">
                        ${message}
                    </p>

                    <small style="color:#8992a3;font-size:10px;">
                        ${escapeNotificationHTML(date)}
                    </small>

                </div>
            `;
        }).join("");
    }

    loadDashboardNotifications();

    console.log("YourShop Customer Dashboard loaded successfully.");
});
