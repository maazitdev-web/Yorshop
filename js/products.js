
// ============================================
// YOURSHOP - PRODUCT DATABASE
// ============================================

const products = [

    // 1. SMARTPHONES
    {
        id: 1,
        name: "iPhone 15 Pro",
        category: "smartphones",
        price: 899.99,
        discount: 10,
        rating: 4.9,
        stock: 5,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
        images: [
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600"
        ]
    },
    {
        id: 2,
        name: "Samsung Galaxy S24",
        category: "smartphones",
        price: 799.99,
        discount: 15,
        rating: 4.8,
        stock: 10,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
        images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600"
        ]
    },

    // 2. HEADPHONES
    {
        id: 3,
        name: "Sony Wireless Headphones",
        category: "headphones",
        price: 149.99,
        discount: 20,
        rating: 4.8,
        stock: 8,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"
        ]
    },
    {
        id: 4,
        name: "Premium Bluetooth Headphones",
        category: "headphones",
        price: 89.99,
        discount: 10,
        rating: 4.6,
        stock: 12,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
        images: [
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"
        ]
    },

    // 3. LAPTOPS
    {
        id: 5,
        name: "Apple MacBook",
        category: "laptops",
        price: 1299.99,
        discount: 12,
        rating: 4.9,
        stock: 7,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
            "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600"
        ]
    },
    {
        id: 6,
        name: "Modern Laptop",
        category: "laptops",
        price: 899.99,
        discount: 15,
        rating: 4.7,
        stock: 5,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        images: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600",
            "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600"
        ]
    },

    // 4. SMART WATCHES
    {
        id: 7,
        name: "Apple Smart Watch",
        category: "smart-watches",
        price: 299.99,
        discount: 10,
        rating: 4.8,
        stock: 10,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600",
            "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600",
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600"
        ]
    },
    {
        id: 8,
        name: "Fitness Smart Watch",
        category: "smart-watches",
        price: 119.99,
        discount: 18,
        rating: 4.5,
        stock: 15,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600",
        images: [
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
            "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600",
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600"
        ]
    },

    // 5. ACCESSORIES
    {
        id: 9,
        name: "Wireless Computer Mouse",
        category: "accessories",
        price: 29.99,
        discount: 10,
        rating: 4.5,
        stock: 20,
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
        images: [
            "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
            "https://images.unsplash.com/photo-1613141412501-9012977f1969?w=600"
        ]
    },
    {
        id: 10,
        name: "Modern Keyboard",
        category: "accessories",
        price: 49.99,
        discount: 15,
        rating: 4.6,
        stock: 15,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
        images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600",
            "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600",
            "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600"
        ]
    },

    // 6. GAMING
    {
        id: 11,
        name: "Gaming Controller",
        category: "gaming",
        price: 59.99,
        discount: 12,
        rating: 4.7,
        stock: 10,
        image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600",
        images: [
            "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600",
            "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600",
            "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600",
            "https://images.unsplash.com/photo-1603481546238-487240415921?w=600"
        ]
    },
    {
        id: 12,
        name: "Gaming Headset",
        category: "gaming",
        price: 79.99,
        discount: 20,
        rating: 4.8,
        stock: 8,
        image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600",
        images: [
            "https://images.unsplash.com/photo-1599669454699-248893623440?w=600",
            "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600",
            "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600"
        ]
    },

    // 7. CAMERAS
    {
        id: 13,
        name: "Professional Digital Camera",
        category: "cameras",
        price: 599.99,
        discount: 10,
        rating: 4.9,
        stock: 5,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
        images: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
            "https://images.unsplash.com/photo-1510127034890-1e589b88b6e8?w=600",
            "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?w=600"
        ]
    },
    {
        id: 14,
        name: "Compact Camera",
        category: "cameras",
        price: 399.99,
        discount: 15,
        rating: 4.6,
        stock: 10,
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
        images: [
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
            "https://images.unsplash.com/photo-1510127034890-1e589b88b6e8?w=600",
            "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?w=600"
        ]
    },

    // 8. HOME APPLIANCES
    {
        id: 15,
        name: "Modern Coffee Maker",
        category: "home-appliances",
        price: 89.99,
        discount: 10,
        rating: 4.5,
        stock: 15,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
        images: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600",
            "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600",
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"
        ]
    },
    {
        id: 16,
        name: "Kitchen Appliance",
        category: "home-appliances",
        price: 129.99,
        discount: 15,
        rating: 4.4,
        stock: 12,
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600",
        images: [
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600",
            "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=600",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",
            "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600"
        ]
    },

    // 9. MEN'S FASHION
    {
        id: 17,
        name: "Men's Casual Jacket",
        category: "mens-fashion",
        price: 69.99,
        discount: 20,
        rating: 4.6,
        stock: 15,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
        images: [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
            "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600",
            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600"
        ]
    },
    {
        id: 18,
        name: "Men's Casual Shoes",
        category: "mens-fashion",
        price: 79.99,
        discount: 15,
        rating: 4.7,
        stock: 10,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
            "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=600",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
            "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600"
        ]
    },

    // 10. WOMEN'S FASHION
    {
        id: 19,
        name: "Women's Fashion Outfit",
        category: "womens-fashion",
        price: 89.99,
        discount: 20,
        rating: 4.8,
        stock: 12,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600",
            "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600"
        ]
    },
    {
        id: 20,
        name: "Women's Handbag",
        category: "womens-fashion",
        price: 59.99,
        discount: 10,
        rating: 4.6,
        stock: 15,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
        ]
    }

];

// Make products available to main.js
console.log("YourShop products loaded:", products.length);


// ============================================
// DEMO SALES DATA FOR BEST SELLERS
// ============================================

const demoSales = {
    1: 245,
    2: 220,
    3: 190,
    4: 175,
    5: 160,
    6: 145,
    7: 135,
    8: 120,
    9: 110,
    10: 100,
    11: 95,
    12: 90,
    13: 85,
    14: 80,
    15: 75,
    16: 70,
    17: 65,
    18: 60,
    19: 55,
    20: 50
};

// Attach demo sales figures to products
products.forEach(product => {
    product.soldCount = demoSales[product.id] || 0;
});