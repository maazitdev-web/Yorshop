
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const logoutButton = document.getElementById("customer-logout-button");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
        const confirmed = window.confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        // Clear customer session from both storage locations.
        localStorage.removeItem("yourshop-customer-session");
        sessionStorage.removeItem("yourshop-customer-session");

        // Redirect to customer login.
        window.location.replace("./customer-login.html");
    });
});
