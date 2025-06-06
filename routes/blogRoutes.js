const router = require('express').Router();
const { addBlogFavorite, removeBlogFavorite } = require('../controllers/blogController');
const { recentBlogs } = require('../controllers/blogController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const { 
    upload, 
    uploadToCloudinary, 
    handleUploadError,
} = require('../middlewares/imageUpload');
const {
    getAllBlogs,
    getBlogById,
    adminUpdateBlog,
    deleteBlog,
} = require('../controllers/blogController');

// Debug middleware
const debugMiddleware = (req, res, next) => {
    console.log('Update Request Body:', req.body);
    console.log('Cloudinary Result:', req.cloudinaryResult);
    next();
};

// Blog routes
router.get('/blogs', getAllBlogs);
router.get('/blog/:id', getBlogById);
router.put('/blog/:id', 
    verifyToken,
    authorizeRole("admin"),
    upload.single('image'),
    handleUploadError,
    uploadToCloudinary,
    debugMiddleware,
    adminUpdateBlog
);
router.delete('/blog/:id', deleteBlog);
router.get('/recent-blogs', recentBlogs);

// Favorite routes
router.post('/blog/add-favorite/:id', verifyToken, authorizeRole("user"), addBlogFavorite);
router.post('/blog/remove-favorite/:id', verifyToken, authorizeRole("user"), removeBlogFavorite);

module.exports = router;