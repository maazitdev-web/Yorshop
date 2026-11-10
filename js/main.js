
// ============================================
// YOURSHOP - MAIN JAVASCRIPT
// ============================================

// Wait until HTML has loaded
document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. MOBILE NAVIGATION MENU
    // ========================================

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("active");

            const isOpen = navLinks.classList.contains("active");

            menuToggle.setAttribute("aria-expanded", isOpen);

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuToggle.textContent = isOpen ? "✕" : "☰";

        });

    }


    // ========================================
    // 2. HERO IMAGE SLIDER
    // ========================================

    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");

    let currentSlide = 0;

    if (slides.length > 0 && dots.length === slides.length) {

        function showSlide(index) {

            slides.forEach((slide) => {
                slide.classList.remove("active");
            });

            dots.forEach((dot) => {
                dot.classList.remove("active");
            });

            slides[index].classList.add("active");
            dots[index].classList.add("active");

            currentSlide = index;

        }

        function nextSlide() {

            const nextIndex = (currentSlide + 1) % slides.length;

            showSlide(nextIndex);

        }

        let sliderInterval = setInterval(nextSlide, 3000);

        dots.forEach((dot, index) => {

            dot.addEventListener("click", () => {

                showSlide(index);

                clearInterval(sliderInterval);

                sliderInterval = setInterval(nextSlide, 3000);

            });

        });

    }


    // ========================================
    // 3. SELECT WEBSITE ELEMENTS
    // ========================================

    const productGrid = document.getElementById("product-grid");
    const sortSelect = document.getElementById("sort-products");
    const cartCount = document.getElementById("cart-count");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("product-search");
    const searchCategory = document.getElementById("search-category");
    const categoryList = document.querySelector(".category-list");


    // ========================================
    // 4. DISPLAY PRODUCTS
    // ========================================


function displayProducts(productList) {

    if (!productGrid) return;

    productGrid.innerHTML = "";

    // Show message when no products match
    if (productList.length === 0) {

        productGrid.innerHTML = `
            <div class="no-products-message">
                <h3>No Products Found!</h3>
                <p>Sorry, we couldn't find what you're looking for.</p>
                <button type="button" id="reset-search">
                    Show All Products
                </button>
            </div>
        `;

        return;
    }

    productList.forEach((product) => {

        const discountedPrice = getDiscountedPrice(product);

        const productCard = document.createElement("div");
        

        productCard.classList.add("product-card");

        productCard.dataset.productId = product.id;

        productCard.innerHTML = `

            <div class="product-image-container">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="discount-badge">
                    ${product.discount}% OFF
                </span>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category.replaceAll("-", " ")}
                </span>

                <h3>${product.name}</h3>

                <div class="product-rating">
                    ⭐ ${product.rating} / 5
                </div>

                <div class="product-prices">

                    <span class="product-price">
                        $${discountedPrice.toFixed(2)}
                    </span>

                    <span class="old-price">
                        $${product.price.toFixed(2)}
                    </span>

                </div>

                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${product.id}"
                >
                    Add to Cart
                </button>

            </div>

        `;

        productGrid.appendChild(productCard);

    });

}

function getDiscountedPrice(product) {
    return product.price * (1 - product.discount / 100);
}


    // Display all products
    displayProducts(products);
    // ========================================
// 8. BEST SELLERS SECTION
// ========================================

const bestSellersGrid = document.getElementById("best-sellers-grid");
const newArrivalsGrid = document.getElementById("new-arrivals-grid");


// Demo best seller product IDs
const bestSellerIds = [1, 3, 5, 7, 11, 13];

if (bestSellersGrid) {

    const bestSellerProducts = products.filter(product =>
        bestSellerIds.includes(product.id)
    );

    bestSellerProducts.forEach(product => {

        const discountedPrice = getDiscountedPrice(product);

        const productCard = document.createElement("div");

        productCard.classList.add("product-card");
        productCard.dataset.productId = product.id;

        productCard.innerHTML = `
            <div class="product-image-container">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="discount-badge">
                    ${product.discount}% OFF
                </span>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category.replaceAll("-", " ")}
                </span>

                <h3>${product.name}</h3>

                <div class="product-rating">
                    ⭐ ${product.rating} / 5
                </div>

                <div class="product-prices">
                    <span class="product-price">
                        $${discountedPrice.toFixed(2)}
                    </span>

                    <span class="old-price">
                        $${product.price.toFixed(2)}
                    </span>
                </div>

                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${product.id}"
                >
                    Add to Cart
                </button>

            </div>
        `;

        bestSellersGrid.appendChild(productCard);

    });

}

    function displayFilteredProducts() {

        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const category = searchCategory ? searchCategory.value : "all";

        let visibleProducts = products.filter((product) => {
            const matchesCategory =
                category === "all" || product.category === category;
            const matchesQuery =
                product.name.toLowerCase().includes(query) ||
                product.category.replaceAll("-", " ").includes(query);

            return matchesCategory && matchesQuery;
        });

        if (sortSelect) {
            switch (sortSelect.value) {
                case "price-low":
                    visibleProducts.sort(
                        (a, b) => getDiscountedPrice(a) - getDiscountedPrice(b)
                    );
                    break;
                case "price-high":
                    visibleProducts.sort(
                        (a, b) => getDiscountedPrice(b) - getDiscountedPrice(a)
                    );
                    break;
                case "rating":
                    visibleProducts.sort((a, b) => b.rating - a.rating);
                    break;
            }
        }

        displayProducts(visibleProducts);
    }


    // ========================================
    // 5. PRODUCT SORTING
    // ========================================

    if (sortSelect) {

        sortSelect.addEventListener("change", () => {
            displayFilteredProducts();

        });

    }

    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            displayFilteredProducts();
        });
    }

    if (searchCategory) {
        searchCategory.addEventListener("change", displayFilteredProducts);
    }

    if (categoryList) {
        categoryList.addEventListener("click", (event) => {
            const link = event.target.closest("a");
            if (!link) return;

            const category = link.getAttribute("href").slice(1);
            if (!products.some((product) => product.category === category)) return;

            event.preventDefault();
            if (searchCategory) searchCategory.value = category;
            if (searchInput) searchInput.value = "";
            displayFilteredProducts();
            productGrid.scrollIntoView({ behavior: "smooth" });
        });
    }


    // ========================================
    // 6. SHOPPING CART AND LOCAL STORAGE
    // ========================================

    // Load saved cart from browser
    let cart = JSON.parse(
        localStorage.getItem("yourshop-cart")
    ) || [];


    // Save cart to browser storage
    function saveCart() {

        localStorage.setItem(
            "yourshop-cart",
            JSON.stringify(cart)
        );

    }


    // Update cart counter
    function updateCartCount() {

        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        if (cartCount) {

            cartCount.textContent = totalItems;

        }

    }


    // Show saved cart quantity on page load
    updateCartCount();


    // ========================================
    // 7. ADD PRODUCTS TO CART
    // ========================================
