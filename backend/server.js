
const express = require("express");
const db = require("./db");
const cors = require("cors");
const verifyAdminToken = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(cors());

// ADMIN AUTHENTICATION ROUTES
app.use("/api/admin", require("./admin-auth"));

// ============================================
// HOME ROUTE
// ============================================

app.get("/", (req, res) => {
    res.send("Welcome to YourShop! Backend is running.");
});

// ============================================
// ABOUT ROUTE
// ============================================

app.get("/api/about", (req, res) => {
    res.json({
        store: "YourShop",
        message: "YourShop Backend API",
        status: "Running"
    });
});

// ============================================
// GET ALL PRODUCTS - PUBLIC
// ============================================

app.get("/api/products", async (req, res) => {
    try {
        // 1. Get filters from URL
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder,
            page = 1,
            limit = 20
        } = req.query;

        // 2. Build SQL conditions safely
        const conditions = [];
        const values = [];

        if (search && search.trim()) {
            conditions.push("name LIKE ?");
            values.push(`%${search.trim()}%`);
        }

        if (category && category !== "all") {
            conditions.push("category = ?");
            values.push(category);
        }

        if (minPrice !== undefined && minPrice !== "") {
            const min = Number(minPrice);

            if (!Number.isFinite(min) || min < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid minimum price."
                });
            }

            conditions.push("price >= ?");
            values.push(min);
        }

        if (maxPrice !== undefined && maxPrice !== "") {
            const max = Number(maxPrice);

            if (!Number.isFinite(max) || max < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid maximum price."
                });
            }

            conditions.push("price <= ?");
            values.push(max);
        }

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            minPrice !== "" &&
            maxPrice !== "" &&
            Number(minPrice) > Number(maxPrice)
        ) {
            return res.status(400).json({
                success: false,
                message: "Minimum price cannot exceed maximum price."
            });
        }

        const whereSQL = conditions.length
            ? "WHERE " + conditions.join(" AND ")
            : "";

        // 3. Validate sorting
        const allowedSortColumns = [
            "id",
            "name",
            "price",
            "rating",
            "stock",
            "created_at"
        ];

        const selectedSort = allowedSortColumns.includes(sortBy)
            ? sortBy
            : "id";

        const selectedOrder =
            String(sortOrder).toLowerCase() === "asc"
                ? "ASC"
                : "DESC";

        // 4. Validate pagination
        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const perPage = Math.min(
            100,
            Math.max(1, parseInt(limit, 10) || 20)
        );

        const offset = (currentPage - 1) * perPage;

        // 5. Count matching products
        const [countResult] = await db.query(
            `SELECT COUNT(*) AS total FROM products ${whereSQL}`,
            values
        );

        const totalProducts = Number(countResult[0].total);
        const totalPages = Math.ceil(totalProducts / perPage);

        // 6. Fetch matching products
        const [products] = await db.query(
            `SELECT * FROM products
             ${whereSQL}
             ORDER BY ${selectedSort} ${selectedOrder}
             LIMIT ? OFFSET ?`,
            [...values, perPage, offset]
        );

        // 7. Send response
        res.json({
            success: true,
            totalProducts,
            currentPage,
            perPage,
            totalPages,
            products
        });

    } catch (error) {
        console.error("Get products error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch products."
        });
    }
});

// ============================================
// GET ONE PRODUCT - PUBLIC
// ============================================

app.get("/api/products/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const [products] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            product: products[0]
        });

    } catch (error) {
        console.error("Get product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch product."
        });
    }
});

// ============================================
// ADD PRODUCT - ADMIN ONLY
// ============================================

app.post("/api/products", verifyAdminToken, async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            discount = 0,
            rating = 0,
            stock = 0,
            image = null
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof category !== "string" ||
            !category.trim() ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid name, category, and price."
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (
                name,
                category,
                price,
                discount,
                rating,
                stock,
                image
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                category.trim(),
                Number(price),
                Number(discount),
                Number(rating),
                Number(stock),
                image
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product added successfully!",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Add product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to add product."
        });
    }
});

// ============================================
// UPDATE PRODUCT - ADMIN ONLY
// ============================================

