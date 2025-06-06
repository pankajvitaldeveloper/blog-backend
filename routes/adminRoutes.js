const router = require("express").Router();
const {adminlogin, adminlogout, adminBlog} = require("../controllers/adminController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");
const { 
    upload, 
    uploadToCloudinary, 
    handleUploadError,
} = require('../middlewares/imageUpload');

router.post("/adminlogin", adminlogin);
router.post("/adminlogout", adminlogout);

// Add debug middleware to check Cloudinary result
const debugMiddleware = (req, res, next) => {
    console.log('Cloudinary Result:', req.cloudinaryResult);
    next();
};

// Updated add-blog route with debug middleware
router.post(
    "/add-blog",
    verifyToken,
    authorizeRole("admin"),
    upload.single('image'), 
    handleUploadError,
    uploadToCloudinary,
    debugMiddleware, // Add debug middleware
    adminBlog
);

module.exports = router;