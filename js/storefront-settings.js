
// ==========================================
// YOURSHOP - STOREFRONT SETTINGS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const SETTINGS_KEY = "yourshop-settings";

    // Load saved settings
    function loadStoreSettings() {
        try {
            return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        } catch (error) {
            console.error("Unable to load store settings:", error);
            return {};
        }
    }

    const settings = loadStoreSettings();

    // Get store name
    const storeName = settings.storeName?.trim() || "YourShop";

    // Update header logo
    const headerLogo = document.getElementById("store-logo-text");

    if (headerLogo) {
        headerLogo.textContent = storeName;
    }

    // Update footer logo
    const footerLogo = document.getElementById("footer-store-name");

    if (footerLogo) {
        footerLogo.textContent = storeName + ".";
    }

    // Update browser title
    document.title = document.title.replace("YourShop", storeName);

});
