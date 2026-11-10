
// ============================================
// YOURSHOP - PRODUCT DETAILS JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. GET HTML ELEMENTS
    // ========================================

    const productImage = document.getElementById("detail-product-image");
    const productName = document.getElementById("detail-product-name");
    const productCategory = document.getElementById("detail-category");
    const productRating = document.getElementById("detail-rating");
    const productPrice = document.getElementById("detail-price");
    const oldPrice = document.getElementById("detail-old-price");
    const discountBadge = document.getElementById("detail-discount");

    const quantityInput = document.getElementById("detail-quantity");
    const minusButton = document.getElementById("quantity-minus");
    const plusButton = document.getElementById("quantity-plus");

    const addToCartButton = document.getElementById("detail-add-to-cart");
    const buyNowButton = document.getElementById("detail-buy-now");


    // ========================================
    // 2. GET PRODUCT ID FROM URL
    // ========================================

    const urlParameters = new URLSearchParams(window.location.search);
    const productId = Number(urlParameters.get("id"));


    // ========================================
    // 3. FIND SELECTED PRODUCT
    // ========================================

    const selectedProduct = products.find(
        product => Number(product.id) === productId
    );

    if (!selectedProduct) {

        const detailsContainer = document.querySelector(
            ".product-details-container"
        );

        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="no-products-message">
                    <h3>Product Not Found!</h3>
                    <p>This product may not exist.</p>
                    <a href="./index.html">Return to Shopping</a>
                </div>
            `;
        }

        return;
    }


    // ========================================
    // 3.5 SAVE RECENTLY VIEWED PRODUCT
    // ========================================

    const RECENTLY_VIEWED_KEY = "yourshop-recently-viewed";

    let recentlyViewed = [];

    try {

        recentlyViewed = JSON.parse(
            localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]"
        );

        if (!Array.isArray(recentlyViewed)) {
            recentlyViewed = [];
        }

    } catch (error) {

        console.error("Could not load recently viewed products:", error);
        recentlyViewed = [];

    }

    // Remove duplicate product ID
    recentlyViewed = recentlyViewed.filter(
        id => Number(id) !== Number(selectedProduct.id)
    );

    // Add the current product at the beginning
    recentlyViewed.unshift(Number(selectedProduct.id));

    // Keep only the latest 8 products
    recentlyViewed = recentlyViewed.slice(0, 8);

    try {

        localStorage.setItem(
            RECENTLY_VIEWED_KEY,
            JSON.stringify(recentlyViewed)
        );

        console.log("Recently viewed:", recentlyViewed);

    } catch (error) {

        console.error("Could not save recently viewed products:", error);

    }


    // ========================================
    // 4. CALCULATE PRODUCT PRICE
    // ========================================

    const originalPrice = Number(selectedProduct.price);
    const discount = Number(selectedProduct.discount || 0);

    const discountedPrice =
        originalPrice - (originalPrice * discount / 100);


    // ========================================
    // 5. DISPLAY PRODUCT INFORMATION
    // ========================================

    if (productImage) {
        productImage.src = selectedProduct.image;
        productImage.alt = selectedProduct.name;
    }

    if (productName) {
        productName.textContent = selectedProduct.name;
    }

    if (productCategory) {
        productCategory.textContent =
            String(selectedProduct.category).replace(/-/g, " ");
    }

    if (productRating) {
        productRating.textContent = selectedProduct.rating;
    }

    if (productPrice) {
        productPrice.textContent =
            "$" + discountedPrice.toFixed(2);
    }

    if (oldPrice) {
        oldPrice.textContent =
            "$" + originalPrice.toFixed(2);
    }

    if (discountBadge) {
        discountBadge.textContent = discount + "% OFF";
    }


    // ========================================
    // 6. PRODUCT IMAGE GALLERY
    // ========================================

    const gallery = document.getElementById(
        "product-image-gallery"
    );

    const productImages =
        selectedProduct.images?.length
            ? selectedProduct.images
            : [selectedProduct.image];

    if (gallery && productImage) {

        gallery.innerHTML = "";

        productImages.slice(0, 4).forEach((image, index) => {

            const thumbnail = document.createElement("img");

            thumbnail.src = image;
            thumbnail.alt =
                `${selectedProduct.name} image ${index + 1}`;

            thumbnail.classList.add("product-thumbnail");

            if (index === 0) {
                thumbnail.classList.add("active");
            }

            thumbnail.addEventListener("click", () => {

                productImage.src = image;

                gallery.querySelectorAll(".product-thumbnail")
                    .forEach(item => {
                        item.classList.remove("active");
                    });

                thumbnail.classList.add("active");

            });

            gallery.appendChild(thumbnail);

        });

    }


    // ========================================
    // 7. PRODUCT STOCK STATUS
    // ========================================

    const stockStatusElement = document.getElementById(
        "detail-stock-status"
    );

    const stockQuantity = Math.max(
        0,
        Number(selectedProduct.stock ?? 12)
    );

    if (quantityInput) {

        quantityInput.min = 1;
        quantityInput.max = stockQuantity;
        quantityInput.value = stockQuantity > 0 ? 1 : 0;

        if (stockQuantity <= 0) {
            quantityInput.disabled = true;
        }

    }

    if (stockQuantity <= 0) {

        if (minusButton) minusButton.disabled = true;
        if (plusButton) plusButton.disabled = true;

        if (addToCartButton) {
            addToCartButton.disabled = true;
            addToCartButton.textContent = "Out of Stock";
        }

        if (buyNowButton) {
            buyNowButton.disabled = true;
            buyNowButton.textContent = "Unavailable";
        }

        if (stockStatusElement) {
            stockStatusElement.textContent = "Out of Stock";
            stockStatusElement.className =
                "product-stock-status out-of-stock";
        }

    } else if (stockQuantity <= 5) {

        if (stockStatusElement) {
            stockStatusElement.textContent =
                `Only ${stockQuantity} left in stock`;

            stockStatusElement.className =
                "product-stock-status low-stock";
        }

    } else {

        if (stockStatusElement) {
            stockStatusElement.textContent = "In Stock";
            stockStatusElement.className =
                "product-stock-status";
        }

    }


    // ========================================
    // 8. PRODUCT DESCRIPTION
    // ========================================

    const descriptionElement = document.getElementById(
        "detail-description"
    );

    if (descriptionElement) {

        descriptionElement.textContent =
            `${selectedProduct.name} is part of our ${
                String(selectedProduct.category).replace(/-/g, " ")
            } collection. Enjoy quality, great value, and a convenient shopping experience with YourShop.`;

    }


    // ========================================
    // 9. PRODUCT SPECIFICATIONS
    // ========================================

    const specificationsElement = document.getElementById(
        "detail-specifications"
    );

    if (specificationsElement) {

        const specifications = [
            ["Product Name", selectedProduct.name],
            [
                "Category",
                String(selectedProduct.category).replace(/-/g, " ")
            ],
            ["Original Price", "$" + originalPrice.toFixed(2)],
            ["Discount", discount + "%"],
            ["Discounted Price", "$" + discountedPrice.toFixed(2)],
            ["Customer Rating", selectedProduct.rating + " / 5"],
            ["Available Stock", stockQuantity]
        ];

        specificationsElement.innerHTML = "";

        specifications.forEach(([label, value]) => {

            const row = document.createElement("tr");

            const labelCell = document.createElement("td");
            labelCell.textContent = label;

            const valueCell = document.createElement("td");
            valueCell.textContent = value;

            row.append(labelCell, valueCell);

            specificationsElement.appendChild(row);

        });

    }


    // ============================================
    // 10. CUSTOMER REVIEWS SYSTEM
    // ============================================

    const sampleReviews = [
        {
            name: "Ahmed Khan",
            date: "November 5, 2026",
            timestamp: new Date("November 5, 2026").getTime(),
            rating: 5,
            comment: "Excellent product! The quality is amazing and delivery was smooth."
        },
        {
            name: "Ali Raza",
            date: "November 3, 2026",
            timestamp: new Date("November 3, 2026").getTime(),
            rating: 4,
            comment: "Very good product. I am happy with my purchase."
        },
        {
            name: "Sara Ahmed",
            date: "October 28, 2026",
            timestamp: new Date("October 28, 2026").getTime(),
            rating: 5,
            comment: "Great quality and excellent value for money. Highly recommended!"
        }
    ];


    // Separate reviews for each product
    const reviewStorageKey =
        "yourshop-reviews-" + selectedProduct.id;

    let customerReviews = [];

    try {

        const savedReviews = localStorage.getItem(reviewStorageKey);

        customerReviews = savedReviews
            ? JSON.parse(savedReviews)
            : [...sampleReviews];

        if (!Array.isArray(customerReviews)) {
            customerReviews = [...sampleReviews];
        }

    } catch (error) {

        console.error("Could not load reviews:", error);
        customerReviews = [...sampleReviews];

    }


    // Review HTML elements
    const reviewList = document.getElementById("review-list");

    const reviewsAverage = document.getElementById(
        "reviews-average"
    );

    const reviewsCount = document.getElementById(
        "reviews-count"
    );

    const reviewForm = document.getElementById("review-form");

    const reviewSort = document.getElementById("review-sort");

    const ratingBreakdown = document.querySelector(
        ".rating-breakdown"
    );


    // ============================================
    // 11. SAVE CUSTOMER REVIEWS
    // ============================================

    function saveCustomerReviews() {

        try {

            localStorage.setItem(
                reviewStorageKey,
                JSON.stringify(customerReviews)
            );

        } catch (error) {

            console.error("Could not save reviews:", error);

            alert("Your review could not be saved. Please try again.");

        }

    }


    // ============================================
    // CHECK VERIFIED PURCHASE
    // ============================================

    function hasVerifiedPurchase(reviewerName) {

        try {

            const orders = JSON.parse(
                localStorage.getItem("yourshop-orders") || "[]"
            );

            if (!Array.isArray(orders)) {
                return false;
            }

            return orders.some(order => {

                const customerName =
                    order.customer?.name?.trim().toLowerCase();

                const reviewName =
                    reviewerName.trim().toLowerCase();

                const orderItems = Array.isArray(order.items)
                    ? order.items
                    : [];

                const customerMatches =
                    customerName === reviewName;

                const productMatches = orderItems.some(item =>
                    Number(item.id) === Number(selectedProduct.id)
                );

                return customerMatches && productMatches;

            });

        } catch (error) {

            console.error(
                "Could not verify customer purchase:",
                error
            );

            return false;

        }

    }


    // ============================================
    // 12. DISPLAY CUSTOMER REVIEWS
    // ============================================

    function displayCustomerReviews() {

        if (!reviewList) return;

        reviewList.innerHTML = "";

        let sortedReviews = [...customerReviews];


        // Sort reviews
        if (reviewSort && reviewSort.value === "highest") {

            sortedReviews.sort(
                (a, b) => Number(b.rating) - Number(a.rating)
            );

        } else if (reviewSort && reviewSort.value === "lowest") {

            sortedReviews.sort(
                (a, b) => Number(a.rating) - Number(b.rating)
            );

        } else {

            sortedReviews.sort(
                (a, b) =>
                    Number(b.timestamp || 0) -
                    Number(a.timestamp || 0)
            );

        }


        // Empty review message
        if (sortedReviews.length === 0) {

            const message = document.createElement("p");

            message.className = "no-reviews-message";

            message.textContent =
                "No reviews yet. Be the first to review this product!";

            reviewList.appendChild(message);

        }


        // Create review cards
        sortedReviews.forEach(review => {

            const reviewCard = document.createElement("div");

            reviewCard.className = "review-card";


            const header = document.createElement("div");

            header.className = "review-card-header";


            const reviewerInfo = document.createElement("div");


            const name = document.createElement("h4");

            name.textContent = review.name;


            const customerLabel = document.createElement("small");

            if (hasVerifiedPurchase(review.name)) {

                customerLabel.className = "verified-purchase";

                customerLabel.textContent = "✓ Verified Purchase";

            } else {

                customerLabel.className = "customer-review-label";

                customerLabel.textContent = "Customer Review";

            }


            const date = document.createElement("span");

            date.textContent = review.date;


            reviewerInfo.append(name, customerLabel, date);


            const stars = document.createElement("div");

            stars.className = "review-card-stars";


            const rating = Math.max(
                0,
                Math.min(5, Number(review.rating) || 0)
            );

            stars.textContent =
                "★".repeat(rating) +
                "☆".repeat(5 - rating);


            header.append(reviewerInfo, stars);


            const comment = document.createElement("p");

            comment.textContent = review.comment;


            reviewCard.append(header, comment);

            reviewList.appendChild(reviewCard);

        });


        // Calculate average rating
        const averageRating = customerReviews.length
            ? customerReviews.reduce(
                (total, review) =>
                    total + Number(review.rating),
                0
            ) / customerReviews.length
            : 0;


        if (reviewsAverage) {
            reviewsAverage.textContent =
                averageRating.toFixed(1);
        }


        if (reviewsCount) {
            reviewsCount.textContent =
                `Based on ${customerReviews.length} reviews`;
        }


        // Update rating breakdown
        if (ratingBreakdown) {

            ratingBreakdown.innerHTML = "";

            for (let stars = 5; stars >= 1; stars--) {

                const count = customerReviews.filter(
                    review => Number(review.rating) === stars
                ).length;

                const percentage = customerReviews.length
                    ? (count / customerReviews.length) * 100
                    : 0;


                const row = document.createElement("div");

                row.className = "rating-row";


                const label = document.createElement("span");

                label.textContent = `${stars} Stars`;


                const progress = document.createElement("div");

                progress.className = "rating-progress";


                const fill = document.createElement("div");

                fill.className = "rating-progress-fill";

                fill.style.width = `${percentage}%`;


                progress.appendChild(fill);


                const countLabel = document.createElement("span");

                countLabel.textContent = count;


                row.append(label, progress, countLabel);

                ratingBreakdown.appendChild(row);

            }

        }

    }


    // Display reviews when page loads
    displayCustomerReviews();


    // ============================================
    // 13. SORT CUSTOMER REVIEWS
    // ============================================

    if (reviewSort) {

        reviewSort.addEventListener("change", () => {
            displayCustomerReviews();
        });

    }


    // ============================================
    // INTERACTIVE STAR RATING
    // ============================================

    const ratingContainer = document.getElementById(
        "interactive-rating"
    );

    const ratingInput = document.getElementById("review-rating");

    const ratingFeedback = document.getElementById(
        "rating-feedback"
    );

    if (ratingContainer && ratingInput) {

        const ratingButtons = ratingContainer.querySelectorAll("button");

        const ratingLabels = {
            1: "Poor",
            2: "Fair",
            3: "Good",
            4: "Very Good",
            5: "Excellent"
        };

        function updateRating(value) {

            ratingInput.value = value;

            ratingButtons.forEach(button => {

                const buttonRating = Number(button.dataset.rating);

                button.classList.toggle(
                    "active",
                    buttonRating <= value
                );

            });

            if (ratingFeedback) {
                ratingFeedback.textContent = ratingLabels[value];
            }

        }

        ratingButtons.forEach(button => {

            button.addEventListener("click", () => {
                updateRating(Number(button.dataset.rating));
            });

        });

        updateRating(Number(ratingInput.value) || 5);

    }


    // ============================================
    // 14. SUBMIT CUSTOMER REVIEW
    // ============================================

    if (reviewForm) {

        reviewForm.addEventListener("submit", event => {

            event.preventDefault();


            const reviewerName = document
                .getElementById("reviewer-name")
                .value.trim();

            const rating = Number(
                document.getElementById("review-rating").value
            );

            const reviewComment = document
                .getElementById("review-comment")
                .value.trim();


            // Validate form
            if (!reviewerName || !reviewComment) {

                alert("Please complete all review fields.");

                return;

            }


            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                alert("Please select a valid rating.");

                return;

            }


            // Create new review
            const now = new Date();

            const newReview = {

                name: reviewerName,

                date: now.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }),

                timestamp: now.getTime(),

                rating: rating,

                comment: reviewComment

            };


            // Add new review
            customerReviews.unshift(newReview);


            // Save reviews
            saveCustomerReviews();


            // Show newest reviews first
            if (reviewSort) {
                reviewSort.value = "newest";
            }


            // Refresh review display
            displayCustomerReviews();


            // Clear form
            reviewForm.reset();


            alert("Thank you! Your review has been submitted.");

        });

    }


    // ========================================
    // 15. DISPLAY RELATED PRODUCTS
    // ========================================

    const relatedProductsGrid = document.getElementById(
        "related-products-grid"
    );

    const relatedProducts = products.filter(product => {

        return (
            product.category === selectedProduct.category &&
            Number(product.id) !== Number(selectedProduct.id)
        );

    });


    if (relatedProductsGrid) {

        relatedProductsGrid.innerHTML = "";

        relatedProducts.slice(0, 4).forEach(product => {

            const productDiscount = Number(product.discount || 0);

            const productDiscountedPrice =
                Number(product.price) -
                (Number(product.price) * productDiscount / 100);


            const card = document.createElement("div");

            card.classList.add("product-card");

            card.dataset.productId = product.id;


            card.innerHTML = `
                <div class="product-image-container">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                    <span class="discount-badge">
                        ${productDiscount}% OFF
                    </span>

                </div>

                <div class="product-info">

                    <span class="product-category">
                        ${String(product.category).replace(/-/g, " ")}
                    </span>

                    <h3>${product.name}</h3>

                    <div class="product-rating">
                        ⭐ ${product.rating} / 5
                    </div>

                    <div class="product-prices">

                        <span class="product-price">
                            $${productDiscountedPrice.toFixed(2)}
                        </span>

                        <span class="old-price">
                            $${Number(product.price).toFixed(2)}
                        </span>

                    </div>

                </div>
            `;


            relatedProductsGrid.appendChild(card);

        });

    }


    // Open related product details
    if (relatedProductsGrid) {

        relatedProductsGrid.addEventListener("click", event => {

            const card = event.target.closest(".product-card");

            if (!card) return;

            const relatedProductId = card.dataset.productId;

            window.location.href =
                "./product-detail.html?id=" +
                encodeURIComponent(relatedProductId);

        });

    }


    // ========================================
    // 16. QUANTITY MINUS BUTTON
    // ========================================

    if (minusButton && quantityInput) {

        minusButton.addEventListener("click", () => {

            let quantity = Number(quantityInput.value);

            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }

        });

    }


    // ========================================
    // 17. QUANTITY PLUS BUTTON
    // ========================================

    if (plusButton && quantityInput) {

        plusButton.addEventListener("click", () => {

            let quantity = Number(quantityInput.value);

            if (quantity >= stockQuantity) {

                if (stockStatusElement) {

                    stockStatusElement.textContent =
                        "Maximum stock reached!";

                    stockStatusElement.className =
                        "product-stock-status low-stock";

                }

                quantityInput.value = stockQuantity;

                return;

            }


            quantityInput.value = quantity + 1;


            if (
                Number(quantityInput.value) === stockQuantity &&
                stockStatusElement
            ) {

                stockStatusElement.textContent =
                    "Maximum stock reached!";

                stockStatusElement.className =
                    "product-stock-status low-stock";

            }

        });

    }


    // ========================================
    // 18. VALIDATE MANUALLY ENTERED QUANTITY
    // ========================================

    if (quantityInput) {

        quantityInput.addEventListener("change", () => {

            let quantity = Number(quantityInput.value);

            if (!Number.isInteger(quantity) || quantity < 1) {
                quantity = 1;
            }

            if (quantity > stockQuantity) {
                quantity = stockQuantity;
            }

            quantityInput.value = quantity;

        });

    }


    // ========================================
    // 19. ADD PRODUCT TO CART
    // ========================================

    function addProductToCart() {

        if (stockQuantity <= 0 || !quantityInput) {
            return false;
        }


        const quantity = Number(quantityInput.value);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > stockQuantity
        ) {

            alert("Please enter a valid quantity.");

            return false;

        }


        let cart = [];

        try {

            cart = JSON.parse(
                localStorage.getItem("yourshop-cart")
            ) || [];

            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            console.error("Could not load cart:", error);

            cart = [];

        }


        const existingProduct = cart.find(
            item => Number(item.id) === Number(selectedProduct.id)
        );


        const currentCartQuantity = existingProduct
            ? Number(existingProduct.quantity)
            : 0;


        if (currentCartQuantity + quantity > stockQuantity) {

            const remainingStock = Math.max(
                0,
                stockQuantity - currentCartQuantity
            );

            alert(
                `Sorry! Only ${remainingStock} more item(s) available.`
            );

            return false;

        }


        if (existingProduct) {

            existingProduct.quantity =
                currentCartQuantity + quantity;

        } else {

            cart.push({
                ...selectedProduct,
                quantity: quantity
            });

        }


        localStorage.setItem(
            "yourshop-cart",
            JSON.stringify(cart)
        );


        return true;

    }


    // ========================================
    // 20. ADD TO CART BUTTON
    // ========================================

    if (addToCartButton) {

        addToCartButton.addEventListener("click", () => {

            const added = addProductToCart();

            if (added) {

                alert(
                    selectedProduct.name +
                    " added to your cart!"
                );

            }

        });

    }


    // ========================================
    // 21. BUY NOW BUTTON
    // ========================================

    if (buyNowButton) {

        buyNowButton.addEventListener("click", () => {

            const added = addProductToCart();

            if (added) {
                window.location.href = "./checkout.html";
            }

        });

    }

});
