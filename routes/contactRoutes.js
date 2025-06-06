const router = require('express').Router();
const { submitContact, getAllContacts } = require('../controllers/contactController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Public route for submitting contact form
router.post('/contact', submitContact);

// Admin only route for viewing contacts
router.get('/all', verifyToken, authorizeRole('admin'), getAllContacts);

module.exports = router;