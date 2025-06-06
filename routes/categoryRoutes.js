const router = require('express').Router();
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getCategoryBlogs
} = require('../controllers/categoryControllers');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Public routes
router.get('/categories', getAllCategories);
router.get('/category/:categoryId', getCategoryBlogs); // Changed to match the new code block

// Protected routes (admin only)
router.post('/category', verifyToken, authorizeRole('admin'), createCategory);
router.put('/category/:id', verifyToken, authorizeRole('admin'), updateCategory);
router.delete('/category/:id', verifyToken, authorizeRole('admin'), deleteCategory);

module.exports = router;