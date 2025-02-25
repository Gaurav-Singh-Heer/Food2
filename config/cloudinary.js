const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Set up Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "FoodImages", // Change to your desired folder in Cloudinary
        format: async (req, file) => file.mimetype.split("/")[1], // Use original file format (jpg, png, etc.)
        public_id: (req, file) => file.originalname.split('.')[0], 
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };