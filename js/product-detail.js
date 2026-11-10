
// ============================================
// YOURSHOP - PRODUCT DETAILS JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. Get HTML elements

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


    // 2. Get product ID from URL

    const urlParameters = new URLSearchParams(window.location.search);

    const productId = Number(urlParameters.get("id"));


    // 3. Find selected product

    const selectedProduct = products.find(
        (product) => product.id === productId
    );

    if (!selectedProduct) {
        const detailsContainer = document.querySelector(".product-details-container");

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

    

// ============================================
// CUSTOMER REVIEWS SYSTEM
// ============================================

// Sample reviews
const sampleReviews = [
    {
        name: "Ahmed Khan",
        date: "November 5, 2026",
        rating: 5,
        comment: "Excellent product! The quality is amazing and delivery was smooth."
    },
    {
        name: "Ali Raza",
        date: "November 3, 2026",
        rating: 4,
        comment: "Very good product. I am happy with my purchase."
    },
    {
        name: "Sara Ahmed",
        date: "October 28, 2026",
        rating: 5,
        comment: "Great quality and excellent value for money. Highly recommended!"
    }
];

// Load reviews separately for each product
const reviewStorageKey = "yourshop-reviews-" + productId;

let customerReviews = JSON.parse(
    localStorage.getItem(reviewStorageKey)
) || sampleReviews;

const reviewList = document.getElementById("review-list");
const reviewsAverage = document.getElementById("reviews-average");
const reviewsCount = document.getElementById("reviews-count");

function displayCustomerReviews() {
    if (!reviewList) return;

    reviewList.innerHTML = "";

    // Sort customer reviews
    const sortSelect = document.getElementById("review-sort");
    let sortedReviews = [...customerReviews];

    if (sortSelect && sortSelect.value === "highest") {
        sortedReviews.sort((a, b) => Number(b.rating) - Number(a.rating));
    } 
    else if (sortSelect && sortSelect.value === "lowest") {
        sortedReviews.sort((a, b) => Number(a.rating) - Number(b.rating));
    } 
    else {
        sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }


    sortedReviews.forEach(review => {

        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");

        const header = document.createElement("div");
        header.classList.add("review-card-header");

        const reviewerInfo = document.createElement("div");

        const name = document.createElement("h4");
        name.textContent = review.name;
        const verified = document.createElement("small");
verified.classList.add("verified-purchase");
verified.textContent = "✓ Verified Purchase";

reviewerInfo.append(name, verified);

        const date = document.createElement("span");
        date.textContent = review.date;

reviewerInfo.append(date);
        const stars = document.createElement("div");
        stars.classList.add("review-card-stars");
        stars.textContent =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);

        header.append(reviewerInfo, stars);

        const comment = document.createElement("p");
        comment.textContent = review.comment;

        reviewCard.append(header, comment);
        reviewList.appendChild(reviewCard);
    });

    const averageRating = customerReviews.length
        ? customerReviews.reduce(
        (total, review) => total + Number(review.rating), 0
        ) / customerReviews.length
        : 0;

    if (reviewsAverage) {
        reviewsAverage.textContent = averageRating.toFixed(1);
    }

    if (reviewsCount) {
        reviewsCount.textContent =
            `Based on ${customerReviews.length} reviews`;
    }
}


// Update rating breakdown
const ratingBreakdown = document.querySelector(".rating-breakdown");

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
        row.classList.add("rating-row");

        row.innerHTML = `
            <span>${stars} Stars</span>
            <div class="rating-progress">
                <div class="rating-progress-fill"
                     style="width: ${percentage}%"></div>
            </div>
            <span>${count}</span>
        `;

        ratingBreakdown.appendChild(row);
    }
}

displayCustomerReviews();

const reviewSort = document.getElementById("review-sort");

if (reviewSort) {
    reviewSort.addEventListener("change", displayCustomerReviews);
}


// ============================================
// SUBMIT CUSTOMER REVIEW
// ============================================

