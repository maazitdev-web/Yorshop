
// ============================================
// YOURSHOP - MAIN JAVASCRIPT
// ============================================
// Features:
// Navigation, hero slider, products, MySQL backend,
// cart, wishlist, compare, quick view, search,
// filters, sorting, pagination, newsletter,
// and back to top.
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

    "use strict";

    // ============================================
    // 1. SELECT HTML ELEMENTS
    // ============================================

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    const productGrid = document.getElementById("product-grid");
    const bestSellersGrid = document.getElementById("best-sellers-grid");
    const newArrivalsGrid = document.getElementById("new-arrivals-grid");

    const sortSelect = document.getElementById("sort-products");

    const cartCount = document.getElementById("cart-count");
    const wishlistCount = document.getElementById("wishlist-count");

    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("product-search");
    const searchCategory = document.getElementById("search-category");

    const categoryList = document.querySelector(".category-list");

    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");

    const applyPriceButton = document.getElementById("apply-price-filter");
    const resetPriceButton = document.getElementById("reset-price-filter");

    // Hide Admin Login link when administrator is logged in
const adminToken = sessionStorage.getItem("yourshop-admin-token");

const adminLoginLinks = document.querySelectorAll(
    'a[href="./admin-login.html"]'
);

if (adminToken) {
    adminLoginLinks.forEach(link => {
        link.style.display = "none";
    });
}
// ============================================
// 2. LOCAL PRODUCT PAGINATION SETTINGS
// ============================================

let currentPage = 1;
const productsPerPage = 8;
let totalPages = 1;
let totalProducts = 0;

