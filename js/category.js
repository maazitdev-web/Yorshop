
// ============================================
// YOURSHOP - CATEGORY PAGE JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // 1. CATEGORY NAMES
    // ========================================

    const categoryNames = {
        smartphones: "Smartphones",
        headphones: "Headphones",
        laptops: "Laptops",
        "smart-watches": "Smart Watches",
        accessories: "Accessories",
        gaming: "Gaming",
        cameras: "Cameras",
        "home-appliances": "Home Appliances",
        "mens-fashion": "Men's Fashion",
        "womens-fashion": "Women's Fashion"
    };

    // ========================================
    // 2. NORMALIZE CATEGORY
    // ========================================

    function normalizeCategory(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    }

    function getCart() {
        try {
            const storedCart = localStorage.getItem("yourshop-cart");
            const parsedCart = storedCart ? JSON.parse(storedCart) : [];

            return Array.isArray(parsedCart) ? parsedCart : [];
        } catch (error) {
            console.warn("YourShop: Invalid cart data detected. Resetting cart.", error);
            localStorage.setItem("yourshop-cart", JSON.stringify([]));
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem("yourshop-cart", JSON.stringify(cart));
    }

    // ========================================
    // 3. GET CATEGORY FROM URL
    // ========================================

    const params = new URLSearchParams(window.location.search);

    const rawCategory = (
        params.get("category") || "smartphones"
    ).trim().toLowerCase();

    const categorySlug = Object.keys(categoryNames).find(function (key) {
        return normalizeCategory(key) === normalizeCategory(rawCategory);
    }) || "";

    console.log("Raw category:", rawCategory);
    console.log("Matched category:", categorySlug);

    // ========================================
    // 4. GET HTML ELEMENTS
    // ========================================

    const title = document.getElementById("category-title");
    const description = document.getElementById("category-description");
    const breadcrumb = document.getElementById("category-breadcrumb-name");
    const productGrid = document.getElementById("category-product-grid");
    const productCount = document.getElementById("category-product-count");
    const emptyMessage = document.getElementById("category-empty-message");
    const sortSelect = document.getElementById("category-sort");
    const cartCount = document.getElementById("cart-count");

    // ========================================
    // 5. CHECK REQUIRED ELEMENTS
    // ========================================

    if (!productGrid || !title || !productCount || !emptyMessage) {
        console.error("YourShop: Category HTML elements are missing.");
        return;
    }

    // ========================================
    // 6. FIND CATEGORY NAME
    // ========================================

    const categoryName = categoryNames[categorySlug];

    if (!categoryName) {

        title.textContent = "Category Not Found";

        if (description) {
            description.textContent = "Please select a valid category.";
        }

        if (breadcrumb) {
            breadcrumb.textContent = "Not Found";
        }

        productCount.textContent = "0 products";
        productGrid.innerHTML = "";
        emptyMessage.hidden = false;

        return;
    }

    title.textContent = categoryName;

    if (description) {
        description.textContent =
            "Explore our " + categoryName + " collection.";
    }

    if (breadcrumb) {
        breadcrumb.textContent = categoryName;
    }

    // ========================================
    // 7. CHECK PRODUCTS DATABASE
    // ========================================

    if (typeof products === "undefined") {

        console.error("YourShop: products.js is not loaded.");

        productCount.textContent = "Products could not be loaded.";

        return;
    }

    console.log("Products loaded:", products.length);

    // ========================================
    // 8. FILTER CATEGORY PRODUCTS
    // ========================================

    const categoryProducts = products.filter(function (product) {

        return normalizeCategory(product.category) ===
            normalizeCategory(categorySlug);

    });

    console.log("Matching products:", categoryProducts.length);

    // ========================================
    // 9. CALCULATE DISCOUNTED PRICE
    // ========================================

    function getDiscountedPrice(product) {

        const price = Number(product.price) || 0;
        const discount = Number(product.discount) || 0;

        return price - (price * discount / 100);
    }

    // ========================================
    // 10. DISPLAY PRODUCTS
    // ========================================

    function displayCategoryProducts(productList) {

        productGrid.innerHTML = "";

        productCount.textContent =
            productList.length + " products found";

        emptyMessage.hidden = productList.length > 0;

        productList.forEach(function (product) {

            const card = document.createElement("div");

            card.className = "product-card";
            card.dataset.productId = product.id;

            const discountedPrice = getDiscountedPrice(product);
            const originalPrice = Number(product.price) || 0;
            const discount = Number(product.discount) || 0;
            const stock = Number(product.stock) || 0;

            // PRODUCT IMAGE

            const imageContainer = document.createElement("div");
            imageContainer.className = "product-image";

            const image = document.createElement("img");

            image.src = product.image || "";
            image.alt = product.name || "Product";
            image.loading = "lazy";

            imageContainer.appendChild(image);

            // DISCOUNT BADGE

            if (discount > 0) {

                const badge = document.createElement("span");

                badge.className = "discount-badge";
                badge.textContent = discount + "% OFF";

                imageContainer.appendChild(badge);
            }

            // PRODUCT INFORMATION

            const info = document.createElement("div");
            info.className = "product-info";

            const name = document.createElement("h3");
            name.textContent = product.name || "Unnamed Product";

            const rating = document.createElement("p");
            rating.className = "product-rating";
            rating.textContent = "⭐ " + (product.rating || 0);

            // PRODUCT PRICE

            const priceContainer = document.createElement("div");
            priceContainer.className = "product-price";

            const currentPrice = document.createElement("span");

            currentPrice.className = "current-price";
            currentPrice.textContent = "$" + discountedPrice.toFixed(2);

            priceContainer.appendChild(currentPrice);

            if (discount > 0) {

                const oldPrice = document.createElement("span");

                oldPrice.className = "old-price";
                oldPrice.textContent = "$" + originalPrice.toFixed(2);

                priceContainer.appendChild(oldPrice);
            }

            // ADD TO CART BUTTON

            const button = document.createElement("button");

            button.className = "add-to-cart-button";
            button.dataset.productId = product.id;

            button.textContent =
                stock > 0 ? "Add to Cart" : "Out of Stock";

            button.disabled = stock <= 0;

            // ADD ELEMENTS TO CARD

            info.appendChild(name);
            info.appendChild(rating);
            info.appendChild(priceContainer);
            info.appendChild(button);

            card.appendChild(imageContainer);
            card.appendChild(info);

            productGrid.appendChild(card);
        });
    }

    // ========================================
    // 11. SORT PRODUCTS
    // ========================================

    function sortProducts() {

        const sortedProducts = [...categoryProducts];

        if (sortSelect) {

            if (sortSelect.value === "price-low") {

                sortedProducts.sort(function (a, b) {
                    return getDiscountedPrice(a) - getDiscountedPrice(b);
                });

            } else if (sortSelect.value === "price-high") {

                sortedProducts.sort(function (a, b) {
                    return getDiscountedPrice(b) - getDiscountedPrice(a);
                });

            } else if (sortSelect.value === "rating") {

                sortedProducts.sort(function (a, b) {
                    return Number(b.rating) - Number(a.rating);
                });
            }
        }

        displayCategoryProducts(sortedProducts);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", sortProducts);
    }

    // ========================================
    // 12. UPDATE CART COUNT
    // ========================================

    function updateCartCount() {

        if (!cartCount) return;

        const cart = getCart();

        const total = cart.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);

        cartCount.textContent = total;
    }

    // ========================================
    // 13. HANDLE PRODUCT CLICKS
    // ========================================

    productGrid.addEventListener("click", function (event) {

        // ADD TO CART

        const button = event.target.closest(".add-to-cart-button");

        if (button) {

            const productId = Number(button.dataset.productId);

            const selectedProduct = products.find(function (product) {
                return Number(product.id) === productId;
            });

            if (!selectedProduct) return;

            const cart = getCart();

            const existingProduct = cart.find(function (item) {
                return Number(item.id) === productId;
            });

            const currentQuantity = existingProduct
                ? Number(existingProduct.quantity) || 0
                : 0;

            if (currentQuantity >= Number(selectedProduct.stock)) {

                alert("Sorry! Maximum available stock reached.");

                return;
            }

            if (existingProduct) {

                existingProduct.quantity = currentQuantity + 1;

            } else {

                cart.push({
                    ...selectedProduct,
                    quantity: 1
                });
            }

            saveCart(cart);

            updateCartCount();

            alert(selectedProduct.name + " added to cart!");

            return;
        }

        // OPEN PRODUCT DETAILS

        const card = event.target.closest(".product-card");

        if (card) {

            const productId = card.dataset.productId;

            window.location.href =
                "./product-detail.html?id=" + productId;
        }
    });

    // ========================================
    // 14. INITIALIZE CATEGORY PAGE
    // ========================================

    updateCartCount();

    displayCategoryProducts(categoryProducts);

    console.log(
        "YourShop category loaded:",
        categoryName,
        categoryProducts.length,
        "products"
    );

});
