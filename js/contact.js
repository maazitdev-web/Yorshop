
// =====================================
// YOURSHOP - CONTACT FORM
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("contact-success");

    if (!contactForm) return;

    contactForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        // Check empty fields
        if (!name || !email || !subject || !message) {
            alert("Please complete all fields.");
            return;
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Show success message
        successMessage.textContent =
            "Thank you, " + name + "! Your message has passed validation.";

        // Clear the form
        contactForm.reset();

    });

});
