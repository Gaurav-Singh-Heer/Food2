# Deployement Not working roght Now
## 🍽️ Food Menu Admin Panel (Express.js + Ejs + MongoDB + Cloudinary)

This is a an application that allows admins to **upload food items with images to Cloudinary** and store food details in **MongoDB**.

---

## 🚀 Features
- Upload food images to **Cloudinary** using `multer-storage-cloudinary`
- Store food details (`name`, `price`, `rating`, `calories`, etc.) in **MongoDB**
- Admin panel to add food items (`EJS` for templating)
- Uses `express`, `mongoose`, `dotenv`, `multer`, and `cookie-parser`

---

## 🛠️ **Installation & Setup**
### 1️⃣ **Clone Repository**
```sh
git clone <your-repo-url>
cd <your-project-folder>
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

### 3️⃣ **Set Up Environment Variables**
Create a `.env` file inside the project and add your credentials:
```env
PORT=3000
MONGO_URI=mongodb+srv://<your-mongodb-connection-string>
CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUD_API_KEY=<your-cloudinary-api-key>
CLOUD_API_SECRET=<your-cloudinary-api-secret>
```

---

## ▶️ **Run the Project**
Start the development server:
```sh
npm run dev
```
Your app should now be running on:  
🔗 **http://localhost:3000**

---

## 📂 **Project Structure**
```
📆 your-project-folder
 ├📛 config
 ┃ └📝 cloudinary.js   # Cloudinary configuration
 ├📛 views
 ┃ └📝 admin_addFood.ejs  # EJS template for adding food items
 ├📛 models
 ┃ └📝 menu.js        # Mongoose schema for food menu
 ├📝 .env            # Environment variables (DO NOT SHARE)
 ├📝 server.js       # Main Express server file
 ├📝 package.json    # Project dependencies
 └📝 README.md       # Project documentation (this file)
```



# HIGHLIGHTS

Home Page :-

![](1.jpg)  
![](2.jpg)  
![](3.jpg)  
![](4.jpg)  
![](5.jpg)  

Sign in:-
![](6.jpg)  
![](7.jpg)  

Admin Page:-
![](8.jpg)  
![](9.jpg)  
![](10.jpg)  
![](11.jpg)  

Admin Adding Item to Menu:-(Food Item with Filter of Dessert)
![](12.jpg)  

User Sign in:-
![](15.jpg)  

image shown in menu:-
![](13.jpg)  
![](14.jpg)  

Similarly Added Items in Menu :-
![](16.jpg)  
![](17.jpg)  
![](18.jpg)  
image[Similarly Spoongy Rasgulla in Dessert]
image[Added Dosa in Breakfast.jpg]
image[All Items shown in All Filter.jpg]


