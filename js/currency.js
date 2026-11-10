// ==========================================
// YOURSHOP - CURRENCY SYSTEM
// ==========================================

(function () {

    const SETTINGS_KEY = "yourshop-settings";

    const currencySymbols = {
        USD: "$",
        PKR: "Rs.",
        GBP: "£",
        EUR: "€"
    };

    function getStoreCurrency() {
        try {
            const settings = JSON.parse(
                localStorage.getItem(SETTINGS_KEY)
            ) || {};

            return currencySymbols[settings.storeCurrency]
                ? settings.storeCurrency
                : "USD";

        } catch (error) {
            return "USD";
        }
    }

    window.formatPrice = function (amount) {

        const currency = getStoreCurrency();
        const symbol = currencySymbols[currency];
        const price = Number(amount) || 0;

        return `${symbol} ${price.toFixed(2)}`;
    };

})();