let searchRequestId = 0;

    // ============================================
    // 3. CHECK PRODUCTS.JS
    // ============================================

    if (typeof products === "undefined" || !Array.isArray(products)) {

        console.error(
            "YourShop: products.js must load before main.js."
        );

        return;
    }


    // ============================================
    // 4. LOAD PRODUCTS FROM MYSQL
    // ============================================

    // ============================================
    // 5. LOAD CENTRAL INVENTORY STOCK
    // ============================================

    try {

        const savedStock = JSON.parse(
            localStorage.getItem("yourshop-inventory-stock") || "{}"
        );

        if (
            savedStock &&
            typeof savedStock === "object" &&
            !Array.isArray(savedStock)
        ) {

            products.forEach(product => {

                const productId = String(product.id);

                if (
                    Object.prototype.hasOwnProperty.call(
                        savedStock,
                        productId
                    )
                ) {

                    const stock = Number(savedStock[productId]);

                    if (
                        Number.isSafeInteger(stock) &&
                        stock >= 0
                    ) {

                        product.stock = stock;

                    }

                }

            });

        }

        console.log(
            "YourShop inventory stock synchronized."
        );

    } catch (error) {

        console.error(
            "Could not load inventory stock:",
            error
        );

    }

    // ============================================
    // 6. LOCAL STORAGE HELPERS
    // ============================================

    function getStoredArray(key) {

        try {

            const value = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(value) ? value : [];

        } catch (error) {

            console.warn(
                `Could not read ${key}:`,
                error
            );

            return [];

        }

    }

    function saveStoredArray(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

        } catch (error) {

            console.error(
                `Could not save ${key}:`,
                error
            );

            alert(
                "Your browser could not save this change."
            );

        }

    }

    function getCart() {
        return getStoredArray("yourshop-cart");
    }

    function saveCart(cart) {
        saveStoredArray("yourshop-cart", cart);
    }

    function getWishlist() {

        return getStoredArray("yourshop-wishlist")
            .map(Number)
            .filter(Number.isFinite);

    }

    function saveWishlist(list) {
        saveStoredArray("yourshop-wishlist", list);
    }

    function getCompareList() {

        return getStoredArray("yourshop-compare")
            .map(Number)
            .filter(Number.isFinite);

    }

    function saveCompareList(list) {
        saveStoredArray("yourshop-compare", list);
    }

    // ============================================
    // 7. MOBILE SLIDE-OUT NAVIGATION
    // ============================================

    const headerContent = document.getElementById("header-content");
    const menuOverlay = document.getElementById("menu-overlay");
    const menuClose = document.getElementById("menu-close");

    const categoryExpandButton = document.getElementById(
        "category-expand-button"
    );

    const menuCategories = document.getElementById("menu-categories");

    const mobileScreen = window.matchMedia("(max-width: 760px)");

    function openMobileMenu() {

        if (!mobileScreen.matches || !headerContent) return;

        headerContent.classList.add("open");

        if (menuOverlay) {
            menuOverlay.hidden = false;

            requestAnimationFrame(() => {
                menuOverlay.classList.add("active");
            });
        }

        document.body.classList.add("menu-open");

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation menu");
        menuToggle.textContent = "✕";

        headerContent.setAttribute("aria-hidden", "false");
    }

    function closeMobileMenu() {

        if (!headerContent) return;

        headerContent.classList.remove("open");

        if (menuOverlay) {
            menuOverlay.classList.remove("active");

            setTimeout(() => {
                if (!menuOverlay.classList.contains("active")) {
                    menuOverlay.hidden = true;
                }
            }, 300);
        }

        document.body.classList.remove("menu-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
            menuToggle.textContent = "☰";
        }

        headerContent.setAttribute("aria-hidden", "true");
    }

    // Open and close menu button
    if (menuToggle && headerContent) {

        menuToggle.addEventListener("click", () => {

            if (!mobileScreen.matches) return;

            const isOpen = headerContent.classList.contains("open");

            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }

        });

    }

    // Close button
    if (menuClose) {
        menuClose.addEventListener("click", closeMobileMenu);
    }

    // Close when dark overlay is clicked
    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeMobileMenu);
    }

    // Close when a navigation link is selected
    if (navLinks) {

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                closeMobileMenu();
            });

        });

    }

    // Close after submitting search
    if (searchForm) {
        searchForm.addEventListener("submit", closeMobileMenu);
    }

    // Expand and collapse categories
    if (categoryExpandButton && menuCategories) {

        categoryExpandButton.addEventListener("click", () => {

            const isExpanded =
                categoryExpandButton.getAttribute("aria-expanded") === "true";

            categoryExpandButton.setAttribute(
                "aria-expanded",
                String(!isExpanded)
            );

            menuCategories.hidden = isExpanded;

        });

    }

    // Close menu with Escape key
    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMobileMenu();
        }

    });

    // Reset mobile menu when switching to desktop
    mobileScreen.addEventListener("change", event => {

        if (!event.matches) {
            closeMobileMenu();

            if (menuCategories) {
                menuCategories.hidden = true;
            }

            if (categoryExpandButton) {
                categoryExpandButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }

    });


    // ============================================
    // 8. HERO SLIDER
    // ============================================

    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");

    let currentSlide = 0;
    let sliderInterval = null;

    if (slides.length > 0) {

        function showSlide(index) {

            slides.forEach(slide => {
                slide.classList.remove("active");
            });

            dots.forEach(dot => {
                dot.classList.remove("active");
            });

            slides[index].classList.add("active");

            if (dots[index]) {
                dots[index].classList.add("active");
            }

            currentSlide = index;

        }

        function startSlider() {

            if (slides.length < 2) return;

            clearInterval(sliderInterval);

            sliderInterval = setInterval(() => {

                showSlide(
                    (currentSlide + 1) % slides.length
                );

            }, 3000);

        }

        if (dots.length === slides.length) {

            dots.forEach((dot, index) => {

                dot.addEventListener("click", () => {

                    showSlide(index);
                    startSlider();

                });

            });

        }

        showSlide(0);
        startSlider();

    }

    // ============================================
    // 9. PRODUCT HELPERS
    // ============================================

    function getDiscountedPrice(product) {

        const price = Number(product.price) || 0;
        const discount = Number(product.discount) || 0;

        return price * (1 - discount / 100);

    }

    function formatPrice(amount) {

        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return `$${Number(amount || 0).toFixed(2)}`;

    }

    function getProductById(id) {

        return products.find(product =>
            Number(product.id) === Number(id)
        );

    }

    // ============================================
    // 10. HEADER COUNTERS
    // ============================================

    function updateCartCount() {

        if (!cartCount) return;

        const quantity = getCart().reduce((total, item) => {

            return total + Math.max(
                0,
                Number(item.quantity) || 0
            );

        }, 0);

        cartCount.textContent = quantity;

    }

    function updateWishlistCount() {

        if (!wishlistCount) return;

        wishlistCount.textContent = getWishlist().length;

    }

    // ============================================
    // 11. QUICK VIEW MODAL
    // ============================================

    const quickViewModal = document.createElement("div");

    quickViewModal.id = "quick-view-modal";
    quickViewModal.className = "quick-view-modal";

    quickViewModal.innerHTML = `
        <div class="quick-view-content">

            <button
                type="button"
                class="quick-view-close"
                aria-label="Close Quick View"
            >
                &times;
            </button>

            <div
                class="quick-view-details"
                id="quick-view-details"
            ></div>

        </div>
    `;

    document.body.appendChild(quickViewModal);

    function openQuickView(productId) {

        const product = getProductById(productId);

        if (!product) {

            console.error(
                "Product not found:",
                productId
            );

            return;

        }

        const details = document.getElementById(
            "quick-view-details"
        );

        const discountedPrice = getDiscountedPrice(product);

        const image = product.images && product.images.length
            ? product.images[0]
            : product.image;

        const stock = Number(product.stock) || 0;

        details.innerHTML = `

            <div class="quick-view-image">

                <img
                    src="${image || ""}"
                    alt="${product.name || "Product"}"
                >

            </div>

            <div class="quick-view-info">

                <h2>${product.name || "Unnamed Product"}</h2>

                <p class="quick-view-category">
                    ${String(product.category || "").replace(/-/g, " ")}
                </p>

                <p class="quick-view-rating">
                    ⭐ ${Number(product.rating || 0).toFixed(1)} / 5
                </p>

                <div class="quick-view-prices">

                    <strong>
                        ${formatPrice(discountedPrice)}
                    </strong>

                    <del>
                        ${formatPrice(product.price)}
                    </del>

                </div>

                <p>
                    Discount: ${Number(product.discount) || 0}%
                </p>

                <p>
                    Stock:
                    ${stock > 0 ? stock + " available" : "Out of Stock"}
                </p>

                <button
                    type="button"
                    class="quick-view-add-cart"
                    data-product-id="${product.id}"
                    ${stock <= 0 ? "disabled" : ""}
                >
                    ${stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                <a
                    href="./product-detail.html?id=${encodeURIComponent(product.id)}"
                    class="quick-view-details-link"
                >
                    View Full Details
                </a>

            </div>

        `;

        quickViewModal.classList.add("active");
        document.body.classList.add("quick-view-open");

    }

    function closeQuickView() {

        quickViewModal.classList.remove("active");
        document.body.classList.remove("quick-view-open");

    }

    quickViewModal.addEventListener("click", event => {

        const addButton = event.target.closest(
            ".quick-view-add-cart"
        );

        if (addButton) {

            event.preventDefault();

            addProductToCart(
                addButton.dataset.productId
            );

            return;

        }

        if (
            event.target === quickViewModal ||
            event.target.closest(".quick-view-close")
        ) {

            closeQuickView();

        }

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeQuickView();
        }

    });

    // ============================================
    // 12. PRODUCT CARD TEMPLATE
    // ============================================

    function createProductCard(product, options = {}) {

        const id = Number(product.id);

        const wishlisted = getWishlist().includes(id);
        const compared = getCompareList().includes(id);

        const price = getDiscountedPrice(product);

        const category = String(product.category || "")
            .replace(/-/g, " ");

        const badge = options.newArrival

            ? '<span class="new-arrival-badge">NEW</span>'

            : `<span class="discount-badge">${Number(product.discount) || 0}% OFF</span>`;

        const card = document.createElement("div");

        card.className = "product-card";
        card.dataset.productId = String(id);

        card.innerHTML = `

            <div class="product-image-container">

                <img
                    src="${product.image || (product.images && product.images[0]) || ""}"
                    alt="${product.name || "Product"}"
                    loading="lazy"
                >

                ${badge}

                <button
                    type="button"
                    class="wishlist-heart ${wishlisted ? "active" : ""}"
                    data-product-id="${id}"
                    aria-label="${wishlisted ? "Remove from wishlist" : "Add to wishlist"}"
                    aria-pressed="${wishlisted}"
                >
                    ${wishlisted ? "♥" : "♡"}
                </button>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${category}
                </span>

                <h3>${product.name || "Unnamed product"}</h3>

                <div class="product-rating">
                    ⭐ ${Number(product.rating || 0).toFixed(1)} / 5
                </div>

                <div class="product-prices">

                    <span class="product-price">
                        ${formatPrice(price)}
                    </span>

                    <span class="old-price">
                        ${formatPrice(product.price)}
                    </span>

                </div>

                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${id}"
                    ${Number(product.stock) <= 0 ? "disabled" : ""}
                >
                    ${Number(product.stock) <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                    type="button"
                    class="compare-button ${compared ? "active" : ""}"
                    data-product-id="${id}"
                    aria-pressed="${compared}"
                >
                    ${compared ? "Added" : "Compare"}
                </button>

                <button
                    type="button"
                    class="quick-view-button"
                    data-product-id="${id}"
                >
                    Quick View
                </button>

            </div>

        `;

        return card;

    }

    // ============================================
    // 13. DISPLAY PRODUCTS
    // ============================================

    function displayProducts(productList) {

        if (!productGrid) return;

        productGrid.innerHTML = "";

        if (!productList.length) {

            productGrid.innerHTML = `

                <div class="no-products-message">

                    <h3>No Products Found!</h3>

                    <p>
                        Sorry, we couldn't find what you're looking for.
                    </p>

                    <button
                        type="button"
                        id="reset-search"
                    >
                        Show All Products
                    </button>

                </div>

            `;

            return;

        }

        const fragment = document.createDocumentFragment();

        productList.forEach(product => {

            fragment.appendChild(
                createProductCard(product)
            );

        });

        productGrid.appendChild(fragment);

    }

    function renderBestSellers() {

        if (!bestSellersGrid) return;

        const ids = [1, 3, 5, 7, 11, 13];

        const list = products.filter(product =>
            ids.includes(Number(product.id))
        );

        bestSellersGrid.innerHTML = "";

        list.forEach(product => {

            bestSellersGrid.appendChild(
                createProductCard(product)
            );

        });

    }

    function renderNewArrivals() {

        if (!newArrivalsGrid) return;

        const ids = [2, 4, 6, 8, 10, 12];

        const list = products.filter(product =>
            ids.includes(Number(product.id))
        );

        newArrivalsGrid.innerHTML = "";

        list.forEach(product => {

            newArrivalsGrid.appendChild(
                createProductCard(product, {
                    newArrival: true
                })
            );

        });

    }

    // ============================================
    // 14. PRODUCT PAGINATION
    // ============================================

    function renderProductPagination() {

        const pagination = document.getElementById(
            "product-pagination"
        );

        if (!pagination) return;

        pagination.innerHTML = "";

        if (totalPages <= 1) return;

        // Previous button
        const previousButton = document.createElement("button");

        previousButton.type = "button";
        previousButton.textContent = "Previous";
        previousButton.disabled = currentPage <= 1;

        previousButton.addEventListener("click", () => {

            if (currentPage > 1) {
                displayFilteredProducts(currentPage - 1);
            }

        });

        pagination.appendChild(previousButton);

        // Page numbers
        for (let page = 1; page <= totalPages; page++) {

            const pageButton = document.createElement("button");

            pageButton.type = "button";
            pageButton.textContent = page;

            if (page === currentPage) {

                pageButton.classList.add("active");

                pageButton.setAttribute(
                    "aria-current",
                    "page"
                );

            }

            pageButton.addEventListener("click", () => {
                displayFilteredProducts(page);
            });

            pagination.appendChild(pageButton);

        }

        // Next button
        const nextButton = document.createElement("button");

        nextButton.type = "button";
        nextButton.textContent = "Next";
        nextButton.disabled = currentPage >= totalPages;

        nextButton.addEventListener("click", () => {

            if (currentPage < totalPages) {
                displayFilteredProducts(currentPage + 1);
            }

        });

        pagination.appendChild(nextButton);

    }

