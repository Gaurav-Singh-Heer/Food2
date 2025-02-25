// Loading and Using Modules Required
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const { upload } = require('./config/cloudinary.js');
const path = require("path");

// Initialize Express App
const app = express();


// Set View Engine and Middleware
app.set("view engine", "ejs");
// app.set("views", path.resolve("./views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

// Database Connection
mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log('MongoDB connected'))

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  user_name: String,
  user_address: String,
  user_email: String,
  user_password: String,
  user_mobileno: String,
});

const menuSchema = new mongoose.Schema({
  item_id: String,
  item_type: String,
  item_category: String,
  item_serving: String,
  item_calories: Number,
  item_name: String,
  item_img: String,
  item_price: Number,
  item_rating: Number,
});

const orderSchema = new mongoose.Schema({
  order_id: String,
  user_id: mongoose.Schema.Types.ObjectId,
  item_id: String,
  quantity: Number,
  price: Number,
  datetime: Date,
});

const adminSchema = new mongoose.Schema({
  admin_name: String,
  admin_email: String,
  admin_password: String,
});

// MongoDB Models
const User = mongoose.model("User", userSchema);
const Menu = mongoose.model("Menu", menuSchema);
const Order = mongoose.model("Order", orderSchema);
const Admin = mongoose.model("Admin", adminSchema);

// Global Variables
let citemdetails = [];
let item_in_cart = 0;

// Function to fetch details of items in the cart
async function getItemDetails(citems) {
  citemdetails = await Menu.find({ item_id: { $in: citems } });
  item_in_cart = citems.length;
}

/*****************************  User-End Portal ***************************/

// Routes for User Sign-up, Sign-in, Home Page, Cart, Checkout, Order Confirmation, My Orders, and Settings
app.get("/", renderIndexPage);
app.get("/signup", renderSignUpPage);
app.post("/signup", signUpUser);
app.get("/signin", renderSignInPage);
app.post("/signin", signInUser);
app.get("/homepage", renderHomePage);
app.get("/cart", renderCart);
app.post("/cart", updateCart);
app.post("/checkout", checkout);
app.get("/confirmation", renderConfirmationPage);
app.get("/myorders", renderMyOrdersPage);
app.get("/settings", renderSettingsPage);
app.post("/address", updateAddress);

// Admin Routes
app.get("/admin_signup", renderAdminSignUpPage);
app.post("/admin_signup", adminSignUp);
app.get("/admin_signin", renderAdminSignInPage);
app.post("/admin_signin", adminSignIn);
app.get("/adminHomepage", renderAdminHomepage);
app.get("/admin_addFood", renderAddFoodPage);
app.post("/admin_addFood", addFood);
app.get("/admin_view_dispatch_orders", renderViewDispatchOrdersPage);
app.post("/admin_view_dispatch_orders", dispatchOrders);
app.get("/admin_change_price", renderChangePricePage);
app.post("/admin_change_price", changePrice);
app.get("/logout", logout);

// Route Handlers

// Index Page
function renderIndexPage(req, res) {
  res.render("index");
}

// User Sign-up
function renderSignUpPage(req, res) {
  res.render("signup");
}

async function signUpUser(req, res) {
  const { name, address, email, mobile, password } = req.body;
  try {
    const newUser = new User({
      user_name: name,
      user_address: address,
      user_email: email,
      user_password: password,
      user_mobileno: mobile,
    });
    await newUser.save();
    res.render("signin");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

// User Sign-in
function renderSignInPage(req, res) {
  res.render("signin");
}

async function signInUser(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ user_email: email });
  if (!user || user.user_password !== password) {
    return res.render("signin");
  }
  res.cookie("cookuid", user._id);
  res.cookie("cookuname", user.user_name);
  res.redirect("/homepage");
}

// Render Home Page
async function renderHomePage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const user = await User.findById(userId);
  if (!user || user.user_name !== userName) return res.render("signin");

  const items = await Menu.find();
  res.render("homepage", { username: userName, userid: userId, items });
}

// Render Cart Page
async function renderCart(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const user = await User.findById(userId);
  if (!user || user.user_name !== userName) return res.render("signin");

  res.render("cart", { username: userName, userid: userId, items: citemdetails, item_count: item_in_cart });
}

// Update Cart
async function updateCart(req, res) {
  const cartItems = req.body.cart;
  await getItemDetails(cartItems); // Fetch item details using the new function
  res.redirect("/cart"); // Redirect to the cart page after updating
}

// Checkout
async function checkout(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const user = await User.findById(userId);
  if (!user || user.user_name !== userName) return res.render("signin");

  const { itemid, quantity, subprice } = req.body;
  const currDate = new Date();

  try {
    if (Array.isArray(itemid)) {
      for (let i = 0; i < itemid.length; i++) {
        if (quantity[i] != 0) {
          await new Order({
            order_id: uuidv4(),
            user_id: userId,
            item_id: itemid[i],
            quantity: quantity[i],
            price: subprice[i] * quantity[i],
            datetime: currDate,
          }).save();
        }
      }
    } else {
      if (quantity != 0) {
        await new Order({
          order_id: uuidv4(),
          user_id: userId,
          item_id: itemid,
          quantity,
          price: subprice * quantity,
          datetime: currDate,
        }).save();
      }
    }

    citemdetails = [];
    item_in_cart = 0;
    res.render("confirmation", { username: userName, userid: userId });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

// Render Confirmation Page
async function renderConfirmationPage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  res.render("confirmation", { username: userName, userid: userId });
}

// Render My Orders Page
async function renderMyOrdersPage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const user = await User.findById(userId);
  if (!user || user.user_name !== userName) return res.render("signin");

  const orders = await Order.find({ user_id: userId }).sort({ datetime: -1 }).populate("item_id");
  res.render("myorders", { userDetails: user, items: orders, item_count: item_in_cart });
}