app.put("/api/products/:id", verifyAdminToken, async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const {
            name,
            category,
            price,
            discount = 0,
            rating = 0,
            stock = 0,
            image = null,
            images
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof category !== "string" ||
            !category.trim() ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0 ||
            !Number.isFinite(Number(discount)) ||
            Number(discount) < 0 ||
            Number(discount) > 100 ||
            !Number.isFinite(Number(rating)) ||
            Number(rating) < 0 ||
            Number(rating) > 5 ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0 ||
            (images !== undefined && !Array.isArray(images))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product information."
            });
        }

        const [existing] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [productId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const oldProduct = existing[0];

        const updatedImage = image || oldProduct.image;

        const updatedImages = images !== undefined
            ? images
            : oldProduct.images;

        await db.query(
            `UPDATE products
             SET name = ?,
                 category = ?,
                 price = ?,
                 discount = ?,
                 rating = ?,
                 stock = ?,
                 image = ?,
                 images = ?
             WHERE id = ?`,
            [
                name.trim(),
                category.trim().toLowerCase(),
                Number(price),
                Number(discount),
                Number(rating),
                Number(stock),
                updatedImage,
                JSON.stringify(updatedImages || []),
                productId
            ]
        );

        res.json({
            success: true,
            message: "Product updated successfully!",
            productId
        });

    } catch (error) {
        console.error("Update product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update product."
        });
    }
});

// ============================================
// DELETE PRODUCT - ADMIN ONLY
// ============================================

app.delete("/api/products/:id", verifyAdminToken, async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully!",
            productId
        });

    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "This product belongs to an existing order and cannot be deleted."
            });
        }

        console.error("Delete product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete product."
        });
    }
});

// ============================================
// IMPORT PRODUCTS - ADMIN ONLY
// ============================================

