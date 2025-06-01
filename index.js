const express = require('express');
const app = express();
const {router : userRoutes} = require('./routes/user.js');
const {router : productRoutes} = require('./routes/product.js');
const {router : cartRoutes} = require('./routes/cart.js');
const dotenv = require('dotenv');
// const {connectDB} = require('./db.js');
// const db = connectDB();
const session = require('express-session');
const passport = require('./config/passport.js');

const port = 3000;

dotenv.config()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
  secret: process.env.secret_key,
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}))

app.use(passport.initialize());
app.use(passport.session());


app.use(express.json())
app.use('/user',userRoutes)
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});