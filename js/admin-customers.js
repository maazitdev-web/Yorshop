
// ==========================================
// YOURSHOP - ADMIN CUSTOMERS MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const ORDERS_KEY = "yourshop-orders";

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const customersList = document.getElementById("admin-customers-list");
    const searchInput = document.getElementById("customer-search");

    const totalCount = document.getElementById("customer-total-count");
    const totalOrders = document.getElementById("customer-total-orders");
    const activeCount = document.getElementById("customer-active-count");
    const totalRevenue = document.getElementById("customer-total-revenue");
    const resultsCount = document.getElementById("customer-results-count");

    if (!customersList) {
        console.error("Customers table was not found.");
        return;
    }

    // ======================================
    // 2. LOAD ORDERS
    // ======================================

    function getOrders() {
        try {
            const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
            return Array.isArray(orders) ? orders : [];
        } catch (error) {
            console.error("Could not load orders:", error);
            return [];
        }
    }

    // ======================================
    // 3. FORMAT HELPERS
    // ======================================

    function formatCurrency(amount) {
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

    function getOrderDate(order) {
        const date = order.date || order.createdAt || order.orderDate;

        if (!date) return null;

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    function formatDate(date) {
        if (!date) return "N/A";

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function getOrderTotal(order) {
        return Number(order.total ?? order.totalAmount ?? order.grandTotal) || 0;
    }

    function getCustomerInfo(order) {
        const customer = order.customer || {};

        return {
            name: customer.name || order.customerName || order.name || "Guest Customer",
            email: customer.email || order.customerEmail || order.email || "N/A",
            phone: customer.phone || order.customerPhone || order.phone || "N/A"
        };
    }

    // ======================================
    // 4. CREATE CUSTOMER LIST
    // ======================================

    function getCustomers() {
        const orders = getOrders();
        const customers = new Map();

        orders.forEach(order => {
            const info = getCustomerInfo(order);

            // Use email as the customer identifier when available.
            const key = info.email !== "N/A"
                ? info.email.trim().toLowerCase()
                : info.name.trim().toLowerCase();

            if (!customers.has(key)) {
                customers.set(key, {
                    ...info,
                    orders: [],
                    totalSpent: 0,
                    lastOrder: null
                });
            }

            const customer = customers.get(key);

            customer.orders.push(order);
            customer.totalSpent += getOrderTotal(order);

            const orderDate = getOrderDate(order);

            if (
                orderDate &&
                (!customer.lastOrder || orderDate > customer.lastOrder)
            ) {
                customer.lastOrder = orderDate;
            }
        });

        return Array.from(customers.values())
            .sort((a, b) => b.totalSpent - a.totalSpent);
    }

    // ======================================
    // 5. UPDATE STATISTICS
    // ======================================

    function updateStatistics(customers) {
        const orders = getOrders();

        const revenue = orders.reduce((sum, order) => {
            return sum + getOrderTotal(order);
        }, 0);

        const activeCustomers = customers.filter(customer =>
            customer.orders.some(order => {
                const status = String(order.status || "pending").toLowerCase();
                return !["cancelled", "canceled"].includes(status);
            })
        ).length;

        if (totalCount) {
            totalCount.textContent = customers.length;
        }

        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        if (activeCount) {
            activeCount.textContent = activeCustomers;
        }

        if (totalRevenue) {
            totalRevenue.textContent = formatCurrency(revenue);
        }
    }

    // ======================================
    // 6. DISPLAY CUSTOMERS
    // ======================================

    function displayCustomers(customers) {

        if (!customers.length) {
            customersList.innerHTML = `
                <tr>
                    <td colspan="7">
                        No customers found.
                    </td>
                </tr>
            `;

            if (resultsCount) {
                resultsCount.textContent = "0 customers";
            }

            return;
        }

        customersList.innerHTML = customers.map((customer, index) => {

            return `
                <tr>
                    <td>
                        <span class="customer-name">
                            ${escapeHTML(customer.name)}
                        </span>
                    </td>

                    <td>${escapeHTML(customer.email)}</td>

                    <td>${escapeHTML(customer.phone)}</td>

                    <td>${customer.orders.length}</td>

                    <td>${formatCurrency(customer.totalSpent)}</td>

                    <td>${formatDate(customer.lastOrder)}</td>

                    <td>
                        <button
                            class="view-customer-btn"
                            data-customer-index="${index}"
                        >
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        if (resultsCount) {
            resultsCount.textContent =
                `${customers.length} customer${customers.length === 1 ? "" : "s"}`;
        }
    }

    // ======================================
    // 7. VIEW CUSTOMER DETAILS
    // ======================================

    function viewCustomer(customer) {

        const oldModal = document.querySelector(".customer-modal-overlay");

        if (oldModal) oldModal.remove();

        const orderRows = customer.orders.map(order => {

            const orderId = order.id || order.orderId || "N/A";
            const status = order.status || "Pending";
            const date = formatDate(getOrderDate(order));

            return `
                <tr>
                    <td>${escapeHTML(orderId)}</td>
                    <td>${date}</td>
                    <td>${escapeHTML(status)}</td>
                    <td>${formatCurrency(getOrderTotal(order))}</td>
                </tr>
            `;
        }).join("");

        const modal = document.createElement("div");

        modal.className = "customer-modal-overlay";

        modal.innerHTML = `
            <div class="customer-details-modal">

                <div class="customer-modal-header">
                    <div>
                        <h2>Customer Details</h2>
                        <p>Customer profile and order history</p>
                    </div>

                    <button class="customer-modal-close" aria-label="Close">
                        &times;
                    </button>
                </div>

                <div class="customer-modal-body">

                    <div class="customer-profile-card">
                        <h3>${escapeHTML(customer.name)}</h3>
                        <p>${escapeHTML(customer.email)}</p>
                        <p>${escapeHTML(customer.phone)}</p>
                    </div>

                    <div class="customer-detail-stats">
                        <div>
                            <span>Total Orders</span>
                            <strong>${customer.orders.length}</strong>
                        </div>

                        <div>
                            <span>Total Spent</span>
                            <strong>${formatCurrency(customer.totalSpent)}</strong>
                        </div>
                    </div>

                    <div class="customer-history">
                        <h3>Order History</h3>

                        <div class="customer-history-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${orderRows}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div class="customer-modal-footer">
                    <button class="customer-close-btn">Close</button>
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

        modal.querySelector(".customer-modal-close")
            .addEventListener("click", closeModal);

        modal.querySelector(".customer-close-btn")
            .addEventListener("click", closeModal);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener("keydown", handleEscape);
    }

    // ======================================
    // 8. SEARCH CUSTOMERS
    // ======================================

    function searchCustomers() {

        const customers = getCustomers();

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const filteredCustomers = customers.filter(customer => {

            return (
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm) ||
                customer.phone.toLowerCase().includes(searchTerm)
            );
        });

        displayCustomers(filteredCustomers);
    }

    // ======================================
    // 9. CUSTOMER BUTTON EVENTS
    // ======================================

    customersList.addEventListener("click", event => {

        const button = event.target.closest(".view-customer-btn");

        if (!button) return;

        const index = Number(button.dataset.customerIndex);

        // Use the currently displayed, filtered customer list.
        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const visibleCustomers = getCustomers().filter(customer => (
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.phone.toLowerCase().includes(searchTerm)
        ));

        const customer = visibleCustomers[index];

        if (customer) {
            viewCustomer(customer);
        }
    });

    // ======================================
    // 10. SEARCH EVENT
    // ======================================

    if (searchInput) {
        searchInput.addEventListener("input", searchCustomers);
    }

    // ======================================
    // 11. INITIALIZE PAGE
    // ======================================

    const customers = getCustomers();

    updateStatistics(customers);
    displayCustomers(customers);

    console.log("YourShop customers management loaded successfully!");

});