const productContainers = [
    productGrid,
    bestSellersGrid,
    newArrivalsGrid
].filter(container => container !== null);

productContainers.forEach(container => {

    container.addEventListener("click", (event) => {

        if (event.target.closest("#reset-search")) {
            if (searchInput) searchInput.value = "";
            if (searchCategory) searchCategory.value = "all";
            if (sortSelect) sortSelect.value = "featured";
            displayFilteredProducts();
            return;
        }

        // Check if Add to Cart was clicked
        const button = event.target.closest(".add-to-cart-button");

        if (button) {

            const productId = Number(button.dataset.productId);

            const selectedProduct = products.find(
                (product) => product.id === productId
            );

            if (!selectedProduct) return;

            const existingProduct = cart.find(
                (item) => item.id === productId
            );

            const currentQuantity = existingProduct
                ? existingProduct.quantity
                : 0;

            if (currentQuantity >= selectedProduct.stock) {
                alert(`Sorry, only ${selectedProduct.stock} item(s) are in stock.`);
                return;
            }

            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push({
                    ...selectedProduct,
                    quantity: 1
                });
            }

            saveCart();
            updateCartCount();

            alert(selectedProduct.name + " added to your cart!");

            return;
        }

        // Otherwise, open the product details page
        const productCard = event.target.closest(".product-card");

        if (productCard) {

            const productId = productCard.dataset.productId;

            window.location.href =
                "./product-detail.html?id=" + productId;

        }

     });

});

// ========================================
// YOURSHOP - BACK TO TOP BUTTON
// ========================================

const backToTopButton = document.createElement("button");

backToTopButton.className = "back-to-top";
backToTopButton.innerHTML = "↑";
backToTopButton.setAttribute("aria-label", "Back to top");
backToTopButton.type = "button";

document.body.appendChild(backToTopButton);

// Show button when scrolling down
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
});

// Scroll smoothly to the top
backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// ========================================
// 9. NEW ARRIVALS SECTION
// ========================================


// Demo new arrival product IDs
const newArrivalIds = [2, 4, 6, 8, 10, 12];

if (newArrivalsGrid) {

    const newArrivalProducts = products.filter(product =>
        newArrivalIds.includes(product.id)
    );

    newArrivalProducts.forEach(product => {

        const discountedPrice = getDiscountedPrice(product);

        const productCard = document.createElement("div");

        productCard.classList.add("product-card");
        productCard.dataset.productId = product.id;

        productCard.innerHTML = `
            <div class="product-image-container">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="new-arrival-badge">
                    NEW
                </span>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category.replaceAll("-", " ")}
                </span>

                <h3>${product.name}</h3>

                <div class="product-rating">
                    ⭐ ${product.rating} / 5
                </div>

                <div class="product-prices">

                    <span class="product-price">
                        $${discountedPrice.toFixed(2)}
                    </span>

                    <span class="old-price">
                        $${product.price.toFixed(2)}
                    </span>

                </div>

                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${product.id}"
                >
                    Add to Cart
                </button>

            </div>
        `;

        newArrivalsGrid.appendChild(productCard);

    });

}

// ========================================
// NEWSLETTER SUBSCRIPTION
// ========================================

const newsletterForm = document.getElementById("newsletter-form");
const newsletterEmail = document.getElementById("newsletter-email");
const newsletterMessage = document.getElementById("newsletter-message");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = newsletterEmail.value.trim().toLowerCase();

        let subscribers = JSON.parse(
            localStorage.getItem("yourshop-subscribers")
        ) || [];

        if (subscribers.includes(email)) {
            newsletterMessage.textContent =
                "This email is already subscribed.";
            return;
        }

        subscribers.push(email);

        localStorage.setItem(
            "yourshop-subscribers",
            JSON.stringify(subscribers)
        );

        newsletterMessage.textContent =
            "Thank you for subscribing!";

        newsletterForm.reset();
    });
}


});


// ============================================
// END OF YOURSHOP MAIN JAVASCRIPT
// ============================================
