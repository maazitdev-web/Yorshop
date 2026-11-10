
// ============================================
// YOURSHOP - MAIN JAVASCRIPT
// ============================================
// Features:
// Navigation, hero slider, products, admin products,
// cart, wishlist, compare, quick view, search,
// filters, sorting, newsletter and back to top.

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // --------------------------------------------
    // 1. SELECT HTML ELEMENTS
    // --------------------------------------------

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


    // --------------------------------------------
    // 2. CHECK PRODUCTS.JS
    // --------------------------------------------

    if (typeof products === "undefined" || !Array.isArray(products)) {
        console.error("YourShop: products.js must load before main.js.");
        return;
    }


    // --------------------------------------------
    // 3. LOAD PRODUCTS FROM ADMIN PANEL
    // --------------------------------------------

    try {

        const adminProducts = JSON.parse(
            localStorage.getItem("yourshop-admin-products") || "[]"
        );

        if (Array.isArray(adminProducts)) {

            adminProducts.forEach(adminProduct => {

                if (
                    !adminProduct ||
                    adminProduct.id === undefined ||
                    adminProduct.id === null
                ) {
                    return;
                }

                const existingIndex = products.findIndex(product =>
                    Number(product.id) === Number(adminProduct.id)
                );

                if (existingIndex !== -1) {

                    // Update an existing product
                    products[existingIndex] = {
                        ...products[existingIndex],
                        ...adminProduct
                    };

                } else {

                    // Add a new Admin product
                    products.push(adminProduct);

                }

            });

        }

        console.log("YourShop products loaded:", products.length);

    } catch (error) {

        console.error("Could not load Admin products:", error);

    }


    // --------------------------------------------
    // 4. LOCAL STORAGE HELPERS
    // --------------------------------------------

    function getStoredArray(key) {

        try {

            const value = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(value) ? value : [];

        } catch (error) {

            console.warn(`Could not read ${key}:`, error);

            return [];

        }

    }


    function saveStoredArray(key, value) {

        try {

            localStorage.setItem(key, JSON.stringify(value));

        } catch (error) {

            console.error(`Could not save ${key}:`, error);

            alert("Your browser could not save this change.");

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


    // --------------------------------------------
    // 5. MOBILE NAVIGATION
    // --------------------------------------------

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("active");

            const isOpen = navLinks.classList.contains("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuToggle.textContent = isOpen ? "✕" : "☰";

        });


        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

                menuToggle.textContent = "☰";

            });

        });

    }


    // --------------------------------------------
    // 6. HERO SLIDER
    // --------------------------------------------

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


    // --------------------------------------------
    // 7. PRODUCT HELPERS
    // --------------------------------------------

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


    // --------------------------------------------
    // 8. UPDATE HEADER COUNTERS
    // --------------------------------------------

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


    // --------------------------------------------
    // 9. QUICK VIEW MODAL
    // --------------------------------------------

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


    // OPEN QUICK VIEW

    function openQuickView(productId) {

        const product = getProductById(productId);

        if (!product) {

            console.error("Product not found:", productId);

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


    // CLOSE QUICK VIEW

    function closeQuickView() {

        quickViewModal.classList.remove("active");

        document.body.classList.remove("quick-view-open");

    }


    // QUICK VIEW EVENTS

    quickViewModal.addEventListener("click", event => {

        const addButton = event.target.closest(
            ".quick-view-add-cart"
        );

        if (addButton) {

            event.preventDefault();

            addProductToCart(addButton.dataset.productId);

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


    // --------------------------------------------
    // 10. PRODUCT CARD TEMPLATE
    // --------------------------------------------

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


    // --------------------------------------------
    // 11. RENDER PRODUCT GRIDS
    // --------------------------------------------

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


    // --------------------------------------------
    // 12. SEARCH, FILTER AND SORT PRODUCTS
    // --------------------------------------------

    function displayFilteredProducts() {

        const query = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const category = searchCategory
            ? searchCategory.value
            : "all";

        const minText = minPriceInput
            ? minPriceInput.value.trim()
            : "";

        const maxText = maxPriceInput
            ? maxPriceInput.value.trim()
            : "";

        const minPrice = minText === ""
            ? 0
            : Number(minText);

        const maxPrice = maxText === ""
            ? Infinity
            : Number(maxText);


        let list = products.filter(product => {

            const productCategory = String(
                product.category || ""
            );

            const searchableCategory = productCategory.replace(
                /-/g,
                " "
            );

            const name = String(
                product.name || ""
            ).toLowerCase();


            const matchesQuery =
                name.includes(query) ||
                searchableCategory.toLowerCase().includes(query);


            const matchesCategory =
                category === "all" ||
                productCategory === category;


            const price = getDiscountedPrice(product);


            return (
                matchesQuery &&
                matchesCategory &&
                price >= minPrice &&
                price <= maxPrice
            );

        });


        if (sortSelect) {

            switch (sortSelect.value) {

                case "popular":

                    list.sort((a, b) =>
                        Number(b.soldCount || 0) -
                        Number(a.soldCount || 0)
                    );

                    break;


                case "newest":

                    list.sort((a, b) =>
                        Number(b.id) - Number(a.id)
                    );

                    break;


                case "price-low":

                    list.sort((a, b) =>
                        getDiscountedPrice(a) -
                        getDiscountedPrice(b)
                    );

                    break;


                case "price-high":

                    list.sort((a, b) =>
                        getDiscountedPrice(b) -
                        getDiscountedPrice(a)
                    );

                    break;


                case "rating":

                    list.sort((a, b) =>
                        Number(b.rating || 0) -
                        Number(a.rating || 0)
                    );

                    break;


                case "featured":

                default:

                    break;

            }

        }


        displayProducts(list);

    }


    // --------------------------------------------
    // 13. ADD PRODUCT TO CART
    // --------------------------------------------

    function addProductToCart(productId) {

        const product = getProductById(productId);


        if (!product) {

            console.error("Product not found:", productId);

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


        // Check available stock

        if (
            Number.isFinite(stock) &&
            currentQuantity >= stock
        ) {

            alert(
                `Sorry, only ${stock} item(s) are in stock.`
            );

            return;

        }


        // Update existing cart item

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

        alert(`${product.name} added to your cart!`);

    }


    // --------------------------------------------
    // 14. WISHLIST
    // --------------------------------------------

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

            button.classList.toggle("active", active);

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


    // --------------------------------------------
    // 15. PRODUCT COMPARISON
    // --------------------------------------------

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

            button.classList.toggle("active", active);

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


            button.classList.toggle("active", active);


            button.setAttribute(
                "aria-pressed",
                String(active)
            );

        });

    }


    // --------------------------------------------
    // 16. PRODUCT CARD CLICK EVENTS
    // --------------------------------------------

    function handleProductClick(event) {

        const target = event.target;


        // Reset search

        const resetButton = target.closest("#reset-search");

        if (resetButton) {

            if (searchInput) searchInput.value = "";

            if (searchCategory) searchCategory.value = "all";

            if (sortSelect) sortSelect.value = "featured";

            if (minPriceInput) minPriceInput.value = "";

            if (maxPriceInput) maxPriceInput.value = "";


            displayFilteredProducts();

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


        // Quick View

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


    // --------------------------------------------
    // 17. SEARCH EVENTS
    // --------------------------------------------

    if (searchForm) {

        searchForm.addEventListener("submit", event => {

            event.preventDefault();

            displayFilteredProducts();


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

        searchCategory.addEventListener(
            "change",
            displayFilteredProducts
        );

    }


    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            displayFilteredProducts
        );

    }


    // --------------------------------------------
    // 18. CATEGORY SIDEBAR LINKS
    // --------------------------------------------

    if (categoryList) {

        categoryList.addEventListener("click", event => {

            const link = event.target.closest("a");

            if (!link) return;


            const href = link.getAttribute("href") || "";

            const queryString = href.split("?")[1] || "";

            const params = new URLSearchParams(queryString);

            const category = params.get("category");


            const exists = products.some(product =>
                product.category === category
            );


            if (!category || !exists || !productGrid) {
                return;
            }


            event.preventDefault();


            if (searchCategory) {
                searchCategory.value = category;
            }

            if (searchInput) {
                searchInput.value = "";
            }


            displayFilteredProducts();


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


    // --------------------------------------------
    // 19. PRICE FILTER BUTTONS
    // --------------------------------------------

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


            displayFilteredProducts();

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


            displayFilteredProducts();

        });

    }


    // --------------------------------------------
    // 20. NEWSLETTER
    // --------------------------------------------

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


    // --------------------------------------------
    // 21. BACK TO TOP BUTTON
    // --------------------------------------------

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


    // --------------------------------------------
    // 22. INITIALIZE HOMEPAGE
    // --------------------------------------------

    renderBestSellers();

    renderNewArrivals();

    displayProducts(products);

    updateCartCount();

    updateWishlistCount();

    updateCompareButtons();


    console.log("YourShop main.js loaded successfully.");

});
