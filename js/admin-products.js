
// ==========================================
// YOURSHOP - ADMIN PRODUCT MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const STORAGE_KEY = "yourshop-admin-products";

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

    // ======================================
    // 2. LOAD PRODUCTS
    // ======================================

    let allProducts = [];

    try {
        const savedProducts = localStorage.getItem(STORAGE_KEY);

        if (savedProducts !== null) {
            allProducts = JSON.parse(savedProducts);
        } else {
            allProducts = Array.isArray(window.products)
                ? JSON.parse(JSON.stringify(window.products))
                : [];

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(allProducts)
            );
        }

        if (!Array.isArray(allProducts)) {
            allProducts = [];
        }

    } catch (error) {
        console.error("Product loading error:", error);

        allProducts = Array.isArray(window.products)
            ? JSON.parse(JSON.stringify(window.products))
            : [];
    }

    // ======================================
    // 3. SAVE PRODUCTS
    // ======================================

    function saveProducts() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(allProducts)
            );

            return true;

        } catch (error) {
            console.error("Could not save products:", error);

            alert("Could not save products. Check your browser storage.");

            return false;
        }
    }

    // ======================================
    // 4. PRICE FORMAT
    // ======================================

    function formatPrice(price) {
        return Number(price || 0).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    // ======================================
    // 5. STOCK STATUS
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
    // 6. UPDATE STATISTICS
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
    // 7. DISPLAY PRODUCTS
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

            const stock = Math.max(0, Number(product.stock) || 0);
            const status = getStockStatus(stock);

            const image =
                product.image ||
                (Array.isArray(product.images)
                    ? product.images[0]
                    : "");

            const row = document.createElement("tr");

            // Product information
            const productCell = document.createElement("td");

            const info = document.createElement("div");
            info.className = "admin-product-info";

            const img = document.createElement("img");
            img.className = "admin-product-image";
            img.src = image || "";
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
    // 8. SEARCH AND CATEGORY FILTER
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
    // 9. CREATE PRODUCT MODAL
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
                        <input
                            id="new-product-name"
                            type="text"
                            maxlength="120"
                            required>
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
                        <input
                            id="new-product-price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-discount">Discount (%)</label>
                        <input
                            id="new-product-discount"
                            type="number"
                            min="0"
                            max="100"
                            value="0"
                            required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-stock">Stock Quantity</label>
                        <input
                            id="new-product-stock"
                            type="number"
                            min="0"
                            step="1"
                            value="0"
                            required>
                    </div>

                    <div class="product-form-group">
                        <label for="new-product-rating">Rating</label>
                        <input
                            id="new-product-rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value="0">
                    </div>

                    <div class="product-form-group full-width">
                        <label for="new-product-image">Product Image URL</label>
                        <input
                            id="new-product-image"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            required>
                    </div>

                </div>

                <div class="product-form-actions">

                    <button
                        type="button"
                        class="cancel-product-button">
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="save-product-button">
                        Save Product
                    </button>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById("admin-product-form");
    const modalTitle = document.getElementById("product-modal-title");

    let editingProductId = null;

    // ======================================
    // 10. OPEN AND CLOSE MODAL
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
                (Array.isArray(product.images)
                    ? product.images[0]
                    : "") ||
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
        addButton.addEventListener("click", () => {
            openModal();
        });
    }

    // ======================================
    // 11. SAVE PRODUCT
    // ======================================

    form.addEventListener("submit", event => {

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

        // Validate form values
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

        // Keep a backup in case saving fails.
        const previousProducts = [...allProducts];

        if (isEditing) {

            const index = allProducts.findIndex(product =>
                String(product.id) === String(editingProductId)
            );

            if (index === -1) {
                alert("Product could not be found.");
                closeModal();
                return;
            }

            const existingProduct = allProducts[index];

            allProducts[index] = {
                ...existingProduct,
                name,
                category,
                price,
                discount,
                stock,
                rating,
                image,

                // Keep the existing product gallery images.
                images: Array.isArray(existingProduct.images) &&
                        existingProduct.images.length > 0
                    ? [
                        image,
                        ...existingProduct.images.slice(1)
                    ]
                    : [image]
            };

        } else {

            const nextId = allProducts.reduce((max, product) => {
                return Math.max(max, Number(product.id) || 0);
            }, 0) + 1;

            allProducts.push({
                id: nextId,
                name,
                category,
                price,
                discount,
                stock,
                rating,
                image,
                images: [image]
            });
        }

        // Save products.
        const saved = saveProducts();

        if (!saved) {
            allProducts = previousProducts;
            updateStats();
            filterProducts();
            return;
        }

        // Record admin activity.
        if (typeof window.logAdminActivity === "function") {

            window.logAdminActivity(
                isEditing ? "Product updated" : "Product added",

                isEditing
                    ? `Administrator updated product: ${name}.`
                    : `Administrator added a new product: ${name}.`,

                "products"
            );
        }

        updateStats();
        filterProducts();

        closeModal();

        alert(
            isEditing
                ? "Product updated successfully!"
                : "Product added successfully!"
        );
    });

    // ======================================
    // 12. EDIT AND DELETE PRODUCTS
    // ======================================

    if (productTable) {

        productTable.addEventListener("click", event => {

            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const id = button.dataset.id;

            const product = allProducts.find(item =>
                String(item.id) === String(id)
            );

            if (!product) return;

            // EDIT
            if (button.dataset.action === "edit") {
                openModal(product);
            }

            // DELETE
            if (button.dataset.action === "delete") {

                const confirmed = confirm(
                    `Are you sure you want to delete "${product.name}"?`
                );

                if (!confirmed) return;

                // Keep a backup in case saving fails.
                const previousProducts = [...allProducts];

                // Remove product.
                allProducts = allProducts.filter(item =>
                    String(item.id) !== String(id)
                );

                // Save changes.
                const saved = saveProducts();

                if (!saved) {
                    allProducts = previousProducts;
                    updateStats();
                    filterProducts();
                    return;
                }

                // Record admin activity.
                if (typeof window.logAdminActivity === "function") {

                    window.logAdminActivity(
                        "Product deleted",
                        `Administrator deleted product: ${product.name}.`,
                        "products"
                    );
                }

                updateStats();
                filterProducts();

                alert("Product deleted successfully!");
            }
        });
    }

    // ======================================
    // 13. INITIALIZE PAGE
    // ======================================

    updateStats();
    displayProducts(allProducts);

    console.log(
        "YourShop Admin Products loaded:",
        allProducts.length
    );

});
