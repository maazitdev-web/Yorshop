
// ============================================
// YOURSHOP - MAIN JAVASCRIPT
// FRONTEND-ONLY VERSION
// ============================================
// Features:
// Navigation, hero slider, products, local storage,
// cart, wishlist, compare, quick view, search,
// filters, sorting, pagination, newsletter,
// image fallback, and back to top.
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    

    "use strict";
    

    // ============================================
    // 1. SELECT HTML ELEMENTS
    // ============================================

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    const productGrid = document.getElementById("product-grid");
    const bestSellersGrid = document.getElementById("best-sellers-grid");
    const newArrivalsGrid = document.getElementById("new-arrivals-grid");
    const specialOffersGrid = document.getElementById("special-offers-grid");

    const sortSelect = document.getElementById("sort-products");

    const cartCount = document.getElementById("cart-count");
    const wishlistCount = document.getElementById("wishlist-count");

    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("product-search");
    const searchCategory = document.getElementById("search-category");

    const categoryList = document.querySelector(".category-list");



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

        if (menuToggle) {

            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "Close navigation menu");
            menuToggle.textContent = "✕";
        }

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
    // Keep the mobile navigation closed when the page loads.
closeMobileMenu();

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

    if (menuClose) {
        menuClose.addEventListener("click", closeMobileMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeMobileMenu);
    }

    if (navLinks) {

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", closeMobileMenu);

        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", closeMobileMenu);
    }

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

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

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


    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");

    const applyPriceButton = document.getElementById("apply-price-filter");
    const resetPriceButton = document.getElementById("reset-price-filter");


    // ============================================
    // ADMIN DASHBOARD LINK
    // Show only when admin is logged in
    // ============================================

    function updateAdminDashboardLink() {

        const adminSession = sessionStorage.getItem("yourshop-admin-session");

        const headerActions = document.querySelector(".header-actions");

        if (!headerActions) return;

        let isAdminLoggedIn = false;

        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                isAdminLoggedIn = session.role === "admin";
            } catch (error) {
                sessionStorage.removeItem("yourshop-admin-session");
            }
        }

        let dashboardLink = document.getElementById("admin-dashboard-link");

        if (isAdminLoggedIn) {

            if (!dashboardLink) {

                dashboardLink = document.createElement("a");

                dashboardLink.href = "./admin.html";
                dashboardLink.id = "admin-dashboard-link";
                dashboardLink.className = "admin-dashboard-link";

                dashboardLink.innerHTML = `
                    <span>⚙</span>
                    <span>Admin Dashboard</span>
                `;

                headerActions.appendChild(dashboardLink);
            }

        } else {

            if (dashboardLink) {
                dashboardLink.remove();
            }
        }
    }

    // Check when storefront loads
    updateAdminDashboardLink();

    // Check when returning to the storefront
    window.addEventListener("pageshow", updateAdminDashboardLink);


    // ============================================
    // 2. LOCAL PRODUCT PAGINATION SETTINGS
    // ============================================

    let currentPage = 1;
    const productsPerPage = 8;
    let totalPages = 1;
    let totalProducts = 0;

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
    // 4. LOAD CENTRAL INVENTORY STOCK
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

        console.log("YourShop inventory stock loaded.");

    } catch (error) {

        console.error(
            "Could not load inventory stock:",
            error
        );
    }

    // ============================================
    // 5. LOCAL STORAGE HELPERS
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
    // 6. IMAGE FALLBACK SYSTEM
    // ============================================

    function getProductImageSources(product) {

        const sources = [
            product.image,
            ...(Array.isArray(product.images) ? product.images : [])
        ];

        return sources.filter((url, index, array) => {

            return (
                typeof url === "string" &&
                url.trim() !== "" &&
                array.indexOf(url) === index
            );

        });
    }

    function getImagePlaceholder() {

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="500"
                height="400"
                viewBox="0 0 500 400">

                <rect
                    width="500"
                    height="400"
                    fill="#f1f5f9"
                />

                <g
                    fill="none"
                    stroke="#94a3b8"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <rect
                        x="190"
                        y="115"
                        width="120"
                        height="105"
                        rx="10"
                    />

                    <circle
                        cx="225"
                        cy="150"
                        r="12"
                    />

                    <path d="M195 205 L235 170 L265 195 L285 175 L305 200"/>

                </g>

                <text
                    x="250"
                    y="275"
                    text-anchor="middle"
                    font-family="Arial"
                    font-size="22"
                    fill="#64748b">
                    Image Unavailable
                </text>

            </svg>
        `;

        return "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(svg);
    }

    function attachImageFallback(imageElement, product) {

        if (!imageElement || !product) return;

        const imageSources = getProductImageSources(product);

        let currentImageIndex = 0;

        if (imageSources.length === 0) {

            imageElement.onerror = null;
            imageElement.src = getImagePlaceholder();

            return;
        }

        imageElement.onerror = function () {

            currentImageIndex++;

            if (currentImageIndex < imageSources.length) {

                this.src = imageSources[currentImageIndex];

            } else {

                this.onerror = null;
                this.src = getImagePlaceholder();

                console.warn(
                    `YourShop: All images failed for ${product.name}.`
                );
            }
        };

        imageElement.src = imageSources[0];
    }


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
        const stock = Number(product.stock) || 0;

        details.innerHTML = `

            <div class="quick-view-image">

                <img
                    class="quick-view-product-image"
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

        const quickViewImage = details.querySelector(
            ".quick-view-product-image"
        );

        attachImageFallback(quickViewImage, product);

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

    const stock = Number(product.stock || 0);
    const outOfStock = stock <= 0;

    const badge = options.newArrival
        ? '<span class="new-arrival-badge">NEW</span>'
        : `<span class="discount-badge">${Number(product.discount) || 0}% OFF</span>`;

    const card = document.createElement("div");

    card.className = "product-card";
    card.dataset.productId = String(id);

    card.innerHTML = `

        <div class="product-image-container">

            <img
                class="product-card-image"
                alt="${product.name || "Product"}"
                loading="lazy"
            >

            <div class="product-card-top-actions">

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

        </div>

        <div class="product-info">

            <span class="product-category">
                ${category}
            </span>

            <h3>
                <a
                    href="./product-detail.html?id=${encodeURIComponent(product.id)}"
                    class="product-title-link"
                >
                    ${product.name || "Unnamed product"}
                </a>
            </h3>

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

            <div class="product-card-actions">

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

            <button
                type="button"
                class="add-to-cart-button"
                data-product-id="${id}"
                ${outOfStock ? "disabled" : ""}
            >
                ${outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

        </div>
    `;

    const productImage = card.querySelector(
        ".product-card-image"
    );

    attachImageFallback(productImage, product);

    return card;
}
// ============================================
// GET ALL UPDATED STORE PRODUCTS
// ============================================

