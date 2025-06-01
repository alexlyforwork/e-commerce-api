const {isAuthenticated, isAdmin} = require('../middleware/auth.js');
const router = require('express').Router();
const {connectDB} = require('../config/db.js');

const dotenv = require('dotenv');

dotenv.config();

const db = connectDB();

//View all products
router.get('/view', isAuthenticated, async (req,res) => {
    try {
        const result = await db.query('SELECT * FROM products');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }
})

//Add a new product
router.post('/add', isAuthenticated, isAdmin, async (req, res) => {
    console.log(req.body);
    const title = req.body.title
    const price = req.body.price
    try {
        const result = await db.query('INSERT INTO products (title, price) VALUES ($1, $2) RETURNING *', [title, price]);
        if (result.rows.length > 0) {
            res.status(201).json({ message: 'Product added successfully', product: result.rows[0] });
        } else {
            res.status(500).json({ message: 'Error adding product' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
})

//Delete a product
router.delete('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    const productId = req.params.id;
    try {
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Product deleted successfully', product: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
})

//Update a product
router.put('/update/:id', isAuthenticated, isAdmin, async (req, res) => {
    const productId = req.params.id;
    const title = req.body.title;
    const price = req.body.price;
    try {
        if (title === undefined && price === undefined) {
            return res.status(400).json({ message: 'Title and price are required' });
        }
        if (title !== undefined) {
            const updateTitle = await db.query('UPDATE products SET title = $1 WHERE id = $2 RETURNING *', [title, productId]);
        }
        if (price !== undefined) {
            const updatePrice = await db.query('UPDATE products SET price = $1 WHERE id = $2 RETURNING *', [price, productId]);
        }
        const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Product updated successfully', product: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
})

module.exports = {
  router,
}