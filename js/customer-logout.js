
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const logoutButton = document.getElementById("customer-logout-button");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
        const confirmed = window.confirm("Are you sure you want to log out?");

        if (!confirmed) return;

        // Clear only customer authentication information
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerUser");

        // Return to customer login
        window.location.replace("./customer-login.html");
    });
});