const reviewForm = document.getElementById("review-form");

if (reviewForm) {

    reviewForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const reviewerName =
            document.getElementById("reviewer-name").value.trim();

        const rating =
            Number(document.getElementById("review-rating").value);

        const reviewComment =
            document.getElementById("review-comment").value.trim();

        if (!reviewerName || !reviewComment) {
            alert("Please complete all review fields.");
            return;
        }

        const newReview = {
            name: reviewerName,
            date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }),
            rating: rating,
            comment: reviewComment
        };

        customerReviews.unshift(newReview);

        localStorage.setItem(
            reviewStorageKey,
            JSON.stringify(customerReviews)
        );

        displayCustomerReviews();

        reviewForm.reset();

        alert("Thank you! Your review has been submitted.");
    });
}


    // 5. Calculate discounted price

    const discountedPrice =
        selectedProduct.price -
        (selectedProduct.price * selectedProduct.discount / 100);


    // 6. Display product information

    if (productImage) {
        productImage.src = selectedProduct.image;
        productImage.alt = selectedProduct.name;
    }

    const gallery = document.getElementById("product-image-gallery");
    const productImages = selectedProduct.images?.length
        ? selectedProduct.images
        : [selectedProduct.image];

    if (gallery && productImage) {
        gallery.innerHTML = "";

        productImages.slice(0, 4).forEach((image, index) => {
            const thumbnail = document.createElement("img");

            thumbnail.src = image;
            thumbnail.alt = `${selectedProduct.name} image ${index + 1}`;
            thumbnail.classList.add("product-thumbnail");

            if (index === 0) {
                thumbnail.classList.add("active");
            }

            thumbnail.addEventListener("click", () => {
                productImage.src = image;

                gallery.querySelectorAll(".product-thumbnail")
                    .forEach((item) => item.classList.remove("active"));

                thumbnail.classList.add("active");
            });

            gallery.appendChild(thumbnail);
        });
    }

    productName.textContent = selectedProduct.name;

    productCategory.textContent =
        selectedProduct.category.replaceAll("-", " ");

    productRating.textContent = selectedProduct.rating;

    productPrice.textContent = "$" + discountedPrice.toFixed(2);

    oldPrice.textContent = "$" + selectedProduct.price.toFixed(2);

    discountBadge.textContent = selectedProduct.discount + "% OFF";

    
// ========================================
// PRODUCT STOCK STATUS
// ========================================

const stockStatusElement = document.getElementById("detail-stock-status");

// Demo stock quantity.
// We will connect this to real inventory later.
const stockQuantity = selectedProduct.stock ?? 12;
// Set the maximum purchase quantity
if (quantityInput && stockQuantity > 0) {
    quantityInput.max = stockQuantity;

    if (Number(quantityInput.value) > stockQuantity) {
        quantityInput.value = stockQuantity;
    }
}

if (stockStatusElement) {

    if (stockQuantity <= 0) {

        if (quantityInput) {
            quantityInput.disabled = true;
        }

        if (minusButton) {
            minusButton.disabled = true;
        }

        if (plusButton) {
            plusButton.disabled = true;
        }

        if (addToCartButton) {
            addToCartButton.disabled = true;
            addToCartButton.textContent = "Out of Stock";
        }

        if (buyNowButton) {
            buyNowButton.disabled = true;
            buyNowButton.textContent = "Unavailable";
        }

        stockStatusElement.textContent = "Out of Stock";
        stockStatusElement.className =
            "product-stock-status out-of-stock";

    } else if (stockQuantity <= 5) {
        stockStatusElement.textContent =
            `Only ${stockQuantity} left in stock`;

        stockStatusElement.className =
            "product-stock-status low-stock";

    } else {
        stockStatusElement.textContent = "In Stock";

        stockStatusElement.className =
            "product-stock-status";
    }
}

    
// ========================================
// DISPLAY PRODUCT DESCRIPTION
// ========================================

