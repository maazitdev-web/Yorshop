
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware: Allow Express to read JSON data
app.use(express.json());

// Product data
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        price: 899.99,
        category: "Smartphones"
    },
    {
        id: 2,
        name: "Samsung Galaxy S24",
        price: 799.99,
        category: "Smartphones"
    },
    {
        id: 3,
        name: "Apple MacBook",
        price: 1299.99,
        category: "Laptops"
    }
];

// Homepage route
app.get("/", (req, res) => {
    res.send("Welcome to YourShop! Express server is running.");


    
});

// API information
app.get("/api/about", (req, res) => {
    res.json({
        store: "YourShop",
        message: "YourShop Backend API",
        status: "Running"
    });
});

// Get all products
app.get("/api/products", (req, res) => {
    res.json({
        totalProducts: products.length,
        products: products
    });
});

// Get one product by ID
app.get("/api/products/:id", (req, res) => {

    console.log("Individual product route reached!");

    const productId = Number(req.params.id);
    

    // Validate product ID
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid product ID."
        });
    }

// Create a new product
app.post("/api/products", (req, res) => {

    const { name, price, category } = req.body;

    if (!name || price === undefined || !category ||
        !Number.isFinite(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid name, price, and category."
        });
    }

    const newProduct = {
        id: Math.max(0, ...products.map(product => product.id)) + 1,
        name: name,
        price: Number(price),
        category: category
    };

    products.push(newProduct);

    res.status(201).json({
        success: true,
        message: "Product created successfully!",
        product: newProduct
    });
});

    // Find product
    const product = products.find(item => item.id === productId);

    // Handle missing product
    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    // Return product
    res.json({
        success: true,
        product: product
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

// Start server
app.listen(PORT, () => {
    console.log("YourShop Backend Server is running!");
    console.log(`Visit: http://localhost:${PORT}`);
});
