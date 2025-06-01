const router = require("express").Router();
const {adminlogin, adminlogout, adminBlog} = require("../controllers/adminController");

const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");
// Importing image upload middleware
const { 
    upload, 
    uploadToCloudinary, 
    handleUploadError,
} = require('../middlewares/imageUpload');


router.post("/adminlogin", adminlogin);
router.post("/adminlogout", adminlogout);


//add Blog api from admin
router.post(
    "/add-blog",
    verifyToken,
    authorizeRole("admin"), // Only admin can add blogs
    upload.single('image'), 
    // handleUploadError,
    // uploadToCloudinary,
    adminBlog
);





module.exports = router;