const descriptionElement = document.getElementById("detail-description");

if (descriptionElement) {
    descriptionElement.textContent =
        `${selectedProduct.name} is part of our ${selectedProduct.category.replaceAll("-", " ")} collection. Enjoy quality, great value, and a convenient shopping experience with YourShop.`;
}


// ========================================
// DISPLAY PRODUCT SPECIFICATIONS
// ========================================

const specificationsElement = document.getElementById("detail-specifications");

if (specificationsElement) {
    const originalPrice = selectedProduct.price;
    const discountedPrice =
        originalPrice - (originalPrice * selectedProduct.discount / 100);

    const specifications = [
        ["Product Name", selectedProduct.name],
        ["Category", selectedProduct.category.replaceAll("-", " ")],
        ["Original Price", "$" + originalPrice.toFixed(2)],
        ["Discount", selectedProduct.discount + "%"],
        ["Discounted Price", "$" + discountedPrice.toFixed(2)],
        ["Customer Rating", selectedProduct.rating + " / 5"]
    ];

    specificationsElement.innerHTML = "";

    specifications.forEach(([label, value]) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${label}</td>
            <td>${value}</td>
        `;

        specificationsElement.appendChild(row);
    });
}


    
// ========================================
// 13. DISPLAY RELATED PRODUCTS
// ========================================

const relatedProductsGrid = document.getElementById(
    "related-products-grid"
);

// Find other products from the same category
const relatedProducts = products.filter((product) => {

    return (
        product.category === selectedProduct.category &&
        product.id !== selectedProduct.id
    );

});

// Display related products
if (relatedProductsGrid) {

    relatedProductsGrid.innerHTML = "";

    relatedProducts.slice(0, 4).forEach((product) => {

        const discountedPrice =
            product.price -
            (product.price * product.discount / 100);

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

            </div>
        `;

        relatedProductsGrid.appendChild(card);

    });

}


// Open related product details
if (relatedProductsGrid) {

    relatedProductsGrid.addEventListener("click", (event) => {

        const card = event.target.closest(".product-card");

        if (!card) return;

        const productId = card.dataset.productId;

        window.location.href =
            "./product-detail.html?id=" + productId;

    });

}



   
    // 7. Quantity minus button

    if (minusButton && quantityInput) {
        minusButton.addEventListener("click", () => {

            const quantity = Number(quantityInput.value);

            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }

        });
    }



    // 8. Quantity plus button

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

            if (Number(quantityInput.value) === stockQuantity &&
                stockStatusElement) {

                stockStatusElement.textContent =
                    "Maximum stock reached!";

                stockStatusElement.className =
                    "product-stock-status low-stock";
            }

        });
    }


    // 9. Validate manually entered quantity

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


    // 10. Add product to cart

    function addProductToCart() {

        if (stockQuantity <= 0 || !quantityInput) {
            return false;
        }

        const quantity = Number(quantityInput.value);

        let cart = JSON.parse(
            localStorage.getItem("yourshop-cart")
        ) || [];

        const existingProduct = cart.find(
            (item) => item.id === selectedProduct.id
        );

        const currentCartQuantity = existingProduct
            ? existingProduct.quantity
            : 0;

        if (currentCartQuantity + quantity > stockQuantity) {

            alert(
                `Sorry! Only ${stockQuantity - currentCartQuantity} more item(s) available.`
            );

            return false;
        }

        if (existingProduct) {

            existingProduct.quantity += quantity;

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




    // 11. Add to Cart button

    if (addToCartButton) {
        addToCartButton.addEventListener("click", () => {

            const added = addProductToCart();

            if (added) {
                alert(selectedProduct.name + " added to your cart!");
            }

        });
    }


    // 12. Buy Now button

    if (buyNowButton) {
        buyNowButton.addEventListener("click", () => {

            const added = addProductToCart();

            if (added) {
                window.location.href = "./checkout.html";
            }

        });
    }

});