app.post("/api/products/import", verifyAdminToken, async (req, res) => {
    let connection;

    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid products array."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        for (const product of products) {
            const {
                id,
                name,
                category,
                price,
                discount = 0,
                rating = 0,
                stock = 0,
                image = null,
                images = [],
                soldCount = 0
            } = product;

            if (
                !Number.isInteger(Number(id)) ||
                Number(id) <= 0 ||
                typeof name !== "string" ||
                !name.trim() ||
                typeof category !== "string" ||
                !category.trim() ||
                !Number.isFinite(Number(price)) ||
                Number(price) <= 0 ||
                !Array.isArray(images)
            ) {
                throw new Error("Invalid product data: " + name);
            }

            await connection.query(
                `INSERT INTO products
                (
                    id,
                    name,
                    category,
                    price,
                    discount,
                    rating,
                    stock,
                    image,
                    images,
                    sold_count
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    category = VALUES(category),
                    price = VALUES(price),
                    discount = VALUES(discount),
                    rating = VALUES(rating),
                    stock = VALUES(stock),
                    image = VALUES(image),
                    images = VALUES(images),
                    sold_count = VALUES(sold_count)`,
                [
                    Number(id),
                    name.trim(),
                    category.trim().toLowerCase(),
                    Number(price),
                    Number(discount),
                    Number(rating),
                    Number(stock),
                    image,
                    JSON.stringify(images),
                    Number(soldCount)
                ]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: "Products imported successfully!",
            totalImported: products.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Product import error:", error.message);

        res.status(500).json({
            success: false,
            message: "Product import failed. No changes were saved."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// ============================================
// GET ALL ORDERS - ADMIN ONLY
// ============================================

app.get("/api/orders", verifyAdminToken, async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT *
             FROM orders
             ORDER BY created_at DESC`
        );

        const [orderItems] = await db.query(
            `SELECT *
             FROM order_items
             ORDER BY id ASC`
        );

        const result = orders.map(order => ({
            ...order,
            items: orderItems.filter(
                item =>
                    Number(item.order_id) === Number(order.id)
            )
        }));

        res.json({
            success: true,
            totalOrders: result.length,
            orders: result
        });

    } catch (error) {
        console.error("Get orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve orders."
        });
    }
});

// ============================================
// CREATE CUSTOMER ORDER - PUBLIC CHECKOUT
// ============================================

app.post("/api/orders", async (req, res) => {
    let connection;

    try {
        const {
            customer,
            items,
            shipping,
            discount
        } = req.body;

        if (
            !customer ||
            typeof customer.name !== "string" ||
            !customer.name.trim() ||
            typeof customer.email !== "string" ||
            !customer.email.trim() ||
            typeof customer.phone !== "string" ||
            !customer.phone.trim() ||
            typeof customer.address !== "string" ||
            !customer.address.trim() ||
            typeof customer.city !== "string" ||
            !customer.city.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid customer information is required."
            });
        }

        if (
            !["cash", "cod"].includes(
                String(customer.paymentMethod || "").toLowerCase()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Only Cash on Delivery is available."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your order must contain products."
            });
        }

        const shippingCost = Number(shipping);
        const requestedDiscount = Number(discount || 0);

        if (
            !Number.isFinite(shippingCost) ||
            shippingCost < 0 ||
            !Number.isFinite(requestedDiscount) ||
            requestedDiscount < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipping or discount amount."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        let subtotal = 0;

        const verifiedItems = [];

        // VERIFY PRODUCTS AND STOCK
        for (const item of items) {
            const productId = Number(item.id);
            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(productId) ||
                productId <= 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                throw new Error("Invalid product or quantity.");
            }

            const [products] = await connection.query(
                "SELECT * FROM products WHERE id = ? FOR UPDATE",
                [productId]
            );

            if (products.length === 0) {
                throw new Error(
                    "A product in your cart was not found."
                );
            }

            const product = products[0];

            if (quantity > Number(product.stock)) {
                throw new Error(
                    `${product.name} has only ${product.stock} units available.`
                );
            }

            const unitPrice =
                Number(product.price) *
                (1 - Number(product.discount) / 100);

            const itemSubtotal = unitPrice * quantity;

            subtotal += itemSubtotal;

            verifiedItems.push({
                id: product.id,
                name: product.name,
                quantity,
                price: unitPrice,
                subtotal: itemSubtotal
            });
        }

        // CALCULATE TOTAL
        const finalDiscount = Math.min(
            subtotal,
            requestedDiscount
        );

        const total = Math.max(
            0,
            subtotal + shippingCost - finalDiscount
        );

        // SAVE ORDER
        const [orderResult] = await connection.query(
            `INSERT INTO orders
            (
                customer_name,
                email,
                phone,
                address,
                city,
                postal_code,
                payment_method,
                subtotal,
                shipping_cost,
                total_amount,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer.name.trim(),
                customer.email.trim(),
                customer.phone.trim(),
                customer.address.trim(),
                customer.city.trim(),
                customer.postalCode || null,
                "Cash on Delivery",
                subtotal,
                shippingCost,
                total,
                "Pending"
            ]
        );

        const orderId = orderResult.insertId;

        // SAVE ORDER ITEMS AND UPDATE STOCK
        for (const item of verifiedItems) {
            await connection.query(
                `INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    product_name,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.id,
                    item.name,
                    item.quantity,
                    item.price,
                    item.subtotal
                ]
            );

            await connection.query(
                `UPDATE products
                 SET stock = stock - ?,
                     sold_count = sold_count + ?
                 WHERE id = ?`,
                [
                    item.quantity,
                    item.quantity,
                    item.id
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Order saved successfully!",
            orderId,
            orderCode: "YS" + orderId,
            subtotal,
            shipping: shippingCost,
            discount: finalDiscount,
            total
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Order rollback error:",
                    rollbackError.message
                );
            }
        }

        console.error("Order creation error:", error.message);

        const statusCode =
            error.message === "Invalid product or quantity." ||
            error.message === "A product in your cart was not found." ||
            error.message.includes("has only")
                ? 400
                : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || "Unable to create order."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// ============================================
// UPDATE ORDER STATUS - ADMIN ONLY
// ============================================

app.patch("/api/orders/:id/status", verifyAdminToken, async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status.toLowerCase())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        const newStatus = status.toLowerCase();

        const [result] = await db.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [newStatus, orderId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        res.json({
            success: true,
            message: "Order status updated successfully!",
            orderId,
            status: newStatus
        });

    } catch (error) {
        console.error("Update order status error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update order status."
        });
    }
});

// ============================================
// HANDLE UNKNOWN ROUTES
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log("YourShop Backend Server is running!");
    console.log(`Visit: http://localhost:${PORT}`);
});
