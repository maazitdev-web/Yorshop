
// ============================================
// YOURSHOP - COLLAPSIBLE ADMIN SIDEBAR
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const sidebar = document.querySelector(".admin-sidebar");
    const menuButton = document.getElementById("admin-menu-toggle");

    if (!sidebar || !menuButton) return;

    // Create overlay.
    const overlay = document.createElement("div");

    overlay.className = "admin-sidebar-overlay";

    document.body.appendChild(overlay);

    // Open and close sidebar.
    function toggleSidebar() {

        const isOpen = sidebar.classList.toggle("active");

        overlay.classList.toggle("active", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.textContent = isOpen ? "✕" : "☰";
    }

    function closeSidebar() {

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.textContent = "☰";
    }

    menuButton.addEventListener("click", toggleSidebar);

    overlay.addEventListener("click", closeSidebar);

    // Close after selecting a navigation link.
    sidebar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeSidebar);
    });

    // Close with Escape key.
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

});
