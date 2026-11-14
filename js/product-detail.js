
// ============================================
// YOURSHOP - PRODUCT DETAILS JAVASCRIPT
// FRONTEND-ONLY VERSION
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

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

    const stockStatusElement = document.getElementById("detail-stock-status");

    const gallery = document.getElementById("product-image-gallery");

    const relatedProductsGrid =
        document.getElementById("related-products-grid");


    // ========================================
    // 2. GET PRODUCT FROM FRONTEND PRODUCTS
    // ========================================

    const urlParameters = new URLSearchParams(window.location.search);
    const productId = Number(urlParameters.get("id"));

    // Make sure products.js has loaded first.
    if (!Array.isArray(products)) {
        console.error("Products array not found. Check script loading order.");
        return;
    }

    // Find the product using its ID.
    const selectedProduct = products.find(
        product => Number(product.id) === productId
    );

    console.log("Product ID:", productId);
    console.log("Selected product:", selectedProduct);

    // Check whether the product exists.
    if (!selectedProduct) {
        document.body.innerHTML = `
            <h2>Product Not Found</h2>
            <p>Please return to the shop and select another product.</p>
            <a href="./index.html">Back to Shop</a>
        `;
        return;
    }

    // ========================================
    // 3. LOAD SAVED INVENTORY STOCK
    // ========================================

    try {

        const savedStock = JSON.parse(
            localStorage.getItem("yourshop-inventory-stock") || "{}"
        );

        if (
            savedStock &&
            typeof savedStock === "object" &&
            !Array.isArray(savedStock)
        ) {

            const savedQuantity = Number(
                savedStock[String(selectedProduct.id)]
            );

            if (
                Object.prototype.hasOwnProperty.call(
                    savedStock,
                    String(selectedProduct.id)
                ) &&
                Number.isSafeInteger(savedQuantity) &&
                savedQuantity >= 0
            ) {

                selectedProduct.stock = savedQuantity;
            }
        }

    } catch (error) {

        console.error("Could not load saved inventory:", error);
    }

    // ========================================
    // 4. HELPER FUNCTIONS
    // ========================================

    function formatPrice(amount) {

        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$" + (Number(amount) || 0).toFixed(2);
    }

    function getArrayFromStorage(key) {

        try {

            const data = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {

            console.error("Storage error:", key, error);

            return [];
        }
    }

    function saveArrayToStorage(key, data) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error("Could not save:", key, error);

            return false;
        }
    }

    function getProductImages(product) {

        const images = [
            product.image,
            ...(Array.isArray(product.images) ? product.images : [])
        ];

        return [
            ...new Set(
                images
                    .filter(image =>
                        typeof image === "string" &&
                        image.trim() !== ""
                    )
                    .map(image => image.trim())
            )
        ];
    }

    function getImagePlaceholder() {

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="500"
                height="400"
                viewBox="0 0 500 400">

                <rect width="500" height="400" fill="#f1f5f9"/>

                <g fill="none"
                    stroke="#94a3b8"
                    stroke-width="5">

                    <rect x="190" y="115"
                        width="120" height="105"
                        rx="10"/>

                    <circle cx="225" cy="150" r="12"/>

                    <path d="M195 205 L235 170 L265 195 L285 175 L305 200"/>

                </g>

                <text x="250" y="275"
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

    function attachImageFallback(imageElement, imageSources) {

        if (!imageElement) return;

        let currentIndex = 0;

        const validImages = Array.isArray(imageSources)
            ? imageSources.filter(image =>
                typeof image === "string" && image.trim() !== ""
            )
            : [];

        if (validImages.length === 0) {

            imageElement.onerror = null;
            imageElement.src = getImagePlaceholder();

            return;
        }

        imageElement.onerror = function () {

            currentIndex++;

            if (currentIndex < validImages.length) {

                this.src = validImages[currentIndex];

            } else {

                this.onerror = null;
                this.src = getImagePlaceholder();

                console.warn("YourShop: Product image unavailable.");
            }
        };

        imageElement.src = validImages[0];
    }

    // ========================================
    // 5. RECENTLY VIEWED PRODUCTS
    // ========================================

    const recentlyViewedKey = "yourshop-recently-viewed";

    let recentlyViewed = getArrayFromStorage(recentlyViewedKey);

    recentlyViewed = recentlyViewed.filter(
        id => Number(id) !== Number(selectedProduct.id)
    );

    recentlyViewed.unshift(Number(selectedProduct.id));

    recentlyViewed = recentlyViewed.slice(0, 8);

    saveArrayToStorage(
        recentlyViewedKey,
        recentlyViewed
    );

    // ========================================
    // 6. PRODUCT PRICE
    // ========================================

    const originalPrice = Number(selectedProduct.price) || 0;

    const discount = Math.max(
        0,
        Math.min(100, Number(selectedProduct.discount) || 0)
    );

    const discountedPrice =
        originalPrice - (originalPrice * discount / 100);

    // ========================================
    // 7. PRODUCT INFORMATION
    // ========================================

    if (productImage) {
        productImage.alt = selectedProduct.name || "Product";
    }

    if (productName) {
        productName.textContent = selectedProduct.name || "Unnamed Product";
    }

    if (productCategory) {

        productCategory.textContent =
            String(selectedProduct.category || "")
                .replace(/-/g, " ");
    }

    if (productRating) {

        productRating.textContent =
            Number(selectedProduct.rating || 0).toFixed(1);
    }

    if (productPrice) {
        productPrice.textContent = formatPrice(discountedPrice);
    }

    if (oldPrice) {
        oldPrice.textContent = formatPrice(originalPrice);
    }

    if (discountBadge) {
        discountBadge.textContent = discount + "% OFF";
    }

    // ========================================
    // 8. PRODUCT IMAGE GALLERY
    // ========================================

    const productImages = getProductImages(selectedProduct);

    // Show the main product image and its fallback images.
    attachImageFallback(productImage, productImages);

    if (gallery && productImage) {

        gallery.innerHTML = "";

        productImages.slice(0, 4).forEach((image, index) => {

            const thumbnail = document.createElement("img");

            thumbnail.src = image;

            thumbnail.alt =
                `${selectedProduct.name} image ${index + 1}`;

            thumbnail.className = "product-thumbnail";
            thumbnail.loading = "lazy";

            if (index === 0) {
                thumbnail.classList.add("active");
            }

            thumbnail.onerror = function () {

                this.onerror = null;
                this.classList.add("image-error");
                this.style.display = "none";
            };

            thumbnail.addEventListener("click", () => {

                productImage.onerror = null;
                productImage.src = image;

                productImage.alt =
                    `${selectedProduct.name} image ${index + 1}`;

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
    // 9. STOCK VALIDATION
    // ========================================

    const stockQuantity = Math.max(
        0,
        Number.isFinite(Number(selectedProduct.stock))
            ? Math.floor(Number(selectedProduct.stock))
            : 0
    );

    function updateStockMessage(message, className) {

        if (!stockStatusElement) return;

        stockStatusElement.textContent = message;

        stockStatusElement.className =
            "product-stock-status " + className;
    }

    if (quantityInput) {

        quantityInput.min = stockQuantity > 0 ? 1 : 0;
        quantityInput.max = stockQuantity;

        quantityInput.value = stockQuantity > 0 ? 1 : 0;

        quantityInput.disabled = stockQuantity <= 0;
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

        updateStockMessage(
            "Out of Stock",
            "out-of-stock"
        );

    } else if (stockQuantity <= 5) {

        updateStockMessage(
            `Only ${stockQuantity} left in stock`,
            "low-stock"
        );

    } else {

        updateStockMessage(
            "In Stock",
            ""
        );
    }

    // ========================================
    // 10. PRODUCT DESCRIPTION
    // ========================================

    const descriptionElement =
        document.getElementById("detail-description");

    if (descriptionElement) {

        descriptionElement.textContent =
            `${selectedProduct.name} is part of our ${
                String(selectedProduct.category || "")
                    .replace(/-/g, " ")
            } collection. Enjoy quality, great value, and a convenient shopping experience with YourShop.`;
    }

    // ========================================
    // 11. PRODUCT SPECIFICATIONS
    // ========================================

    const specificationsElement =
        document.getElementById("detail-specifications");

    if (specificationsElement) {

        const specifications = [

            ["Product Name", selectedProduct.name],

            [
                "Category",
                String(selectedProduct.category || "")
                    .replace(/-/g, " ")
            ],

            ["Original Price", formatPrice(originalPrice)],

            ["Discount", discount + "%"],

            ["Discounted Price", formatPrice(discountedPrice)],

            [
                "Customer Rating",
                Number(selectedProduct.rating || 0) + " / 5"
            ],

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
    // 12. CUSTOMER REVIEWS
    // ============================================

    const reviewStorageKey =
        "yourshop-reviews-" + selectedProduct.id;

    const reviewOwnerKey = "yourshop-reviewer-name";

    const sampleReviews = [

        {
            id: "sample-1",
            name: "Ahmed Khan",
            date: "November 5, 2026",
            timestamp: new Date("November 5, 2026").getTime(),
            rating: 5,
            comment: "Excellent product! The quality is amazing and delivery was smooth.",
            sample: true
        },

        {
            id: "sample-2",
            name: "Ali Raza",
            date: "November 3, 2026",
            timestamp: new Date("November 3, 2026").getTime(),
            rating: 4,
            comment: "Very good product. I am happy with my purchase.",
            sample: true
        },

        {
            id: "sample-3",
            name: "Sara Ahmed",
            date: "October 28, 2026",
            timestamp: new Date("October 28, 2026").getTime(),
            rating: 5,
            comment: "Great quality and excellent value for money. Highly recommended!",
            sample: true
        }
    ];

    let customerReviews = getArrayFromStorage(reviewStorageKey);

    if (localStorage.getItem(reviewStorageKey) === null) {
        customerReviews = [...sampleReviews];
    }

    const reviewList = document.getElementById("review-list");

    const reviewsAverage =
        document.getElementById("reviews-average");

    const reviewsCount =
        document.getElementById("reviews-count");

    const reviewForm =
        document.getElementById("review-form");

    const reviewSort =
        document.getElementById("review-sort");

    const ratingBreakdown =
        document.querySelector(".rating-breakdown");

    const reviewFormHeading =
        document.getElementById("review-form-heading");

    const reviewFormMessage =
        document.getElementById("review-form-message");

    const reviewerNameInput =
        document.getElementById("reviewer-name");

    const reviewRatingInput =
        document.getElementById("review-rating");

    const reviewCommentInput =
        document.getElementById("review-comment");

    let editingReviewId = null;

    // ============================================
    // 13. SAVE REVIEWS
    // ============================================

    function saveCustomerReviews() {

        return saveArrayToStorage(
            reviewStorageKey,
            customerReviews
        );
    }

    // ============================================
    // 14. VERIFIED PURCHASE CHECK
    // ============================================

    function hasVerifiedPurchase(reviewerName) {

        const orders = getArrayFromStorage("yourshop-orders");

        const normalizedName =
            reviewerName.trim().toLowerCase();

        return orders.some(order => {

            const customerName = String(
                order.customer?.name ||
                order.customerName ||
                ""
            ).trim().toLowerCase();

            const orderItems = Array.isArray(order.items)
                ? order.items
                : Array.isArray(order.products)
                    ? order.products
                    : [];

            const productMatches = orderItems.some(item => {

                const itemId = item.id ?? item.productId;

                return Number(itemId) === Number(selectedProduct.id);
            });

            const validOrder = ![
                "cancelled",
                "canceled"
            ].includes(
                String(order.status || "").toLowerCase()
            );

            return (
                customerName === normalizedName &&
                productMatches &&
                validOrder
            );
        });
    }

    // ============================================
    // 15. REVIEW DISPLAY
    // ============================================

    function displayCustomerReviews() {

        if (!reviewList) return;

        reviewList.innerHTML = "";

        const publicReviews = customerReviews.filter(
            review =>
                review.sample === true ||
                review.status === "approved"
        );

        let sortedReviews = [...publicReviews];

        if (reviewSort?.value === "highest") {

            sortedReviews.sort(
                (a, b) => Number(b.rating) - Number(a.rating)
            );

        } else if (reviewSort?.value === "lowest") {

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

        if (sortedReviews.length === 0) {

            const message = document.createElement("p");

            message.className = "no-reviews-message";

            message.textContent =
                "No reviews yet. Be the first to review this product!";

            reviewList.appendChild(message);
        }

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
                1,
                Math.min(5, Number(review.rating) || 1)
            );

            stars.textContent =
                "★".repeat(rating) +
                "☆".repeat(5 - rating);

            header.append(reviewerInfo, stars);

            const comment = document.createElement("p");

            comment.textContent = review.comment;

            reviewCard.append(header, comment);

            const currentOwner =
                localStorage.getItem(reviewOwnerKey) || "";

            if (
                !review.sample &&
                currentOwner &&
                review.owner === currentOwner
            ) {

                const actions = document.createElement("div");

                actions.className = "review-actions";

                const editButton = document.createElement("button");

                editButton.type = "button";
                editButton.className = "edit-review-button";
                editButton.dataset.reviewId = review.id;
                editButton.textContent = "Edit";

                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.className = "delete-review-button";
                deleteButton.dataset.reviewId = review.id;
                deleteButton.textContent = "Delete";

                actions.append(editButton, deleteButton);

                reviewCard.appendChild(actions);
            }

            reviewList.appendChild(reviewCard);
        });

        const totalRating = publicReviews.reduce(
            (total, review) =>
                total + Number(review.rating || 0),
            0
        );

        const averageRating = publicReviews.length
            ? totalRating / publicReviews.length
            : 0;

        if (reviewsAverage) {
            reviewsAverage.textContent =
                averageRating.toFixed(1);
        }

        if (reviewsCount) {

            reviewsCount.textContent =
                `Based on ${publicReviews.length} reviews`;
        }

        if (ratingBreakdown) {

            ratingBreakdown.innerHTML = "";

            for (let stars = 5; stars >= 1; stars--) {

                const count = publicReviews.filter(
                    review => Number(review.rating) === stars
                ).length;

                const percentage = publicReviews.length
                    ? (count / publicReviews.length) * 100
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

        if (productRating) {
            productRating.textContent = averageRating.toFixed(1);
        }
    }

    // ============================================
    // 16. REVIEW SORTING
    // ============================================

    if (reviewSort) {

        reviewSort.addEventListener(
            "change",
            displayCustomerReviews
        );
    }

    // ============================================
    // 17. INTERACTIVE STAR RATING
    // ============================================

    const ratingContainer =
        document.getElementById("interactive-rating");

    const ratingFeedback =
        document.getElementById("rating-feedback");

    const ratingLabels = {

        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent"
    };

    function updateRating(value) {

        if (!reviewRatingInput) return;

        reviewRatingInput.value = value;

        if (ratingContainer) {

            ratingContainer.querySelectorAll("button")
                .forEach(button => {

                    const buttonRating =
                        Number(button.dataset.rating);

                    button.classList.toggle(
                        "active",
                        buttonRating <= value
                    );
                });
        }

        if (ratingFeedback) {

            ratingFeedback.textContent =
                ratingLabels[value] || "";
        }
    }

    if (ratingContainer && reviewRatingInput) {

        ratingContainer.querySelectorAll("button")
            .forEach(button => {

                button.addEventListener("click", () => {

                    updateRating(
                        Number(button.dataset.rating)
                    );
                });
            });

        updateRating(
            Number(reviewRatingInput.value) || 5
        );
    }

    // ============================================
    // 18. RESET REVIEW FORM
    // ============================================

    function resetReviewForm() {

        editingReviewId = null;

        if (reviewForm) {
            reviewForm.reset();
        }

        if (reviewFormHeading) {

            reviewFormHeading.textContent =
                "Write a Review";
        }

        if (reviewFormMessage) {

            reviewFormMessage.textContent = "";
            reviewFormMessage.className = "";
        }

        updateRating(5);

        const cancelButton =
            document.getElementById("cancel-review-edit");

        if (cancelButton) {
            cancelButton.remove();
        }
    }

    // ============================================
    // 19. EDIT REVIEW
    // ============================================

    function editReview(reviewId) {

        const currentOwner =
            localStorage.getItem(reviewOwnerKey) || "";

        const review = customerReviews.find(
            item => String(item.id) === String(reviewId)
        );

        if (
            !review ||
            !currentOwner ||
            review.owner !== currentOwner
        ) {

            alert("You cannot edit this review.");

            return;
        }

        editingReviewId = review.id;

        if (reviewerNameInput) {
            reviewerNameInput.value = review.name;
        }

        if (reviewCommentInput) {
            reviewCommentInput.value = review.comment;
        }

        updateRating(Number(review.rating));

        if (reviewFormHeading) {

            reviewFormHeading.textContent =
                "Edit Your Review";
        }

        if (reviewFormMessage) {

            reviewFormMessage.textContent =
                "You are editing your existing review.";

            reviewFormMessage.className =
                "review-edit-message";
        }

        let cancelButton =
            document.getElementById("cancel-review-edit");

        if (!cancelButton && reviewForm) {

            cancelButton = document.createElement("button");

            cancelButton.type = "button";
            cancelButton.id = "cancel-review-edit";
            cancelButton.textContent = "Cancel Edit";
            cancelButton.className = "cancel-review-button";

            reviewForm.appendChild(cancelButton);

            cancelButton.addEventListener(
                "click",
                resetReviewForm
            );
        }

        reviewForm?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // ============================================
    // 20. DELETE REVIEW
    // ============================================

    function deleteReview(reviewId) {

        const currentOwner =
            localStorage.getItem(reviewOwnerKey) || "";

        const reviewIndex = customerReviews.findIndex(
            item => String(item.id) === String(reviewId)
        );

        if (reviewIndex === -1) return;

        const review = customerReviews[reviewIndex];

        if (
            !currentOwner ||
            review.owner !== currentOwner
        ) {

            alert("You cannot delete this review.");

            return;
        }

        if (!confirm("Are you sure you want to delete your review?")) {
            return;
        }

        customerReviews.splice(reviewIndex, 1);

        if (saveCustomerReviews()) {

            displayCustomerReviews();

            if (
                String(editingReviewId) === String(reviewId)
            ) {

                resetReviewForm();
            }
        }
    }

    // ============================================
    // 21. REVIEW ACTION EVENTS
    // ============================================

    if (reviewList) {

        reviewList.addEventListener("click", event => {

            const editButton =
                event.target.closest(".edit-review-button");

            const deleteButton =
                event.target.closest(".delete-review-button");

            if (editButton) {
                editReview(editButton.dataset.reviewId);
            }

            if (deleteButton) {
                deleteReview(deleteButton.dataset.reviewId);
            }
        });
    }

    // ============================================
    // 22. SUBMIT OR UPDATE REVIEW
    // ============================================

    if (reviewForm) {

        reviewForm.addEventListener("submit", event => {

            event.preventDefault();

            const reviewerName =
                reviewerNameInput?.value.trim() || "";

            const rating =
                Number(reviewRatingInput?.value);

            const reviewComment =
                reviewCommentInput?.value.trim() || "";

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

            const currentOwner =
                localStorage.getItem(reviewOwnerKey) || "";

            if (
                currentOwner &&
                currentOwner !== reviewerName
            ) {

                alert(
                    "This browser already has a reviewer identity. " +
                    "Use the same name to manage its reviews."
                );

                return;
            }

            try {

                localStorage.setItem(
                    reviewOwnerKey,
                    reviewerName
                );

            } catch (error) {

                alert("Your reviewer identity could not be saved.");

                return;
            }

            const now = new Date();

            const wasEditing =
                editingReviewId !== null;

            if (wasEditing) {

                const review = customerReviews.find(
                    item =>
                        String(item.id) ===
                        String(editingReviewId)
                );

                if (
                    !review ||
                    review.owner !== reviewerName
                ) {

                    alert("You cannot update this review.");

                    resetReviewForm();

                    return;
                }

                review.rating = rating;
                review.comment = reviewComment;

                review.date = now.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );

                review.timestamp = now.getTime();

                review.status = "pending";

            } else {

                const alreadyReviewed =
                    customerReviews.some(review =>
                        !review.sample &&
                        review.owner === reviewerName
                    );

                if (alreadyReviewed) {

                    alert(
                        "You have already reviewed this product. " +
                        "Use Edit to update your review."
                    );

                    return;
                }

                customerReviews.unshift({

                    id:
                        "review-" +
                        now.getTime() +
                        "-" +
                        Math.random().toString(36).slice(2, 8),

                    owner: reviewerName,
                    name: reviewerName,

                    date: now.toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    ),

                    timestamp: now.getTime(),

                    rating,
                    comment: reviewComment,

                    sample: false,
                    status: "pending"
                });
            }

            if (!saveCustomerReviews()) return;

            if (reviewSort) {
                reviewSort.value = "newest";
            }

            displayCustomerReviews();

            resetReviewForm();

            alert(
                wasEditing
                    ? "Your review has been updated and submitted for admin approval."
                    : "Thank you! Your review has been submitted and is waiting for admin approval."
            );
        });
    }

    displayCustomerReviews();

    // ========================================
    // 23. RELATED PRODUCTS
    // ========================================

    const relatedProducts = products.filter(product =>

        product.category === selectedProduct.category &&

        Number(product.id) !== Number(selectedProduct.id)
    );

    if (relatedProductsGrid) {

        relatedProductsGrid.innerHTML = "";

        relatedProducts.slice(0, 4).forEach(product => {

            const productDiscount =
                Math.max(
                    0,
                    Math.min(100, Number(product.discount) || 0)
                );

            const productDiscountedPrice =
                Number(product.price) -
                (Number(product.price) * productDiscount / 100);

            const card = document.createElement("div");

            card.className = "product-card";

            card.dataset.productId = product.id;

            const imageContainer =
                document.createElement("div");

            imageContainer.className =
                "product-image-container";

            const image = document.createElement("img");

            image.alt = product.name || "Product";
            image.loading = "lazy";

            attachImageFallback(
                image,
                getProductImages(product)
            );

            const badge = document.createElement("span");

            badge.className = "discount-badge";

            badge.textContent =
                productDiscount + "% OFF";

            imageContainer.append(image, badge);

            const info = document.createElement("div");

            info.className = "product-info";

            const category = document.createElement("span");

            category.className = "product-category";

            category.textContent =
                String(product.category || "")
                    .replace(/-/g, " ");

            const name = document.createElement("h3");

            name.textContent = product.name;

            const rating = document.createElement("div");

            rating.className = "product-rating";

            rating.textContent =
                `⭐ ${Number(product.rating || 0)} / 5`;

            const prices = document.createElement("div");

            prices.className = "product-prices";

            const currentPrice =
                document.createElement("span");

            currentPrice.className = "product-price";

            currentPrice.textContent =
                formatPrice(productDiscountedPrice);

            const previousPrice =
                document.createElement("span");

            previousPrice.className = "old-price";

            previousPrice.textContent =
                formatPrice(product.price);

            prices.append(currentPrice, previousPrice);

            info.append(category, name, rating, prices);

            card.append(imageContainer, info);

            relatedProductsGrid.appendChild(card);
        });

        relatedProductsGrid.addEventListener("click", event => {

            const card = event.target.closest(".product-card");

            if (!card) return;

            window.location.href =
                "./product-detail.html?id=" +
                encodeURIComponent(card.dataset.productId);
        });
    }

    // ========================================
    // 24. QUANTITY CONTROLS
    // ========================================

    function updateQuantityStatus(quantity) {

        if (stockQuantity <= 0) return;

        if (quantity >= stockQuantity) {

            updateStockMessage(
                "Maximum stock reached!",
                "low-stock"
            );

        } else if (stockQuantity <= 5) {

            updateStockMessage(
                `Only ${stockQuantity} left in stock`,
                "low-stock"
            );

        } else {

            updateStockMessage(
                "In Stock",
                ""
            );
        }
    }

    if (minusButton && quantityInput) {

        minusButton.addEventListener("click", () => {

            let quantity = Number(quantityInput.value) || 1;

            quantity = Math.max(1, quantity - 1);

            quantityInput.value = quantity;

            updateQuantityStatus(quantity);
        });
    }

    if (plusButton && quantityInput) {

        plusButton.addEventListener("click", () => {

            let quantity = Number(quantityInput.value) || 1;

            if (quantity >= stockQuantity) {

                quantityInput.value = stockQuantity;

                updateQuantityStatus(quantity);

                return;
            }

            quantity++;

            quantityInput.value = quantity;

            updateQuantityStatus(quantity);
        });
    }

    if (quantityInput) {

        quantityInput.addEventListener("change", () => {

            let quantity = Number(quantityInput.value);

            if (!Number.isInteger(quantity)) {
                quantity = 1;
            }

            quantity = Math.max(
                1,
                Math.min(stockQuantity, quantity)
            );

            if (stockQuantity <= 0) {
                quantity = 0;
            }

            quantityInput.value = quantity;

            updateQuantityStatus(quantity);
        });
    }

    // ========================================
    // 25. ADD PRODUCT TO CART
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

        const cart = getArrayFromStorage("yourshop-cart");

        const existingProduct = cart.find(item =>

            Number(item.id) === Number(selectedProduct.id)
        );

        const currentCartQuantity = existingProduct
            ? Math.max(0, Number(existingProduct.quantity) || 0)
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
                quantity
            });
        }

        const saved = saveArrayToStorage(
            "yourshop-cart",
            cart
        );

        if (!saved) return false;

        return true;
    }

    if (addToCartButton) {

        addToCartButton.addEventListener("click", () => {

            if (addProductToCart()) {

                alert(
                    selectedProduct.name +
                    " added to your cart!"
                );
            }
        });
    }

    if (buyNowButton) {

        buyNowButton.addEventListener("click", () => {

            if (addProductToCart()) {

                window.location.href = "./checkout.html";
            }
        });
    }

    console.log(
        "YourShop product details loaded successfully:",
        selectedProduct.name
    );

});
