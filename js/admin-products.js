
/* ==========================================
   YOURSHOP - ADMIN PRODUCT MANAGEMENT
   MYSQL BACKEND + JWT AUTHENTICATION
   + ACTIVITY LOG
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const API_URL = "http://localhost:3000/api/products";
    const TOKEN_KEY = "yourshop-admin-token";

    // ======================================
    // 1. GET HTML ELEMENTS
    // ======================================

    const productTable = document.getElementById("admin-products-list");

    const totalCount = document.getElementById("product-total-count");
    const inStockCount = document.getElementById("product-in-stock");
    const lowStockCount = document.getElementById("product-low-stock");
    const outStockCount = document.getElementById("product-out-stock");
    const resultsCount = document.getElementById("product-results-count");

    const searchInput = document.getElementById("product-search");
    const categoryFilter = document.getElementById("product-category-filter");
    const addButton = document.getElementById("add-product-button");

    let allProducts = [];

    // ======================================
    // 2. JWT AUTHENTICATION
    // ======================================

    function getAdminToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getAuthHeaders(additionalHeaders = {}) {
        const token = getAdminToken();

        if (!token) {
            throw new Error(
                "Admin login required. Please log in again."
            );
        }

        return {
            ...additionalHeaders,
            Authorization: `Bearer ${token}`
        };
    }

    // ======================================
    // 3. ACTIVITY LOGGER
    // ======================================

    function logProductActivity(action, details) {
        if (typeof window.logAdminActivity !== "function") {
            console.warn("Admin Activity Logger is not loaded.");
            return;
        }

        const saved = window.logAdminActivity(
            action,
            details,
            "products"
        );

        if (!saved) {
            console.error("Product activity could not be saved.");
        }
    }

    // ======================================
    // 4. API REQUEST HELPER
    // JWT TOKEN INCLUDED
    // ======================================

    async function apiRequest(url, options = {}) {
        const headers = getAuthHeaders({
            ...(options.headers || {})
        });

        if (options.body && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        let result;

        try {
            result = await response.json();
        } catch {
            throw new Error("Invalid response received from backend.");
        }

        if (response.status === 401 || response.status === 403) {
            throw new Error(
                result.message ||
                "Your admin session has expired. Please log in again."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Backend request failed."
            );
        }

        return result;
    }

    // ======================================
    // 5. LOAD PRODUCTS FROM MYSQL
    // ======================================

    function normalizeProduct(product) {
        let images = product.images || [];

        if (typeof images === "string") {
            try {
                images = JSON.parse(images);
            } catch {
                images = [];
            }
        }

        if (!Array.isArray(images)) {
            images = [];
        }

        return {
            ...product,
            id: Number(product.id),
            price: Number(product.price),
            discount: Number(product.discount || 0),
            rating: Number(product.rating || 0),
            stock: Number(product.stock || 0),
            soldCount: Number(product.sold_count || 0),
            images,
            image: product.image || images[0] || ""
        };
    }

    async function loadProducts() {
        try {
            if (productTable) {
                productTable.innerHTML = `
                    <tr>
                        <td colspan="6">Loading products...</td>
                    </tr>
                `;
            }

            const result = await apiRequest(API_URL, {
                method: "GET"
            });

            if (!Array.isArray(result.products)) {
                throw new Error("Invalid product data received.");
            }

            allProducts = result.products.map(normalizeProduct);

            updateStats();
            filterProducts();

            console.log(
                "Admin products loaded from MySQL:",
                allProducts.length
            );

        } catch (error) {
            console.error("Product loading error:", error);

            if (productTable) {
                productTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center; padding:20px;">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }

            alert(
                "Could not load products.\n\n" +
                error.message
            );
        }
    }

    // ======================================
    // 6. ESCAPE HTML
    // ======================================

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
    // 7. FORMAT PRICE
    // ======================================

    function formatPrice(price) {
        return Number(price || 0).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    // ======================================
    // 8. STOCK STATUS
    // ======================================

    function getStockStatus(stock) {
        if (stock <= 0) {
            return {
                text: "Out of Stock",
                className: "stock-out"
            };
        }

        if (stock <= 5) {
            return {
                text: "Low Stock",
                className: "stock-low"
            };
        }

        return {
            text: "In Stock",
            className: "stock-in"
        };
    }

    // ======================================
    // 9. UPDATE STATISTICS
    // ======================================

    function updateStats() {
        const total = allProducts.length;

        const inStock = allProducts.filter(product =>
            Number(product.stock) > 5
        ).length;

        const lowStock = allProducts.filter(product =>
            Number(product.stock) > 0 &&
            Number(product.stock) <= 5
        ).length;

        const outStock = allProducts.filter(product =>
            Number(product.stock) <= 0
        ).length;

        if (totalCount) totalCount.textContent = total;
        if (inStockCount) inStockCount.textContent = inStock;
        if (lowStockCount) lowStockCount.textContent = lowStock;
        if (outStockCount) outStockCount.textContent = outStock;
    }

    // ======================================
    // 10. DISPLAY PRODUCTS
    // ======================================

    function displayProducts(productList) {
        if (!productTable) return;

        productTable.innerHTML = "";

        if (resultsCount) {
            resultsCount.textContent =
                `${productList.length} products`;
        }

        if (productList.length === 0) {
            productTable.innerHTML = `
                <tr>
                    <td colspan="6" class="no-admin-products">
                        No products found.
                    </td>
                </tr>
            `;
            return;
        }

        productList.forEach(product => {
            const stock = Math.max(
                0,
                Number(product.stock) || 0
            );

            const status = getStockStatus(stock);

            const image =
                product.image ||
                product.images?.[0] ||
                "";

            const row = document.createElement("tr");

            // Product
            const productCell = document.createElement("td");

            const info = document.createElement("div");
            info.className = "admin-product-info";

            const img = document.createElement("img");
            img.className = "admin-product-image";
            img.src = image;
            img.alt = product.name || "Product";

            img.onerror = function () {
                this.style.display = "none";
            };

            const name = document.createElement("span");
            name.className = "admin-product-name";
            name.textContent = product.name || "Unnamed Product";

            info.append(img, name);
            productCell.appendChild(info);

            // Category
            const categoryCell = document.createElement("td");
            categoryCell.textContent =
                product.category || "Uncategorized";

            // Price
            const priceCell = document.createElement("td");
            priceCell.textContent = formatPrice(product.price);

            // Discount
            const discountCell = document.createElement("td");
            discountCell.textContent =
                `${Number(product.discount) || 0}%`;

            // Stock
            const stockCell = document.createElement("td");

            const badge = document.createElement("span");
            badge.className = `stock-badge ${status.className}`;
            badge.textContent = `${stock} - ${status.text}`;

            stockCell.appendChild(badge);

            // Actions
            const actionsCell = document.createElement("td");

            const actions = document.createElement("div");
            actions.className = "product-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-product-button";
            editButton.textContent = "Edit";
            editButton.dataset.action = "edit";
            editButton.dataset.id = product.id;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-product-button";
            deleteButton.textContent = "Delete";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.id = product.id;

            actions.append(editButton, deleteButton);
            actionsCell.appendChild(actions);

            row.append(
                productCell,
                categoryCell,
                priceCell,
                discountCell,
                stockCell,
                actionsCell
            );

            productTable.appendChild(row);
        });
    }

    // ======================================
    // 11. SEARCH AND FILTER
    // ======================================

    function filterProducts() {
        const search = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const category = categoryFilter
            ? categoryFilter.value
            : "all";

        const filteredProducts = allProducts.filter(product => {
            const name = (product.name || "").toLowerCase();

            const matchesName = name.includes(search);

            const matchesCategory =
                category === "all" ||
                product.category === category;

            return matchesName && matchesCategory;
        });

        displayProducts(filteredProducts);
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterProducts);
    }

    // ======================================
    // 12. CREATE PRODUCT MODAL
    // ======================================

    const modal = document.createElement("div");
    modal.className = "product-modal";

    modal.innerHTML = `
        <div class="product-modal-content">

            <div class="product-modal-header">
                <h2 id="product-modal-title">Add New Product</h2>

                <button
                    type="button"
                    class="close-product-modal"
                    aria-label="Close">
                    &times;
                </button>
            </div>

            <form id="admin-product-form">

                <div class="product-form-grid">

                    <div class="product-form-group full-width">
                        <label for="new-product-name">Product Name</label>
                        <input id="new-product-name" type="text"
                            maxlength="120" required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-category">Category</label>

                        <select id="new-product-category" required>
                            <option value="">Select Category</option>
                            <option value="smartphones">Smartphones</option>
                            <option value="headphones">Headphones</option>
                            <option value="laptops">Laptops</option>
                            <option value="smart-watches">Smart Watches</option>
                            <option value="accessories">Accessories</option>
                            <option value="gaming">Gaming</option>
                            <option value="cameras">Cameras</option>
                            <option value="home-appliances">Home Appliances</option>
                            <option value="men-fashion">Men's Fashion</option>
                            <option value="women-fashion">Women's Fashion</option>
                        </select>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-price">Price ($)</label>
                        <input id="new-product-price" type="number"
                            min="0.01" step="0.01" required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-discount">Discount (%)</label>
                        <input id="new-product-discount" type="number"
                            min="0" max="100" value="0" required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-stock">Stock Quantity</label>
                        <input id="new-product-stock" type="number"
                            min="0" step="1" value="0" required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-rating">Rating</label>
                        <input id="new-product-rating" type="number"
                            min="0" max="5" step="0.1" value="0">
                    </div>

                    <div class="product-form-group full-width">
                        <label for="new-product-image">Product Image URL</label>
                        <input id="new-product-image" type="url"
                            placeholder="https://example.com/image.jpg"
                            required>
                    </div>

                </div>

                <div class="product-form-actions">

                    <button type="button" class="cancel-product-button">
                        Cancel
                    </button>

                    <button type="submit" class="save-product-button">
                        Save Product
                    </button>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById("admin-product-form");
    const modalTitle = document.getElementById("product-modal-title");
    const saveButton = form.querySelector(".save-product-button");

    let editingProductId = null;

    // ======================================
    // 13. OPEN AND CLOSE MODAL
    // ======================================

    function closeModal() {
        modal.classList.remove("active");
        form.reset();
        editingProductId = null;
    }

    function openModal(product = null) {
        form.reset();

        editingProductId = product ? product.id : null;

        modalTitle.textContent = product
            ? "Edit Product"
            : "Add New Product";

        if (product) {
            document.getElementById("new-product-name").value =
                product.name || "";

            document.getElementById("new-product-category").value =
                product.category || "";

            document.getElementById("new-product-price").value =
                product.price ?? "";

            document.getElementById("new-product-discount").value =
                product.discount ?? 0;

            document.getElementById("new-product-stock").value =
                product.stock ?? 0;

            document.getElementById("new-product-rating").value =
                product.rating ?? 0;

            document.getElementById("new-product-image").value =
                product.image ||
                product.images?.[0] ||
                "";
        }

        modal.classList.add("active");
    }

    modal.querySelector(".close-product-modal")
        .addEventListener("click", closeModal);

    modal.querySelector(".cancel-product-button")
        .addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    if (addButton) {
        addButton.addEventListener("click", () => openModal());
    }

    // ======================================
    // 14. ADD OR UPDATE PRODUCT IN MYSQL
    // ======================================

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const name =
            document.getElementById("new-product-name").value.trim();

        const category =
            document.getElementById("new-product-category").value;

        const price =
            Number(document.getElementById("new-product-price").value);

        const discount =
            Number(document.getElementById("new-product-discount").value);

        const stock =
            Number(document.getElementById("new-product-stock").value);

        const rating =
            Number(document.getElementById("new-product-rating").value);

        const image =
            document.getElementById("new-product-image").value.trim();

        if (
            !name ||
            !category ||
            !image ||
            !Number.isFinite(price) ||
            price <= 0 ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            !Number.isFinite(discount) ||
            discount < 0 ||
            discount > 100 ||
            !Number.isFinite(rating) ||
            rating < 0 ||
            rating > 5
        ) {
            alert("Please enter valid product information.");
            return;
        }

        const isEditing = editingProductId !== null;

        const existingProduct = isEditing
            ? allProducts.find(product =>
                Number(product.id) === Number(editingProductId)
            )
            : null;

        if (isEditing && !existingProduct) {
            alert("Product could not be found.");
            closeModal();
            return;
        }

        const productData = {
            name,
            category,
            price,
            discount,
            stock,
            rating,
            image,
            images: isEditing &&
                    Array.isArray(existingProduct.images) &&
                    existingProduct.images.length > 0
                ? [image, ...existingProduct.images.slice(1)]
                : [image]
        };

        try {
            saveButton.disabled = true;
            saveButton.textContent = "Saving...";

            if (isEditing) {
                await apiRequest(
                    `${API_URL}/${editingProductId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(productData)
                    }
                );

                logProductActivity(
                    "Product updated",
                    `Administrator updated product: ${name}.`
                );

            } else {
                await apiRequest(API_URL, {
                    method: "POST",
                    body: JSON.stringify(productData)
                });

                logProductActivity(
                    "Product added",
                    `Administrator added a new product: ${name}.`
                );
            }

            await loadProducts();

            closeModal();

            alert(
                isEditing
                    ? "Product updated successfully in MySQL!"
                    : "Product added successfully to MySQL!"
            );

        } catch (error) {
            console.error("Product save error:", error);

            alert(
                "Could not save product.\n\n" +
                error.message
            );

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Product";
        }
    });

    // ======================================
    // 15. EDIT AND DELETE PRODUCTS
    // ======================================

    if (productTable) {
        productTable.addEventListener("click", async event => {
            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const id = button.dataset.id;

            const product = allProducts.find(item =>
                String(item.id) === String(id)
            );

            if (!product) return;

            // EDIT PRODUCT
            if (button.dataset.action === "edit") {
                openModal(product);
                return;
            }

            // DELETE PRODUCT
            if (button.dataset.action === "delete") {
                const confirmed = confirm(
                    `Are you sure you want to permanently delete "${product.name}" from MySQL?`
                );

                if (!confirmed) return;

                button.disabled = true;
                button.textContent = "Deleting...";

                try {
                    await apiRequest(`${API_URL}/${id}`, {
                        method: "DELETE"
                    });

                    logProductActivity(
                        "Product deleted",
                        `Administrator deleted product: ${product.name}.`
                    );

                    await loadProducts();

                    alert("Product deleted successfully from MySQL!");

                } catch (error) {
                    console.error("Product deletion error:", error);

                    alert(
                        "Could not delete product.\n\n" +
                        error.message
                    );

                    button.disabled = false;
                    button.textContent = "Delete";
                }
            }
        });
    }

    // ======================================
    // 16. INITIALIZE PAGE
    // ======================================

    await loadProducts();

    console.log("YourShop Admin Products page initialized.");
});
