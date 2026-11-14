
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const logoutButton = document.getElementById("admin-logout-button");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
        const confirmed = window.confirm("Are you sure you want to log out of the admin panel?");

        if (!confirmed) return;

        // Clear only the admin authentication token
        sessionStorage.removeItem("yourshop-admin-token");

        // Return to admin login
        window.location.replace("./admin-login.html");
    });
});
