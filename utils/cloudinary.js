const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
});

// Configure Cloudinary with validation
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
} catch (error) {
    throw new Error(`Failed to configure Cloudinary: ${error.message}`);
}

// Constants
const UPLOAD_FOLDER = 'blogapp';
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload an image to Cloudinary
 * @param {Object} file - The file object containing path and other details
 * @param {Object} options - Optional upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadImage = async (file, options = {}) => {
    try {
        // Validate file
        if (!file || !file.path) {
            throw new Error('Invalid file object');
        }

        // Validate file format
        const fileExt = path.extname(file.path).toLowerCase().slice(1);
        if (!ALLOWED_FORMATS.includes(fileExt)) {
            throw new Error(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        const uploadOptions = {
            folder: UPLOAD_FOLDER,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            resource_type: 'auto',
            ...options
        };

        const result = await cloudinary.uploader.upload(file.path, uploadOptions);
        return result;
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteImage = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error('Public ID is required');
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image'
        });

        if (result.result !== 'ok') {
            throw new Error(`Failed to delete image: ${result.result}`);
        }

        return result;
    } catch (error) {
        throw new Error(`Image deletion failed: ${error.message}`);
    }
};

/**
 * Get Cloudinary configuration
 * @returns {Object} Current Cloudinary configuration
 */
const getConfig = () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: UPLOAD_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
    maxFileSize: MAX_FILE_SIZE
});

module.exports = {
    uploadImage,
    deleteImage,
    getConfig
};