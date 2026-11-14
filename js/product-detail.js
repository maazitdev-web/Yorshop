
// ============================================
// YOURSHOP - PRODUCT DETAILS JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", async () => {    "use strict";

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
    // ========================================
    // 2. GET PRODUCT FROM MYSQL BACKEND
    // ========================================

    const urlParameters = new URLSearchParams(window.location.search);
    const productId = Number(urlParameters.get("id"));

    let databaseProducts = [];
    let selectedProduct = null;

    try {
  const response = await fetch(
    `http://192.168.0.189:3000/api/products/${productId}`
);

if (!response.ok) {
    throw new Error("Product request failed: " + response.status);
}

const data = await response.json();

if (!data.success || !data.product) {
    throw new Error("Invalid product data received.");
}

const product = data.product;

// Safely handle product images.
let productImages = [];

if (Array.isArray(product.images)) {
    productImages = product.images;
} else if (typeof product.images === "string" && product.images.trim()) {
    try {
        productImages = JSON.parse(product.images);
    } catch {
        productImages = [product.images];
    }
}

selectedProduct = {
        ...product,
    id: Number(product.id),
    price: Number(product.price),
    discount: Number(product.discount),
    rating: Number(product.rating),
    stock: Number(product.stock),
    soldCount: Number(product.sold_count || 0),
    images: productImages,
    category: product.category === "men-fashion"
        ? "mens-fashion"
        : product.category
};

// Keep the global products array available for related products.
const existingIndex = products.findIndex(
    item => Number(item.id) === productId
);

if (existingIndex >= 0) {
    products[existingIndex] = selectedProduct;
} else {
    products.push(selectedProduct);
}

console.log("Selected product loaded:", selectedProduct.name);

        // Replace frontend products with database products.
        products.splice(0, products.length, ...databaseProducts);

        console.log(
            "Products successfully loaded from MySQL:",
            products.length
        );

    } catch (error) {
        console.error(
            "Could not load products from MySQL:",
            error.message
        );
    }

    // // Find the selected product.
    // const selectedProduct = Array.isArray(products)
    //     ? products.find(product => Number(product.id) === productId)
    //     : null;

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
    // 3. HELPER FUNCTIONS
    // ========================================

    function formatPrice(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }

        return "$" + (Number(amount) || 0).toFixed(2);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getArrayFromStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage error:", key, error);
            return [];
        }
    }

    // ========================================
    // 4. RECENTLY VIEWED PRODUCTS
    // ========================================

    const recentlyViewedKey = "yourshop-recently-viewed";

    let recentlyViewed = getArrayFromStorage(recentlyViewedKey);

    recentlyViewed = recentlyViewed.filter(
        id => Number(id) !== Number(selectedProduct.id)
    );

    recentlyViewed.unshift(Number(selectedProduct.id));
    recentlyViewed = recentlyViewed.slice(0, 8);

    try {
        localStorage.setItem(
            recentlyViewedKey,
            JSON.stringify(recentlyViewed)
        );
    } catch (error) {
        console.error("Could not save recently viewed products:", error);
    }

    // ========================================
    // 5. PRODUCT PRICE
    // ========================================

    const originalPrice = Number(selectedProduct.price) || 0;
    const discount = Number(selectedProduct.discount) || 0;

    const discountedPrice =
        originalPrice - (originalPrice * discount / 100);

    // ========================================
    // 6. PRODUCT INFORMATION
    // ========================================

    if (productImage) {
        productImage.src = selectedProduct.image || "";
        productImage.alt = selectedProduct.name;
    }

    if (productName) {
        productName.textContent = selectedProduct.name;
    }

    if (productCategory) {
        productCategory.textContent =
            String(selectedProduct.category || "").replace(/-/g, " ");
    }

    if (productRating) {
        productRating.textContent = Number(selectedProduct.rating || 0).toFixed(1);
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
// 7. PRODUCT IMAGE GALLERY
// ========================================

const gallery = document.getElementById("product-image-gallery");

// Clean and validate the image URLs.
const productImages = [
    ...new Set(
        (Array.isArray(selectedProduct.images)
            ? selectedProduct.images
            : []
        )
        .filter(image =>
            typeof image === "string" &&
            image.trim().startsWith("https://")
        )
        .map(image => image.trim())
    )
];

// Use the main product image if the images array is empty.
if (productImages.length === 0 && selectedProduct.image) {
    productImages.push(selectedProduct.image);
}

// Display the first valid image.
if (productImage && productImages.length > 0) {
    productImage.src = productImages[0];
    productImage.alt = selectedProduct.name;

    productImage.onerror = function () {
        this.alt = "Product image unavailable";
        console.error("Main product image failed:", this.src);
    };
}

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

        // Handle unavailable image URLs.
        thumbnail.onerror = function () {
            console.error("Thumbnail image failed:", image);
            thumbnail.classList.add("image-error");
            thumbnail.style.display = "none";
        };

        thumbnail.addEventListener("click", () => {
            productImage.src = image;
            productImage.alt =
                `${selectedProduct.name} image ${index + 1}`;

            gallery.querySelectorAll(".product-thumbnail")
                .forEach(item => item.classList.remove("active"));

            thumbnail.classList.add("active");
        });

        gallery.appendChild(thumbnail);
    });
}
    // ========================================
    // 8. STOCK VALIDATION
    // ========================================

    const stockQuantity = Math.max(
        0,
        Number(selectedProduct.stock ?? 12)
    );

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
    } else if (stockStatusElement) {
        stockStatusElement.textContent = "In Stock";
        stockStatusElement.className = "product-stock-status";
    }

    // ========================================
    // 9. PRODUCT DESCRIPTION
    // ========================================

    const descriptionElement = document.getElementById("detail-description");

    if (descriptionElement) {
        descriptionElement.textContent =
            `${selectedProduct.name} is part of our ${
                String(selectedProduct.category || "").replace(/-/g, " ")
            } collection. Enjoy quality, great value, and a convenient shopping experience with YourShop.`;
    }

    // ========================================
    // 10. PRODUCT SPECIFICATIONS
    // ========================================

    const specificationsElement =
        document.getElementById("detail-specifications");

    if (specificationsElement) {
        const specifications = [
            ["Product Name", selectedProduct.name],
            [
                "Category",
                String(selectedProduct.category || "").replace(/-/g, " ")
            ],
            ["Original Price", formatPrice(originalPrice)],
            ["Discount", discount + "%"],
            ["Discounted Price", formatPrice(discountedPrice)],
            ["Customer Rating", Number(selectedProduct.rating || 0) + " / 5"],
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
    // 11. CUSTOMER REVIEWS
    // ============================================

    const reviewStorageKey = "yourshop-reviews-" + selectedProduct.id;
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

    // Review elements
    const reviewList = document.getElementById("review-list");
    const reviewsAverage = document.getElementById("reviews-average");
    const reviewsCount = document.getElementById("reviews-count");
    const reviewForm = document.getElementById("review-form");
    const reviewSort = document.getElementById("review-sort");
    const ratingBreakdown = document.querySelector(".rating-breakdown");

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
    // 12. SAVE REVIEWS
    // ============================================

    function saveCustomerReviews() {
        try {
            localStorage.setItem(
                reviewStorageKey,
                JSON.stringify(customerReviews)
            );
            return true;
        } catch (error) {
            console.error("Could not save reviews:", error);
            alert("Your review could not be saved. Please try again.");
            return false;
        }
    }

    // ============================================
    // 13. VERIFIED PURCHASE CHECK
    // ============================================

    function hasVerifiedPurchase(reviewerName) {
        const orders = getArrayFromStorage("yourshop-orders");
        const normalizedName = reviewerName.trim().toLowerCase();

        return orders.some(order => {
            const customerName = String(
                order.customer?.name || order.customerName || ""
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

            const validOrder = !["cancelled", "canceled"].includes(
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
    // 14. REVIEW DISPLAY
    // ============================================

    function displayCustomerReviews() {
        if (!reviewList) return;

        reviewList.innerHTML = "";

        // Only sample and admin-approved reviews are public.
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
                (a, b) => Number(b.timestamp || 0) -
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
                "★".repeat(rating) + "☆".repeat(5 - rating);

            header.append(reviewerInfo, stars);

            const comment = document.createElement("p");
            comment.textContent = review.comment;

            reviewCard.append(header, comment);

            // Only show edit/delete controls for the locally identified owner.
            const currentOwner = localStorage.getItem(reviewOwnerKey) || "";

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

        // Average rating: approved and sample reviews only.
        const totalRating = publicReviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0
        );

        const averageRating = publicReviews.length
            ? totalRating / publicReviews.length
            : 0;

        if (reviewsAverage) {
            reviewsAverage.textContent = averageRating.toFixed(1);
        }

        if (reviewsCount) {
            reviewsCount.textContent =
                `Based on ${publicReviews.length} reviews`;
        }

        // Rating breakdown: approved and sample reviews only.
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

        // Update rating near product title.
        if (productRating) {
            productRating.textContent = averageRating.toFixed(1);
        }
    }

    // ============================================
    // 15. REVIEW SORTING
    // ============================================

    if (reviewSort) {
        reviewSort.addEventListener("change", displayCustomerReviews);
    }

    // ============================================
    // 16. INTERACTIVE STAR RATING
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
            ratingContainer.querySelectorAll("button").forEach(button => {
                const buttonRating = Number(button.dataset.rating);

                button.classList.toggle(
                    "active",
                    buttonRating <= value
                );
            });
        }

        if (ratingFeedback) {
            ratingFeedback.textContent = ratingLabels[value] || "";
        }
    }

    if (ratingContainer && reviewRatingInput) {
        ratingContainer.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                updateRating(Number(button.dataset.rating));
            });
        });

        updateRating(Number(reviewRatingInput.value) || 5);
    }

    // ============================================
    // 17. RESET REVIEW FORM
    // ============================================

    function resetReviewForm() {
        editingReviewId = null;

        if (reviewForm) reviewForm.reset();

        if (reviewFormHeading) {
            reviewFormHeading.textContent = "Write a Review";
        }

        if (reviewFormMessage) {
            reviewFormMessage.textContent = "";
            reviewFormMessage.className = "";
        }

        updateRating(5);

        const cancelButton = document.getElementById("cancel-review-edit");
        if (cancelButton) cancelButton.remove();
    }

    // ============================================
    // 18. EDIT REVIEW
    // ============================================

    function editReview(reviewId) {
        const currentOwner = localStorage.getItem(reviewOwnerKey) || "";

        const review = customerReviews.find(
            item => String(item.id) === String(reviewId)
        );

        if (!review || !currentOwner || review.owner !== currentOwner) {
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
            reviewFormHeading.textContent = "Edit Your Review";
        }

        if (reviewFormMessage) {
            reviewFormMessage.textContent =
                "You are editing your existing review.";
            reviewFormMessage.className = "review-edit-message";
        }

        let cancelButton = document.getElementById("cancel-review-edit");

        if (!cancelButton && reviewForm) {
            cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.id = "cancel-review-edit";
            cancelButton.textContent = "Cancel Edit";
            cancelButton.className = "cancel-review-button";

            reviewForm.appendChild(cancelButton);

            cancelButton.addEventListener("click", resetReviewForm);
        }

        reviewForm?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // ============================================
    // 19. DELETE REVIEW
    // ============================================

    function deleteReview(reviewId) {
        const currentOwner = localStorage.getItem(reviewOwnerKey) || "";

        const reviewIndex = customerReviews.findIndex(
            item => String(item.id) === String(reviewId)
        );

        if (reviewIndex === -1) return;

        const review = customerReviews[reviewIndex];

        if (!currentOwner || review.owner !== currentOwner) {
            alert("You cannot delete this review.");
            return;
        }

        if (!confirm("Are you sure you want to delete your review?")) {
            return;
        }

        customerReviews.splice(reviewIndex, 1);

        if (saveCustomerReviews()) {
            displayCustomerReviews();

            if (String(editingReviewId) === String(reviewId)) {
                resetReviewForm();
            }
        }
    }

    // ============================================
    // 20. REVIEW ACTION EVENTS
    // ============================================

    if (reviewList) {
        reviewList.addEventListener("click", event => {
            const editButton = event.target.closest(".edit-review-button");
            const deleteButton = event.target.closest(".delete-review-button");

            if (editButton) {
                editReview(editButton.dataset.reviewId);
            }

            if (deleteButton) {
                deleteReview(deleteButton.dataset.reviewId);
            }
        });
    }

    // ============================================
    // 21. SUBMIT OR UPDATE REVIEW
    // ============================================

    if (reviewForm) {
        reviewForm.addEventListener("submit", event => {
            event.preventDefault();

            const reviewerName = reviewerNameInput?.value.trim() || "";
            const rating = Number(reviewRatingInput?.value);
            const reviewComment = reviewCommentInput?.value.trim() || "";

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

            const currentOwner = localStorage.getItem(reviewOwnerKey) || "";

            // Demo identity: remember the name on this browser.
            if (currentOwner && currentOwner !== reviewerName) {
                alert(
                    "This browser already has a reviewer identity. " +
                    "Use the same name to manage its reviews."
                );
                return;
            }

            try {
                localStorage.setItem(reviewOwnerKey, reviewerName);
            } catch (error) {
                alert("Your reviewer identity could not be saved.");
                return;
            }

            const now = new Date();
            const wasEditing = editingReviewId !== null;

            if (wasEditing) {
                const review = customerReviews.find(
                    item => String(item.id) === String(editingReviewId)
                );

                if (!review || review.owner !== currentOwner) {
                    alert("You cannot update this review.");
                    resetReviewForm();
                    return;
                }

                review.rating = rating;
                review.comment = reviewComment;
                review.date = now.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
                review.timestamp = now.getTime();

                // Edited reviews require admin approval again.
                review.status = "pending";

            } else {
                // Prevent duplicate reviews from this browser for this product.
                const alreadyReviewed = customerReviews.some(
                    review =>
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
                    id: "review-" + now.getTime() + "-" +
                        Math.random().toString(36).slice(2, 8),
                    owner: reviewerName,
                    name: reviewerName,
                    date: now.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }),
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

    // Initial display
    displayCustomerReviews();

    // ========================================
    // 22. RELATED PRODUCTS
    // ========================================

    const relatedProductsGrid =
        document.getElementById("related-products-grid");

    const relatedProducts = products.filter(product =>
        product.category === selectedProduct.category &&
        Number(product.id) !== Number(selectedProduct.id)
    );

    if (relatedProductsGrid) {
        relatedProductsGrid.innerHTML = "";

        relatedProducts.slice(0, 4).forEach(product => {
            const productDiscount = Number(product.discount || 0);

            const productDiscountedPrice =
                Number(product.price) -
                (Number(product.price) * productDiscount / 100);

            const card = document.createElement("div");
            card.className = "product-card";
            card.dataset.productId = product.id;

            const imageContainer = document.createElement("div");
            imageContainer.className = "product-image-container";

            const image = document.createElement("img");
            image.src = product.image || "";
            image.alt = product.name;
            image.loading = "lazy";

            const badge = document.createElement("span");
            badge.className = "discount-badge";
            badge.textContent = productDiscount + "% OFF";

            imageContainer.append(image, badge);

            const info = document.createElement("div");
            info.className = "product-info";

            const category = document.createElement("span");
            category.className = "product-category";
            category.textContent =
                String(product.category || "").replace(/-/g, " ");

            const name = document.createElement("h3");
            name.textContent = product.name;

            const rating = document.createElement("div");
            rating.className = "product-rating";
            rating.textContent = `⭐ ${product.rating} / 5`;

            const prices = document.createElement("div");
            prices.className = "product-prices";

            const currentPrice = document.createElement("span");
            currentPrice.className = "product-price";
            currentPrice.textContent = formatPrice(productDiscountedPrice);

            const previousPrice = document.createElement("span");
            previousPrice.className = "old-price";
            previousPrice.textContent = formatPrice(product.price);

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
    // 23. QUANTITY CONTROLS
    // ========================================

    if (minusButton && quantityInput) {
        minusButton.addEventListener("click", () => {
            const quantity = Number(quantityInput.value);

            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });
    }

    if (plusButton && quantityInput) {
        plusButton.addEventListener("click", () => {
            const quantity = Number(quantityInput.value);

            if (quantity >= stockQuantity) {
                if (stockStatusElement) {
                    stockStatusElement.textContent = "Maximum stock reached!";
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
                stockStatusElement.textContent = "Maximum stock reached!";
                stockStatusElement.className =
                    "product-stock-status low-stock";
            }
        });
    }

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
    // 24. ADD PRODUCT TO CART
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

        let cart = getArrayFromStorage("yourshop-cart");

        const existingProduct = cart.find(
            item => Number(item.id) === Number(selectedProduct.id)
        );

        const currentCartQuantity = existingProduct
            ? Number(existingProduct.quantity) || 0
            : 0;

        if (currentCartQuantity + quantity > stockQuantity) {
            const remainingStock = Math.max(
                0,
                stockQuantity - currentCartQuantity
            );

            alert(`Sorry! Only ${remainingStock} more item(s) available.`);
            return false;
        }

        if (existingProduct) {
            existingProduct.quantity = currentCartQuantity + quantity;
        } else {
            cart.push({
                ...selectedProduct,
                quantity
            });
        }

        try {
            localStorage.setItem("yourshop-cart", JSON.stringify(cart));
            return true;
        } catch (error) {
            console.error("Could not save cart:", error);
            alert("Could not add this product to your cart.");
            return false;
        }
    }

    if (addToCartButton) {
        addToCartButton.addEventListener("click", () => {
            if (addProductToCart()) {
                alert(selectedProduct.name + " added to your cart!");
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
});
