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

// Middleware to handle file upload and upload to Cloudinary
// const uploadToCloudinary = async (req, res, next) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No file uploaded'
//             });
//         }

//         // Add debug logging
//         // console.log('Uploading file to Cloudinary:', {
//         //     originalname: req.file.originalname,
//         //     path: req.file.path
//         // });

//         // Upload to Cloudinary
//         const result = await uploadImage(req.file);
        
//         // Store complete Cloudinary result
//         req.cloudinaryResult = {
//             secure_url: result.secure_url,
//             public_id: result.public_id,
//             url: result.url
//         };

//         // console.log('Cloudinary upload successful:', req.cloudinaryResult);

//         // Clean up local file
//         fs.unlink(req.file.path, (err) => {
//             if (err) {
//                 console.error('Error deleting local file:', err);
//             } else {
//                 console.log('Local file cleaned up successfully');
//             }
//         });

//         next();
//     } catch (error) {
//         console.error('Cloudinary upload error:', {
//             message: error.message,
//             stack: error.stack
//         });

//         // Clean up local file on error
//         if (req.file?.path) {
//             fs.unlink(req.file.path, (err) => {
//                 if (err) console.error('Error deleting local file:', err);
//             });
//         }

//         return res.status(500).json({
//             success: false,
//             message: `Upload failed: ${error.message}`
//         });
//     }
// };



const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            // No file uploaded — this is valid during update, just move on
            console.log('No new file uploaded. Skipping Cloudinary.');
            return next();
        }

        const result = await uploadImage(req.file);

        req.cloudinaryResult = {
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.url
        };

        // Clean up local file
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting local file:', err);
            } else {
                console.log('Local file cleaned up successfully');
            }
        });

        next();
    } catch (error) {
        console.error('Cloudinary upload error:', {
            message: error.message,
            stack: error.stack
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
    console.error('Upload error:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }

    if (err.message === 'Invalid file type') {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only JPEG, JPG, PNG and GIF allowed.'
        });
    }

    next(err);
};


//update the image 
const updateAvatar = async (req, res) => {
    try {
        console.log('Request data:', {
            user: req.user,
            cloudinaryResult: req.cloudinaryResult,
            file: req.file
        });

        // Check user authentication
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check if file was uploaded and processed by Cloudinary
        if (!req.cloudinaryResult || !req.cloudinaryResult.secure_url) {
            return res.status(400).json({
                success: false,
                message: "Image upload failed or missing"
            });
        }

        const userId = req.user.id;
        const { secure_url: url, public_id: publicId } = req.cloudinaryResult;

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete old avatar if exists
        if (user.avatar?.publicId && user.avatar.publicId !== 'default-avatar') {
            try {
                await deleteImage(user.avatar.publicId);
                console.log('Old avatar deleted successfully');
            } catch (error) {
                console.error('Error deleting old avatar:', error);
            }
        }

        // Update user with new avatar
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                avatar: {
                    url: url,
                    publicId: publicId
                }
            },
            { new: true }
        );

        console.log('Avatar updated successfully:', {
            url: updatedUser.avatar.url,
            publicId: updatedUser.avatar.publicId
        });

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            data: {
                url: updatedUser.avatar.url,
                publicId: updatedUser.avatar.publicId
            }
        });
    } catch (error) {
        console.error('Avatar update error:', error);
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

// above code is working of blog image upload and user avatar update