// Render Settings Page
async function renderSettingsPage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const user = await User.findById(userId);
  if (!user || user.user_name !== userName) return res.render("signin");

  res.render("settings", { username: userName, userid: userId, item_count: item_in_cart });
}

// Update Address
async function updateAddress(req, res) {
  const userId = req.cookies.cookuid;
  const address = req.body.address;
  await User.findByIdAndUpdate(userId, { user_address: address });
  res.redirect("/settings");
}

// Function to render Admin Signup Page
async function renderAdminSignUpPage(req, res) {
  try {
    res.render("admin_signup");
  } catch (error) {
    console.error("Error rendering signup page:", error);
    res.status(500).send("Error loading page");
  }
}

// Function to handle Admin Signup
async function adminSignUp(req, res) {
  const { admin_name, admin_email, admin_password } = req.body;
  console.log(admin_email)
  try {
    const existingAdmin = await Admin.findOne({ admin_email });
    if (existingAdmin) {
      return res.status(400).send("Admin already exists");
    }

    const newAdmin = new Admin({
      admin_name,
      admin_email,
      admin_password: admin_password,
    });

    await newAdmin.save();
    res.redirect("/admin_signin"); // Redirect to admin signin page
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).send("Server error");
  }
}

// Admin Sign-in
function renderAdminSignInPage(req, res) {
  res.render("admin_signin");
}

async function adminSignIn(req, res) {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ admin_email: email });
  if (!admin || admin.admin_password !== password) {
    return res.render("admin_signin");
  }
  res.cookie("cookuid", admin._id);
  res.cookie("cookuname", admin.admin_name);
  console.log("yha phasA ")
  res.redirect("/adminHomepage");
}

// Admin Homepage
async function renderAdminHomepage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const admin = await Admin.findById(userId);
  if (!admin || admin.admin_name !== userName) return res.render("admin_signin");

  res.render("adminHomepage", { username: userName, userid: userId });
}

// Render Add Food Page
function renderAddFoodPage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  res.render("admin_addFood", { username: userName, userid: userId });
}
/*
async function addFood(req, res) {
  try {
    upload.single("FoodImg")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ success: false, message: "Multer error: " + err.message });
      }

      if (!req.file) {
        return res.status(400).send("Image was not uploaded");
      }

      // Upload to Cloudinary manually
      const result = await cloudinary.uploader.upload(req.file.path);

      const { FoodName, FoodType, FoodCategory, FoodServing, FoodCalories, FoodPrice, FoodRating } = req.body;

      // Save food details to database
      await new Menu({
        item_name: FoodName,
        item_type: FoodType,
        item_category: FoodCategory,
        item_serving: FoodServing,
        item_calories: FoodCalories,
        item_price: FoodPrice,
        item_rating: FoodRating,
        item_img: result.secure_url, // Cloudinary URL
      }).save();

      res.redirect("/admin_addFood");
    });

  } catch (err) {
    console.error("Error in addFood:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
*/

// Add Food 

async function addFood(req, res) {
  const { FoodName, FoodType, FoodCategory, FoodServing, FoodCalories, FoodPrice, FoodRating } = req.body;
  if (!req.files) {
    return res.status(400).send("Image was not uploaded");
  }
  const fimage = req.files.FoodImg;
  const fimage_name = fimage.name;
  if (fimage.mimetype == "image/jpeg" || fimage.mimetype == "image/png") {
    fimage.mv("public/images/dish/" + fimage_name, async function (err) {
      if (err) {
        return res.status(500).send(err);
      }
      await new Menu({
        item_name: FoodName,
        item_type: FoodType,
        item_category: FoodCategory,
        item_serving: FoodServing,
        item_calories: FoodCalories,
        item_price: FoodPrice,
        item_rating: FoodRating,
        item_img: fimage_name,
      }).save();
      res.redirect("/admin_addFood");
    });
  } else {
    res.render("admin_addFood");
  }
}


// Render View Dispatch Orders Page
async function renderViewDispatchOrdersPage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const admin = await Admin.findById(userId);
  if (!admin || admin.admin_name !== userName) return res.render("admin_signin");

  const orders = await Order.find().sort({ datetime: -1 });
  res.render("admin_view_dispatch_orders", { username: userName, orders });
}

// Dispatch Orders
async function dispatchOrders(req, res) {
  const orderIds = req.body.order_id_s;
  const uniqueOrderIds = [...new Set(orderIds)];
  for (const orderId of uniqueOrderIds) {
    const order = await Order.findById(orderId);
    if (order) {
      // Logic to dispatch the order
      // For example, you might want to move it to a dispatched orders collection
      await Order.findByIdAndDelete(orderId); // Remove from orders
    }
  }
  res.redirect("/admin_view_dispatch_orders");
}

// Render Change Price Page
async function renderChangePricePage(req, res) {
  const userId = req.cookies.cookuid;
  const userName = req.cookies.cookuname;
  const admin = await Admin.findById(userId);
  if (!admin || admin.admin_name !== userName) return res.render("admin_signin");

  const menuItems = await Menu.find();
  res.render("admin_change_price", { username: userName, items: menuItems });
}

// Change Price
async function changePrice(req, res) {
  const { item_name, new_food_price } = req.body;
  await Menu.findOneAndUpdate({ item_name }, { price: new_food_price });
  res.redirect("/admin_change_price");
}

// Logout
function logout(req, res) {
  res.clearCookie("cookuid");
  res.clearCookie("cookuname");
  res.redirect("/signin");
}

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));