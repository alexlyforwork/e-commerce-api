const {isAuthenticated, isAdmin} = require('../middleware/auth.js');
const router = require('express').Router();
const {connectDB} = require('../config/db.js');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const dotenv = require('dotenv');

dotenv.config();

const db = connectDB();

//View items in cart
router.get('/view', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('SELECT products.title, cart.quantity, cart.quantity * products.price as price FROM cart INNER JOIN products ON cart.product_id = products.id WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: 'No items found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart items', error: error.message });
    }
})

//Add item to cart
router.post('/add', isAuthenticated, async (req,res) => {
    console.log(req.body);
    const userId = req.user.id;
    const productId = req.body.product_id;
    const quantity = req.body.quantity || 1; 
    try {
        const result = await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', [userId, productId, quantity]);
        if (result.rows.length > 0) {
            res.status(201).json({ message: 'Item added to cart successfully', item: result.rows[0] });
        } else {
            res.status(500).json({ message: 'Error adding item to cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
})

//Edit item quantity by id
router.put('/edit/:id', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const newQuantity = req.body.quantity;

    try {
        const result = await db.query('UPDATE cart SET quantity = $1 WHERE product_id = $2 AND user_id = $3 RETURNING *', [newQuantity, cartItemId, userId]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Cart item updated successfully', item: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Cart item not found or not owned by user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
})

//Delete item from cart
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    try {
        const result = await db.query('DELETE FROM cart WHERE product_id = $1 AND user_id = $2 RETURNING *', [cartItemId, userId]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Cart item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Cart item not found or not owned by user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting cart item', error: error.message });
    }
})

//Clear cart
router.delete('/clear', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('DELETE FROM cart WHERE user_id = $1 RETURNING *', [userId]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Cart cleared successfully' });
        } else {
            res.status(404).json({ message: 'No items found in cart to clear' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
})

//Checkout cart
router.post('/checkout', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
       const cartItems = await db.query('SELECT products.title, cart.quantity, products.price FROM cart INNER JOIN products ON cart.product_id = products.id WHERE user_id = $1', [userId]);
        if (cartItems.rows.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        const lineItems = cartItems.rows.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                },
                unit_amount: item.price * 100, // Convert to cents
            },
            quantity: item.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/cart/success`,
            cancel_url: `${req.protocol}://${req.get('host')}/cart/cancel`,
        });
        res.status(200).json({ url: session.url });    
    } catch (error) {
        res.status(500).json({ message: 'Error during checkout', error: error.message });
    }
})

//Success route
router.get('/success', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Checkout successful, thank you for your purchase!' });
});

//Cancel route
router.get('/cancel', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Checkout cancelled, your cart is still intact.' });
});
module.exports = {
  router,
}