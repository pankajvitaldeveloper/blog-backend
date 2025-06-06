const router = require('express').Router();
const { addBlogFavorite, removeBlogFavorite } = require('../controllers/blogController');
const { recentBlogs } = require('../controllers/blogController');
const {verifyToken, authorizeRole} = require('../middlewares/authMiddleware');
const {
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

router.get('/blogs', getAllBlogs);
router.get('/blog/:id', getBlogById); 
router.put('/blog/:id', updateBlog);
router.delete('/blog/:id', deleteBlog); 
router.get('/recent-blogs', recentBlogs)
// router.post('/add-favorite/:id', verifyToken, authorizeRole("user") ,addBlogFavorite); // Add blog to favorites
// router.post('/remove-favorite/:id', verifyToken, authorizeRole('user', removeBlogFavorite))

router.post('/blog/add-favorite/:id', verifyToken, authorizeRole("user"), addBlogFavorite);
router.post('/blog/remove-favorite/:id', verifyToken, authorizeRole("user"), removeBlogFavorite);

module.exports = router;