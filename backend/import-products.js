
async function importProducts() {
    try {
        const response = await fetch("http://localhost:3000/api/products/import", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                products: products.map(product => ({
                    ...product,
                    soldCount: product.soldCount || 0
                }))
            })
        });

        const result = await response.json();

        console.log("Import result:", result);

        document.body.innerHTML = `
            <h2>${result.message}</h2>
            <p>Products imported: ${result.totalImported || 0}</p>
        `;

    } catch (error) {
        console.error("Import failed:", error);
        document.body.innerHTML = `
            <h2>Import failed</h2>
            <p>${error.message}</p>
        `;
    }
}

importProducts();