// ============================================
// 15. SEARCH, FILTER AND SORT PRODUCTS LOCALLY
// ============================================

function displayFilteredProducts(page = 1) {

    const query = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const category = searchCategory
        ? searchCategory.value
        : "all";

    const minPrice = minPriceInput && minPriceInput.value.trim() !== ""
        ? Number(minPriceInput.value)
        : null;

    const maxPrice = maxPriceInput && maxPriceInput.value.trim() !== ""
        ? Number(maxPriceInput.value)
        : null;

    // Start with all locally available products.
    let filteredProducts = [...products];

    // Search by product name.
    if (query) {
        filteredProducts = filteredProducts.filter(product =>
            String(product.name || "").toLowerCase().includes(query)
        );
    }

    // Filter by category.
    if (category && category !== "all") {
        filteredProducts = filteredProducts.filter(product =>
            product.category === category
        );
    }

    // Filter by minimum price.
    if (minPrice !== null) {
        filteredProducts = filteredProducts.filter(product =>
            Number(product.price) >= minPrice
        );
    }

    // Filter by maximum price.
    if (maxPrice !== null) {
        filteredProducts = filteredProducts.filter(product =>
            Number(product.price) <= maxPrice
        );
    }

    // Sort products.
    if (sortSelect) {
        switch (sortSelect.value) {

            case "popular":
                filteredProducts.sort((a, b) =>
                    Number(b.soldCount || 0) - Number(a.soldCount || 0)
                );
                break;

            case "newest":
                filteredProducts.sort((a, b) =>
                    Number(b.id) - Number(a.id)
                );
                break;

            case "price-low":
                filteredProducts.sort((a, b) =>
                    Number(a.price) - Number(b.price)
                );
                break;

            case "price-high":
                filteredProducts.sort((a, b) =>
                    Number(b.price) - Number(a.price)
                );
                break;

            case "rating":
                filteredProducts.sort((a, b) =>
                    Number(b.rating) - Number(a.rating)
                );
                break;
        }
    }

    // Calculate pagination.
    totalProducts = filteredProducts.length;

    totalPages = Math.max(
        1,
        Math.ceil(totalProducts / productsPerPage)
    );

    currentPage = Math.min(
        Math.max(1, page),
        totalPages
    );

    const startIndex = (currentPage - 1) * productsPerPage;

    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + productsPerPage
    );

    // Update product count.
    const productCount = document.getElementById("product-count");

    if (productCount) {

        const start = totalProducts === 0
            ? 0
            : startIndex + 1;

        const end = Math.min(
            startIndex + productsPerPage,
            totalProducts
        );

        productCount.textContent =
            `Showing ${start}–${end} of ${totalProducts} products`;
    }

    // Display products and pagination.
    displayProducts(paginatedProducts);

    renderProductPagination();

    console.log("Local products displayed:", {
        search: query,
        category,
        totalProducts,
        currentPage,
        totalPages,
        displayedProducts: paginatedProducts.length
    });
}

    // ============================================
    // 16. ADD PRODUCT TO CART
    // ============================================

    function addProductToCart(productId) {

        const product = getProductById(productId);

        if (!product) {

            console.error(
                "Product not found:",
                productId
            );

            return;

        }

        const cart = getCart();

        const existing = cart.find(item =>
            Number(item.id) === Number(productId)
        );

        const currentQuantity = existing
            ? Number(existing.quantity) || 0
            : 0;

        const stock = Number(product.stock);

        if (
            Number.isFinite(stock) &&
            currentQuantity >= stock
        ) {

            alert(
                `Sorry, only ${stock} item(s) are in stock.`
            );

            return;

        }

        if (existing) {

            existing.quantity = currentQuantity + 1;

        } else {

            cart.push({
                ...product,
                quantity: 1
            });

        }

        saveCart(cart);

        updateCartCount();

        alert(
            `${product.name} added to your cart!`
        );

    }

    // ============================================
    // 17. WISHLIST
    // ============================================

    function toggleWishlist(productId, button) {

        let list = getWishlist();

        const id = Number(productId);

        const exists = list.includes(id);

        if (exists) {

            list = list.filter(itemId =>
                itemId !== id
            );

        } else {

            list.push(id);

        }

        saveWishlist(list);

        if (button) {

            const active = list.includes(id);

            button.classList.toggle(
                "active",
                active
            );

            button.textContent = active ? "♥" : "♡";

            button.setAttribute(
                "aria-pressed",
                String(active)
            );

            button.setAttribute(
                "aria-label",
                active
                    ? "Remove from wishlist"
                    : "Add to wishlist"
            );

        }

        updateWishlistCount();

    }

    // ============================================
    // 18. PRODUCT COMPARISON
    // ============================================

    function toggleCompare(productId, button) {

        const id = Number(productId);

        let list = getCompareList();

        const exists = list.includes(id);

        if (exists) {

            list = list.filter(itemId =>
                itemId !== id
            );

        } else {

            if (list.length >= 4) {

                alert(
                    "You can compare a maximum of 4 products."
                );

                return;

            }

            list.push(id);

        }

        saveCompareList(list);

        const active = list.includes(id);

        if (button) {

            button.textContent = active
                ? "Added"
                : "Compare";

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );

        }

        updateCompareButtons();

    }

    function updateCompareButtons() {

        const selected = getCompareList();

        document.querySelectorAll(".compare-button").forEach(button => {

            const active = selected.includes(
                Number(button.dataset.productId)
            );

            button.textContent = active
                ? "Added"
                : "Compare";

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );

        });

    }

    // ============================================
    // 19. PRODUCT CARD CLICK EVENTS
    // ============================================

    function handleProductClick(event) {

        const target = event.target;

        // Reset search
        const resetButton = target.closest("#reset-search");

        if (resetButton) {

            if (searchInput) {
                searchInput.value = "";
            }

            if (searchCategory) {
                searchCategory.value = "all";
            }

            if (sortSelect) {
                sortSelect.value = "featured";
            }

            if (minPriceInput) {
                minPriceInput.value = "";
            }

            if (maxPriceInput) {
                maxPriceInput.value = "";
            }

            displayFilteredProducts(1);

            return;

        }

        // Wishlist
        const wishlistButton = target.closest(".wishlist-heart");

        if (wishlistButton) {

            event.preventDefault();
            event.stopPropagation();

            toggleWishlist(
                wishlistButton.dataset.productId,
                wishlistButton
            );

            return;

        }

        // Compare
        const compareButton = target.closest(".compare-button");

        if (compareButton) {

            event.preventDefault();
            event.stopPropagation();

            toggleCompare(
                compareButton.dataset.productId,
                compareButton
            );

            return;

        }

        // Add to cart
        const cartButton = target.closest(".add-to-cart-button");

        if (cartButton) {

            event.preventDefault();
            event.stopPropagation();

            addProductToCart(
                cartButton.dataset.productId
            );

            return;

        }

        // Quick view
        const quickViewButton = target.closest(
            ".quick-view-button"
        );

        if (quickViewButton) {

            event.preventDefault();
            event.stopPropagation();

            openQuickView(
                quickViewButton.dataset.productId
            );

            return;

        }

        // Open product details
        const card = target.closest(".product-card");

        if (card && card.dataset.productId) {

            window.location.href =
                `./product-detail.html?id=${encodeURIComponent(card.dataset.productId)}`;

        }

    }

    // Attach product events to all grids
    [
        productGrid,
        bestSellersGrid,
        newArrivalsGrid

    ]
        .filter(Boolean)
        .forEach(grid => {

            grid.addEventListener(
                "click",
                handleProductClick
            );

        });

    // ============================================
    // 20. SEARCH EVENTS
    // ============================================

    if (searchForm) {

        searchForm.addEventListener("submit", event => {

            event.preventDefault();

            displayFilteredProducts(1);

            const section = document.getElementById(
                "products-section"
            );

            if (section) {

                section.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    }

    if (searchCategory) {

        searchCategory.addEventListener("change", () => {

            displayFilteredProducts(1);

        });

    }

    if (sortSelect) {

        sortSelect.addEventListener("change", () => {

            displayFilteredProducts(1);

        });

    }

    // ============================================
    // 21. CATEGORY SIDEBAR LINKS
    // ============================================

    if (categoryList) {

        categoryList.addEventListener("click", event => {

            const link = event.target.closest("a");

            if (!link) return;

            const href = link.getAttribute("href") || "";
            const queryString = href.split("?")[1] || "";
            const params = new URLSearchParams(queryString);

            let category = params.get("category");

            if (!category || !productGrid) return;

            // Normalize category names.
            if (category === "mens-fashion") {
                category = "men-fashion";
            }

            const exists = products.some(product => {

                let productCategory = product.category;

                if (productCategory === "mens-fashion") {
                    productCategory = "men-fashion";
                }

                return productCategory === category;

            });

            if (!exists) return;

            event.preventDefault();

            if (searchCategory) {
                searchCategory.value =
                    category === "men-fashion"
                        ? "mens-fashion"
                        : category;
            }

            if (searchInput) {
                searchInput.value = "";
            }

            displayFilteredProducts(1);
const section = document.getElementById("products-section");

if (section) {
    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

            }

        });

    }

    // ============================================
    // 22. PRICE FILTER BUTTONS
    // ============================================

    if (applyPriceButton) {

        applyPriceButton.addEventListener("click", () => {

            const min = minPriceInput
                ? minPriceInput.value.trim()
                : "";

            const max = maxPriceInput
                ? maxPriceInput.value.trim()
                : "";

            if (
                (min !== "" &&
                    (!Number.isFinite(Number(min)) || Number(min) < 0)) ||

                (max !== "" &&
                    (!Number.isFinite(Number(max)) || Number(max) < 0))
            ) {

                alert(
                    "Please enter valid non-negative prices."
                );

                return;

            }

            if (
                min !== "" &&
                max !== "" &&
                Number(min) > Number(max)
            ) {

                alert(
                    "Minimum price cannot be greater than maximum price."
                );

                return;

            }

            displayFilteredProducts(1);

        });

    }

    if (resetPriceButton) {

        resetPriceButton.addEventListener("click", () => {

            if (minPriceInput) {
                minPriceInput.value = "";
            }

            if (maxPriceInput) {
                maxPriceInput.value = "";
            }

            displayFilteredProducts(1);

        });

    }

    // ============================================
    // 23. NEWSLETTER
    // ============================================

    const newsletterForm = document.getElementById(
        "newsletter-form"
    );

    const newsletterEmail = document.getElementById(
        "newsletter-email"
    );

    const newsletterMessage = document.getElementById(
        "newsletter-message"
    );

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();

            const email = newsletterEmail
                ? newsletterEmail.value.trim().toLowerCase()
                : "";

            if (
                !email ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {

                if (newsletterMessage) {

                    newsletterMessage.textContent =
                        "Please enter a valid email address.";

                }

                return;

            }

            const subscribers = getStoredArray(
                "yourshop-subscribers"
            );

            if (subscribers.includes(email)) {

                if (newsletterMessage) {

                    newsletterMessage.textContent =
                        "This email is already subscribed.";

                }

                return;

            }

            subscribers.push(email);

            saveStoredArray(
                "yourshop-subscribers",
                subscribers
            );

            if (newsletterMessage) {

                newsletterMessage.textContent =
                    "Thank you for subscribing!";

            }

            newsletterForm.reset();

        });

    }

    // ============================================
    // 24. BACK TO TOP BUTTON
    // ============================================

    let backToTopButton = document.querySelector(
        ".back-to-top"
    );

    if (!backToTopButton) {

        backToTopButton = document.createElement("button");

        backToTopButton.type = "button";
        backToTopButton.className = "back-to-top";
        backToTopButton.textContent = "↑";

        backToTopButton.setAttribute(
            "aria-label",
            "Back to top"
        );

        document.body.appendChild(backToTopButton);

    }

    function updateBackToTopVisibility() {

        backToTopButton.classList.toggle(
            "show",
            window.scrollY > 300
        );

    }

    window.addEventListener(
        "scroll",
        updateBackToTopVisibility
    );

    updateBackToTopVisibility();

    backToTopButton.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    // ============================================
    // 25. INITIALIZE HOMEPAGE
    // ============================================

    renderBestSellers();

    renderNewArrivals();

    updateCartCount();

    updateWishlistCount();

    updateCompareButtons();

// Load first page from local products
displayFilteredProducts(1);

    console.log(
        "YourShop main.js loaded successfully."
    );

});
