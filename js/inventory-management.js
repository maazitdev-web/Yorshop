
// ==========================================
// YOURSHOP - INVENTORY MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ======================================
    // 1. STORAGE
    // ======================================

    const PRODUCTS_KEY = "yourshop-admin-products";
    const STOCK_KEY = "yourshop-inventory-stock";
    const HISTORY_KEY = "yourshop-inventory-history";

    const LOW_STOCK_LIMIT = 5;

    let inventoryProducts = [];
    let stockOverrides = {};
    let stockHistory = [];

    // ======================================
    // 2. HTML ELEMENTS
    // ======================================

    const totalProducts = document.getElementById(
        "inventory-total-products"
    );

    const totalStock = document.getElementById(
        "inventory-total-stock"
    );

    const lowStock = document.getElementById(
        "inventory-low-stock"
    );

    const outOfStock = document.getElementById(
        "inventory-out-stock"
    );

    const productList = document.getElementById(
        "inventory-product-list"
    );

    const historyList = document.getElementById(
        "inventory-history-list"
    );

    const searchInput = document.getElementById(
        "inventory-search"
    );

    const categoryFilter = document.getElementById(
        "inventory-category"
    );

    const statusFilter = document.getElementById(
        "inventory-status"
    );

    const message = document.getElementById(
        "inventory-message"
    );

    // ======================================
    // 3. SAFE STORAGE FUNCTIONS
    // ======================================

    function readStorage(key, fallback) {
        try {
            const data = JSON.parse(
                localStorage.getItem(key)
            );

            return data === null ? fallback : data;

        } catch (error) {
            console.error("Storage loading error:", error);
            return fallback;
        }
    }

    function saveStorage(key, data) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {
            console.error("Storage saving error:", error);
            showMessage("Could not save changes.", "error");
            return false;
        }
    }

    // ======================================
    // 4. ESCAPE HTML
    // ======================================

    function escapeHTML(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]
        );
    }

    // ======================================
    // 5. LOAD PRODUCTS
    // ======================================

    function loadInventory() {
        const originalProducts =
            typeof products !== "undefined" &&
            Array.isArray(products)
                ? products
                : [];

        const adminProducts = readStorage(
            PRODUCTS_KEY,
            []
        );

        stockOverrides = readStorage(
            STOCK_KEY,
            {}
        );

        stockHistory = readStorage(
            HISTORY_KEY,
            []
        );

        if (!Array.isArray(adminProducts)) {
            showMessage("Invalid admin product data.", "error");
            return;
        }

        // Combine original and admin products.
        const combinedProducts = [...originalProducts];

        adminProducts.forEach(adminProduct => {
            const existingIndex = combinedProducts.findIndex(
                product =>
                    String(product.id) === String(adminProduct.id)
            );

            if (existingIndex === -1) {
                combinedProducts.push(adminProduct);
            } else {
                combinedProducts[existingIndex] = {
                    ...combinedProducts[existingIndex],
                    ...adminProduct
                };
            }
        });

        inventoryProducts = combinedProducts.map(product => ({
            ...product,
            stock: Number(
                stockOverrides[String(product.id)] ??
                product.stock ??
                0
            )
        }));

        // Keep the in-memory product array updated.
        if (
            typeof products !== "undefined" &&
            Array.isArray(products)
        ) {
            products.forEach(product => {
                const updatedProduct = inventoryProducts.find(
                    item => String(item.id) === String(product.id)
                );

                if (updatedProduct) {
                    product.stock = updatedProduct.stock;
                }
            });
        }

        renderInventory();
        renderHistory();
        updateStatistics();
        loadCategories();
    }

    // ======================================
    // 6. STOCK STATUS
    // ======================================

    function getStockStatus(stock) {
        if (stock <= 0) {
            return {
                label: "Out of Stock",
                className: "out-of-stock"
            };
        }

        if (stock <= LOW_STOCK_LIMIT) {
            return {
                label: "Low Stock",
                className: "low-stock"
            };
        }

        return {
            label: "In Stock",
            className: "in-stock"
        };
    }

    // ======================================
    // 7. UPDATE STATISTICS
    // ======================================

    function updateStatistics() {
        const total = inventoryProducts.length;

        const stockUnits = inventoryProducts.reduce(
            (sum, product) =>
                sum + Math.max(0, Number(product.stock) || 0),
            0
        );

        const lowCount = inventoryProducts.filter(
            product =>
                Number(product.stock) > 0 &&
                Number(product.stock) <= LOW_STOCK_LIMIT
        ).length;

        const outCount = inventoryProducts.filter(
            product => Number(product.stock) <= 0
        ).length;

        totalProducts.textContent = total;
        totalStock.textContent = stockUnits;
        lowStock.textContent = lowCount;
        outOfStock.textContent = outCount;
    }

    // ======================================
    // 8. LOAD CATEGORIES
    // ======================================

    function loadCategories() {
        const selectedValue = categoryFilter.value || "all";

        const categories = [
            ...new Set(
                inventoryProducts
                    .map(product => product.category)
                    .filter(Boolean)
            )
        ].sort();

        categoryFilter.innerHTML =
            '<option value="all">All Categories</option>';

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);
        });

        if (categories.includes(selectedValue)) {
            categoryFilter.value = selectedValue;
        }
    }

    // ======================================
    // 9. FORMAT PRICE
    // ======================================

    function formatPrice(price) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(price);
        }

        return "$ " + (Number(price) || 0).toFixed(2);
    }

    // ======================================
    // 10. DISPLAY INVENTORY
    // ======================================

    function renderInventory() {
        const searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        const selectedCategory = categoryFilter.value;
        const selectedStatus = statusFilter.value;

        const filteredProducts = inventoryProducts.filter(
            product => {
                const name = String(product.name || "")
                    .toLowerCase();

                const category = String(product.category || "");

                const status = getStockStatus(
                    Number(product.stock) || 0
                );

                const matchesSearch =
                    name.includes(searchTerm);

                const matchesCategory =
                    selectedCategory === "all" ||
                    category === selectedCategory;

                const matchesStatus =
                    selectedStatus === "all" ||
                    status.className === selectedStatus;

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus
                );
            }
        );

        if (filteredProducts.length === 0) {
            productList.innerHTML = `
                <tr>
                    <td colspan="6">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }

        productList.innerHTML = filteredProducts.map(
            product => {
                const status = getStockStatus(
                    Number(product.stock) || 0
                );

                return `
                    <tr>
                        <td>
                            <span class="inventory-product-name">
                                ${escapeHTML(product.name)}
                            </span>
                        </td>

                        <td>
                            ${escapeHTML(product.category || "Uncategorized")}
                        </td>

                        <td>
                            ${escapeHTML(formatPrice(product.price))}
                        </td>

                        <td>
                            <strong>${Number(product.stock) || 0}</strong>
                        </td>

                        <td>
                            <span class="inventory-status ${status.className}">
                                ${status.label}
                            </span>
                        </td>

                        <td>
                            <button
                                type="button"
                                class="inventory-action-btn"
                                data-product-id="${escapeHTML(product.id)}"
                            >
                                Update Stock
                            </button>
                        </td>
                    </tr>
                `;
            }
        ).join("");
    }

    // ======================================
    // 11. UPDATE STOCK
    // ======================================

    function updateProductStock(productId) {
        const product = inventoryProducts.find(
            item => String(item.id) === String(productId)
        );

        if (!product) {
            showMessage("Product not found.", "error");
            return;
        }

        const previousStock = Number(product.stock) || 0;

        const newStockInput = prompt(
            `Product: ${product.name}\nCurrent stock: ${previousStock}\n\nEnter the new stock quantity:`,
            String(previousStock)
        );

        if (newStockInput === null) {
            return;
        }

        const newStock = Number(newStockInput);

        if (
            newStockInput.trim() === "" ||
            !Number.isSafeInteger(newStock) ||
            newStock < 0
        ) {
            showMessage(
                "Please enter a valid whole number (0 or higher).",
                "error"
            );
            return;
        }

        if (newStock === previousStock) {
            showMessage("Stock quantity has not changed.", "error");
            return;
        }

        const oldOverrides = { ...stockOverrides };

        const oldAdminProducts = readStorage(
            PRODUCTS_KEY,
            []
        );

        const newOverrides = {
            ...stockOverrides,
            [String(product.id)]: newStock
        };

        const updatedAdminProducts = oldAdminProducts.map(
            item => {
                if (String(item.id) === String(product.id)) {
                    return {
                        ...item,
                        stock: newStock
                    };
                }

                return item;
            }
        );

        // Save both stores before changing the page data.
        if (!saveStorage(STOCK_KEY, newOverrides)) {
            return;
        }

        if (
            !saveStorage(
                PRODUCTS_KEY,
                updatedAdminProducts
            )
        ) {
            // Restore previous stock overrides if saving fails.
            saveStorage(STOCK_KEY, oldOverrides);
            return;
        }

        stockOverrides = newOverrides;

        product.stock = newStock;

        const historyEntry = {
            id: "STOCK-" + Date.now(),
            productId: product.id,
            productName: product.name,
            previousStock: previousStock,
            newStock: newStock,
            change: newStock - previousStock,
            date: new Date().toISOString()
        };

        stockHistory.unshift(historyEntry);
        stockHistory = stockHistory.slice(0, 100);

        if (!saveStorage(HISTORY_KEY, stockHistory)) {
            showMessage(
                "Stock saved, but history could not be saved.",
                "error"
            );
        }

        // Update in-memory products.
        if (
            typeof products !== "undefined" &&
            Array.isArray(products)
        ) {
            const originalProduct = products.find(
                item => String(item.id) === String(product.id)
            );

            if (originalProduct) {
                originalProduct.stock = newStock;
            }
        }

        // Activity Log
        if (typeof window.logAdminActivity === "function") {
            window.logAdminActivity(
                "Inventory stock updated",
                `${product.name}: stock changed from ${previousStock} to ${newStock}.`,
                "products"
            );
        }

        renderInventory();
        renderHistory();
        updateStatistics();

        showMessage(
            `Stock updated successfully for ${product.name}.`,
            "success"
        );
    }

    // ======================================
    // 12. DISPLAY STOCK HISTORY
    // ======================================

    function renderHistory() {
        if (!Array.isArray(stockHistory) ||
            stockHistory.length === 0) {

            historyList.innerHTML = `
                <tr>
                    <td colspan="5">
                        No stock adjustments yet.
                    </td>
                </tr>
            `;

            return;
        }

        historyList.innerHTML = stockHistory.map(entry => {
            const change = Number(entry.change) || 0;

            const changeText = change > 0
                ? `+${change}`
                : String(change);

            const changeColor = change > 0
                ? "#15803d"
                : "#dc2626";

            return `
                <tr>
                    <td>
                        <strong>
                            ${escapeHTML(entry.productName)}
                        </strong>
                    </td>

                    <td>
                        ${Number(entry.previousStock) || 0}
                    </td>

                    <td>
                        ${Number(entry.newStock) || 0}
                    </td>

                    <td style="color:${changeColor}; font-weight:600;">
                        ${changeText}
                    </td>

                    <td>
                        ${formatDate(entry.date)}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ======================================
    // 13. FORMAT DATE
    // ======================================

    function formatDate(dateValue) {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Unknown";
        }

        return date.toLocaleString();
    }

    // ======================================
    // 14. SHOW MESSAGE
    // ======================================

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `inventory-message ${type}`;

        window.clearTimeout(showMessage.timer);

        showMessage.timer = window.setTimeout(() => {
            message.textContent = "";
            message.className = "inventory-message";
        }, 4000);
    }

    // ======================================
    // 15. EVENT LISTENERS
    // ======================================

    searchInput.addEventListener("input", renderInventory);

    categoryFilter.addEventListener("change", renderInventory);

    statusFilter.addEventListener("change", renderInventory);

    productList.addEventListener("click", event => {
        const button = event.target.closest(
            ".inventory-action-btn"
        );

        if (!button) {
            return;
        }

        updateProductStock(button.dataset.productId);
    });

    // ======================================
    // 16. INITIALIZE
    // ======================================

    loadInventory();

    console.log("YourShop Inventory Management loaded successfully.");

});
