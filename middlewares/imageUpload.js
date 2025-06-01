const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
// Import the User model for updating user data
const User = require('../models/userSchema'); // Add this import


// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG and GIF allowed.'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

const uploadToCloudinary = async (req, res, next) => {
    try {
        // console.log('Starting upload to Cloudinary...', req.file);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary
        const result = await uploadImage(req.file);
        // console.log('Cloudinary upload result:', result);
        
        // Add Cloudinary result to request object
        req.cloudinaryResult = {
            url: result.secure_url,
            publicId: result.public_id
        };

        // Clean up local file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting local file:', err);
        });

        // console.log('Upload successful, proceeding to next middleware');
        next();
    } catch (error) {
        console.error('Detailed upload error:', {
            error: error.message,
            stack: error.stack,
            file: req?.file
        });

        // Clean up local file on error
        if (req.file?.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }

        return res.status(500).json({
            success: false,
            message: `Upload failed: ${error.message}`
        });
    }
};
// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};


//update the image 
const updateAvatar = async (req, res) => {
    try {
        // console.log('Starting avatar update...', {
        //     user: req.user,
        //     cloudinaryResult: req.cloudinaryResult
        // });

        if (!req.user?.id) {
            console.error('Missing user ID');
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!req.cloudinaryResult?.url || !req.cloudinaryResult?.publicId) {
            console.error('Missing cloudinary result');
            return res.status(400).json({
                success: false,
                message: "Image upload data is missing"
            });
        }

        const userId = req.user.id;
        const { url, publicId } = req.cloudinaryResult;

        // Delete old avatar if exists
        const user = await User.findById(userId);
        // console.log('Found user:', user);

        if (user.avatar?.publicId && user.avatar.publicId !== 'default-avatar') {
            // console.log('Deleting old avatar:', user.avatar.publicId);
            await deleteImage(user.avatar.publicId);
        }

        // Update user with new avatar
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                avatar: { url, publicId }
            },
            { new: true }
        );

        // console.log('Updated user:', updatedUser);

        if (!updatedUser) {
            throw new Error('Failed to update user');
        }

        res.status(200).json({
            success: true,
            data: {
                url: updatedUser.avatar.url,
                publicId: updatedUser.avatar.publicId
            }
        });
    } catch (error) {
        console.error('Detailed update error:', {
            error: error.message,
            stack: error.stack
        });
        
        res.status(500).json({
            success: false,
            message: `Failed to update avatar: ${error.message}`
        });
    }
};


// Add this new middleware for deleting images
const deleteFromCloudinary = async (req, res, next) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required for deletion'
            });
        }

        // Delete from Cloudinary
        const result = await deleteImage(publicId);

        if (result.result === 'ok') {
            return res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete image'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Image deletion failed: ${error.message}`
        });
    }
};

// Update the module exports to include deleteFromCloudinary
module.exports = {
    upload,
    uploadToCloudinary,
    handleUploadError,
    deleteFromCloudinary,
    updateAvatar
};