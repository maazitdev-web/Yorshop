
// ========================================
// YOURSHOP - FAQ JAVASCRIPT
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // Select all FAQ question buttons
    const faqQuestions = document.querySelectorAll(".faq-question");

    // Add click event to every question
    faqQuestions.forEach((question) => {

        question.addEventListener("click", () => {

            // Find the answer belonging to this question
            const answer = question.nextElementSibling;

            // Check whether this answer is already open
            const isOpen = answer.style.display === "block";

            // Close all answers first
            faqQuestions.forEach((item) => {
                item.nextElementSibling.style.display = "none";
                item.querySelector("span").textContent = "+";
                item.setAttribute("aria-expanded", "false");
            });

            // Open the clicked answer if it was previously closed
            if (!isOpen) {
                answer.style.display = "block";
                question.querySelector("span").textContent = "−";
                question.setAttribute("aria-expanded", "true");
            }

        });

    });

});