function getAllStoreProducts() {

    const savedProducts = getStoredArray(
        "yourshop-admin-products"
    );

    const deletedIds = getStoredArray(
        "yourshop-deleted-product-ids"
    ).map(String);

    const productMap = new Map();

    // Original products
    products.forEach(product => {
        productMap.set(String(product.id), product);
    });

    // Admin updates and new products
    savedProducts.forEach(product => {
        if (product && product.id !== undefined) {
            productMap.set(String(product.id), product);
        }
    });

    // Exclude deleted products
    return Array.from(productMap.values()).filter(product =>
        !deletedIds.includes(String(product.id))
    );
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

    const list = getAllStoreProducts().filter(product =>
        product.isBestSeller === true
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

    const list = getAllStoreProducts().filter(product =>
        product.isNewArrival === true
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

       let filteredProducts = getAllStoreProducts();

        if (query) {

            filteredProducts = filteredProducts.filter(product =>
                String(product.name || "").toLowerCase().includes(query)
            );
        }

        if (category && category !== "all") {

            filteredProducts = filteredProducts.filter(product =>
                product.category === category
            );
        }

        if (minPrice !== null) {

            filteredProducts = filteredProducts.filter(product =>
                Number(product.price) >= minPrice
            );
        }

        if (maxPrice !== null) {

            filteredProducts = filteredProducts.filter(product =>
                Number(product.price) <= maxPrice
            );
        }

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

        // Reset search.
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

        // Wishlist.
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

        // Compare.
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

        // Add to cart.
        const cartButton = target.closest(".add-to-cart-button");

        if (cartButton) {

            event.preventDefault();
            event.stopPropagation();

            addProductToCart(
                cartButton.dataset.productId
            );

            return;
        }

        // Quick view.
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

        // Open product details.
        const card = target.closest(".product-card");

        if (card && card.dataset.productId) {

            const productId = card.dataset.productId;

            window.location.href =
                `./product-detail.html?id=${encodeURIComponent(productId)}`;
        }

    } // IMPORTANT: Close handleProductClick here.

    // Attach product events to all grids.
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
    renderSpecialOffers();

function renderSpecialOffers() {

    if (!specialOffersGrid) return;

const list = getAllStoreProducts().filter(product =>
    Number(product.discount) >= 10
);

    specialOffersGrid.innerHTML = "";

    list.forEach(product => {

        specialOffersGrid.appendChild(
            createProductCard(product)
        );
    });
}


    updateCartCount();

    updateWishlistCount();

    updateCompareButtons();

    displayFilteredProducts(1);

    console.log(
        "YourShop frontend main.js loaded successfully."
    );

});
