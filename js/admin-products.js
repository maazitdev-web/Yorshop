
/* ==========================================
   YOURSHOP - ADMIN PRODUCT MANAGEMENT
   FRONTEND-ONLY VERSION
   LOCALSTORAGE + ACTIVITY LOG
========================================== */

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
    // 2. STORAGE KEYS AND HTML ELEMENTS
    // ======================================

    const PRODUCTS_KEY = "yourshop-admin-products";
    const DELETED_PRODUCTS_KEY = "yourshop-deleted-product-ids";

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
    let editingProductId = null;

    if (!productTable) {
        console.error("Admin product table was not found.");
        return;
    }

    // ======================================
    // 3. LOCALSTORAGE HELPERS
    // ======================================

    function getStorageArray(key) {
        try {
            const value = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("Storage reading error:", key, error);
            return [];
        }
    }

    function saveStorageArray(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Storage saving error:", key, error);
            alert("Unable to save. Your browser storage may be full.");
            return false;
        }
    }

    function getSavedProducts() {
        return getStorageArray(PRODUCTS_KEY);
    }

    function getDeletedProductIds() {
        return getStorageArray(DELETED_PRODUCTS_KEY).map(String);
    }

    // ======================================
    // 4. ACTIVITY LOGGER
    // ======================================

    function logProductActivity(action, details) {
        if (typeof window.logAdminActivity !== "function") {
            console.warn("Admin Activity Logger is not loaded.");
            return;
        }

        window.logAdminActivity(
            action,
            details,
            "products"
        );
    }

    // ======================================
    // 5. NORMALIZE PRODUCT DATA
    // ======================================

    function normalizeProduct(product) {
        let images = product.images || [];

        if (typeof images === "string") {
            try {
                images = JSON.parse(images);
            } catch (error) {
                images = [];
            }
        }

        if (!Array.isArray(images)) {
            images = [];
        }

        return {
            ...product,
            id: product.id,
            price: Number(product.price) || 0,
            discount: Number(product.discount) || 0,
            rating: Number(product.rating) || 0,
            stock: Number(product.stock) || 0,
            soldCount: Number(
                product.soldCount ?? product.sold_count ?? 0
            ),
            images,
            image: product.image || images[0] || ""
        };
    }

    // ======================================
    // 6. GET ALL PRODUCTS
    // ORIGINAL + ADMIN-MANAGED PRODUCTS
    // ======================================

    function getAllProducts() {
        const originalProducts =
            typeof products !== "undefined" && Array.isArray(products)
                ? products
                : [];

        const savedProducts = getSavedProducts();
        const deletedIds = new Set(getDeletedProductIds());

        const productMap = new Map();

        originalProducts.forEach(product => {
            if (product && product.id !== undefined) {
                productMap.set(
                    String(product.id),
                    normalizeProduct(product)
                );
            }
        });

        // Saved records override original products with the same ID.
        savedProducts.forEach(product => {
            if (product && product.id !== undefined) {
                productMap.set(
                    String(product.id),
                    normalizeProduct(product)
                );
            }
        });

        return Array.from(productMap.values()).filter(product => {
            return !deletedIds.has(String(product.id));
        });
    }

    // ======================================
    // 7. LOAD PRODUCTS
    // ======================================

    function loadProducts() {
        allProducts = getAllProducts();

        updateStats();
        filterProducts();

        console.log(
            "Admin products loaded from LocalStorage:",
            allProducts.length
        );
    }

    // ======================================
    // 8. FORMAT AND ESCAPE HELPERS
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

    function formatPrice(price) {
        return Number(price || 0).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    // ======================================
    // 9. STOCK STATUS
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
    // 10. UPDATE STATISTICS
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
    // 11. DISPLAY PRODUCTS
    // ======================================

    function displayProducts(productList) {
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
    // 12. SEARCH AND FILTER
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
            const productCategory = String(
                product.category || ""
            ).toLowerCase();

            const matchesName = name.includes(search);

            const matchesCategory =
                category === "all" ||
                productCategory === category.toLowerCase();

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
    // 13. CREATE PRODUCT MODAL
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

<!-- PRODUCT PROMOTION OPTIONS -->
<div class="product-form-group full-width promotion-group">

    <label class="promotion-heading">Product Promotions</label>

    <div class="promotion-options">

        <label class="promotion-option">
            <input type="checkbox" id="new-product-arrival">
            <span>Mark as New Arrival</span>
        </label>

        <label class="promotion-option">
            <input type="checkbox" id="new-product-bestseller">
            <span>Mark as Best Seller</span>
        </label>

    </div>

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
    // Product promotion checkboxes
const newArrivalCheckbox = document.getElementById(
    "new-product-arrival"
);

const bestSellerCheckbox = document.getElementById(
    "new-product-bestseller"
);

    // ======================================
    // 14. OPEN AND CLOSE MODAL
    // ======================================

    function closeModal() {
        modal.classList.remove("active");
        form.reset();
        editingProductId = null;
    }

    function openModal(product = null) {
        form.reset();

        editingProductId = product
            ? String(product.id)
            : null;

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
        // Load product promotion settings
newArrivalCheckbox.checked = product.isNewArrival === true;

bestSellerCheckbox.checked = product.isBestSeller === true;

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
    // 15. ADD OR UPDATE PRODUCT
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
                String(product.id) === editingProductId
            )
            : null;

        if (isEditing && !existingProduct) {
            alert("Product could not be found.");
            closeModal();
            return;
        }

        const savedProducts = getSavedProducts();

        let productData;

        if (isEditing) {
            // Preserve existing product fields and extra images.
            const existingImages = Array.isArray(existingProduct.images)
                ? existingProduct.images
                : [];

            productData = {
                ...existingProduct,
                id: existingProduct.id,
                name,
                category,
                price,
                discount,
                stock,
                rating,
                isNewArrival: newArrivalCheckbox.checked,
                isBestSeller: bestSellerCheckbox.checked,
                image,
                images: existingImages.length > 1
                    ? [image, ...existingImages.slice(1)]
                    : [image]
            };

            const existingIndex = savedProducts.findIndex(product =>
                String(product.id) === editingProductId
            );

            if (existingIndex >= 0) {
                savedProducts[existingIndex] = productData;
            } else {
                // Save an override for an original products.js product.
                savedProducts.push(productData);
            }

        } else {
            // Generate a unique ID for the new product.
            const newId = Date.now();

productData = {
    id: newId,
    name,
    category,
    price,
    discount,
    stock,
    rating,

    isNewArrival: newArrivalCheckbox.checked,
    isBestSeller: bestSellerCheckbox.checked,

    soldCount: 0,
    image,
    images: [image],
    createdAt: new Date().toISOString()
};
            savedProducts.push(productData);
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        const saved = saveStorageArray(
            PRODUCTS_KEY,
            savedProducts
        );

        if (!saved) {
            saveButton.disabled = false;
            saveButton.textContent = "Save Product";
            return;
        }

        logProductActivity(
            isEditing ? "Product updated" : "Product added",
            isEditing
                ? `Administrator updated product: ${name}.`
                : `Administrator added a new product: ${name}.`
        );

        loadProducts();
        closeModal();

        saveButton.disabled = false;
        saveButton.textContent = "Save Product";

        alert(
            isEditing
                ? "Product updated successfully!"
                : "Product added successfully!"
        );
    });

    // ======================================
    // 16. EDIT AND DELETE PRODUCTS
    // ======================================

    productTable.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = String(button.dataset.id);

        const product = allProducts.find(item =>
            String(item.id) === id
        );

        if (!product) return;

        // EDIT PRODUCT
        if (button.dataset.action === "edit") {
            openModal(product);
            return;
        }

        // DELETE PRODUCT
        if (button.dataset.action === "delete") {
            const confirmed = window.confirm(
                `Are you sure you want to delete "${product.name}"?`
            );

            if (!confirmed) return;

            const savedProducts = getSavedProducts();

            // Remove any saved version or override.
            const updatedProducts = savedProducts.filter(item =>
                String(item.id) !== id
            );

            // Record the ID so original products.js products stay hidden.
            const deletedIds = getDeletedProductIds();

            if (!deletedIds.includes(id)) {
                deletedIds.push(id);
            }

            const productsSaved = saveStorageArray(
                PRODUCTS_KEY,
                updatedProducts
            );

            if (!productsSaved) return;

            const deletedIdsSaved = saveStorageArray(
                DELETED_PRODUCTS_KEY,
                deletedIds
            );

            if (!deletedIdsSaved) {
                alert(
                    "The product record was updated, but its deletion list could not be saved. Please check browser storage."
                );
                return;
            }

            logProductActivity(
                "Product deleted",
                `Administrator deleted product: ${product.name}.`
            );

            loadProducts();

            alert("Product deleted successfully!");
        }
    });

    // ======================================
    // 17. INITIALIZE PAGE
    // ======================================

    loadProducts();

    console.log("YourShop Admin Products initialized successfully.");
});
