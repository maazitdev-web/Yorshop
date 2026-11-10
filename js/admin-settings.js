
// ==========================================
// YOURSHOP - ADMIN SETTINGS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // 1. STORAGE KEY
    // ======================================

    const SETTINGS_KEY = "yourshop-settings";

    // ======================================
    // 2. GET HTML ELEMENTS
    // ======================================

    const settingsForm = document.getElementById("store-settings-form");

    const storeName = document.getElementById("store-name");
    const storeEmail = document.getElementById("store-email");
    const storePhone = document.getElementById("store-phone");
    const storeCurrency = document.getElementById("store-currency");
    const storeAddress = document.getElementById("store-address");

    const adminName = document.getElementById("admin-name");
    const adminEmail = document.getElementById("admin-email");

    const storeAvailability = document.getElementById("store-availability");
    const newsletterEnabled = document.getElementById("newsletter-enabled");

    const message = document.getElementById("settings-message");

    if (!settingsForm) {
        console.error("Settings form was not found.");
        return;
    }

    // ======================================
    // 3. DEFAULT SETTINGS
    // ======================================

    const defaultSettings = {
        storeName: "YourShop",
        storeEmail: "",
        storePhone: "",
        storeCurrency: "USD",
        storeAddress: "",

        adminName: "Administrator",
        adminEmail: "",

        storeAvailability: true,
        newsletterEnabled: true
    };

    // ======================================
    // 4. LOAD SAVED SETTINGS
    // ======================================

    function getSettings() {
        try {
            const savedSettings = JSON.parse(
                localStorage.getItem(SETTINGS_KEY)
            );

            if (!savedSettings || typeof savedSettings !== "object") {
                return { ...defaultSettings };
            }

            return {
                ...defaultSettings,
                ...savedSettings
            };

        } catch (error) {
            console.error("Could not load settings:", error);
            return { ...defaultSettings };
        }
    }

    // ======================================
    // 5. DISPLAY SETTINGS
    // ======================================

    function displaySettings() {

        const settings = getSettings();

        storeName.value = settings.storeName;
        storeEmail.value = settings.storeEmail;
        storePhone.value = settings.storePhone;
        storeCurrency.value = settings.storeCurrency;
        storeAddress.value = settings.storeAddress;

        adminName.value = settings.adminName;
        adminEmail.value = settings.adminEmail;

        storeAvailability.checked = settings.storeAvailability;
        newsletterEnabled.checked = settings.newsletterEnabled;
    }

    // ======================================
    // 6. GET FORM VALUES
    // ======================================

    function getFormSettings() {

        return {
            storeName: storeName.value.trim(),
            storeEmail: storeEmail.value.trim(),
            storePhone: storePhone.value.trim(),
            storeCurrency: storeCurrency.value,
            storeAddress: storeAddress.value.trim(),

            adminName: adminName.value.trim(),
            adminEmail: adminEmail.value.trim(),

            storeAvailability: storeAvailability.checked,
            newsletterEnabled: newsletterEnabled.checked
        };
    }

    // ======================================
    // 7. SHOW MESSAGE
    // ======================================

    function showMessage(text, type) {

        message.textContent = text;
        message.className = type;

        window.setTimeout(() => {
            message.textContent = "";
            message.className = "";
        }, 3500);
    }

    // ======================================
    // 8. SAVE SETTINGS
    // ======================================

    settingsForm.addEventListener("submit", event => {

        event.preventDefault();

        const settings = getFormSettings();

        if (!settings.storeName) {
            showMessage("Please enter your store name.", "error");
            storeName.focus();
            return;
        }

        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            showMessage(
                "Settings saved successfully!",
                "success"
            );

            console.log("YourShop settings saved:", settings);

        } catch (error) {

            console.error("Could not save settings:", error);

            showMessage(
                "Unable to save settings. Check browser storage.",
                "error"
            );
        }
    });

    // ======================================
    // 9. RESET FORM
    // ======================================

    settingsForm.addEventListener("reset", () => {

        window.setTimeout(() => {

            displaySettings();

            if (message) {
                message.textContent = "";
                message.className = "";
            }

        }, 0);
    });

    // ======================================
    // 10. INITIALIZE
    // ======================================

    displaySettings();

    console.log("YourShop settings loaded successfully!");

});
