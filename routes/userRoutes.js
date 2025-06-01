const router = require("express").Router();
const {
  register,
  login,
  logout,
  checkCookie,
  getProfileData,
  changePassword,
} = require("../controllers/userController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

// Importing image upload middleware
const { 
    upload, 
    uploadToCloudinary, 
    handleUploadError,
    deleteFromCloudinary, 
    updateAvatar
} = require('../middlewares/imageUpload');

// Protected route example
router.get("/protected-route", verifyToken, (req, res) => {
  // Access authenticated user data through req.user
  res.json({ message: "Protected data" });
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-cookie", checkCookie);




router.get(
  "/getprofiledata",
  verifyToken,
  authorizeRole("user"),// authrizerole middleware is used to authorize user role and check if user has the required role to access the route
  getProfileData
);

router.post("/changePassword", verifyToken, authorizeRole("user"), changePassword)

//image upload routes
router.post('/upload-image', 
    verifyToken,
    upload.single('image'), 
    handleUploadError,
    uploadToCloudinary,
    (req, res) => {
        res.status(200).json({
            success: true,
            data: req.cloudinaryResult
        });
    }
);

// update image route
router.post('/update-avatar',
    verifyToken,
    upload.single('image'),
    handleUploadError,
    uploadToCloudinary,
    updateAvatar
);

router.delete('/delete-image', deleteFromCloudinary);

module.exports = router;
