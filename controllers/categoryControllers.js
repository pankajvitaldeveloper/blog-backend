const Category = require('../models/categorySchema');
const Blog = require('../models/blogSchema'); // Add this import

// Create new category
const createCategory = async (req, res) => {
    try {
        // console.log('Request body:', req.body); // Debug log

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }

        const { name, description } = req.body;

        // Validate name
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Valid category name is required"
            });
        }

        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Category name must be at least 2 characters long"
            });
        }

        // Check for existing category
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        // Create new category
        const category = await Category.create({
            name: trimmedName,
            description: description?.trim() || ''
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
        // console.error("Create category error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        // console.log('Fetching all categories'); // Debug log
        
        const categories = await Category.find({})
            .select('name description slug')
            .sort({ name: 1 });
            
        // console.log('Categories found:', categories);

        if (!categories || categories.length === 0) {
            return res.status(200).json({
                success: true,
                categories: [],
                message: "No categories found"
            });
        }

        res.status(200).json({
            success: true,
            categories,
            message: "Categories fetched successfully"
        });
    } catch (error) {
        // console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

const getCategoryBlogs = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Validate categoryId
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    // First check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Get all blogs that belong to this category
    // Remove author population since it's causing issues
    const blogs = await Blog.find({ category: categoryId })
      .populate('category', 'name description')
      .select('title description image createdAt likeBlogs')
      .sort({ createdAt: -1 });

    // console.log('Category found:', category);
    // console.log('Blogs found:', blogs.length);

    return res.status(200).json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description
      },
      blogs: blogs,
      totalBlogs: blogs.length
    });

  } catch (error) {
    // console.error("Error in getCategoryBlogs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }

        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Valid category name is required (minimum 2 characters)"
            });
        }

        const trimmedName = name.trim();

        // Check if new name already exists (excluding current category)
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                name: trimmedName,
                description: description?.trim() || '',
                slug: trimmedName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
            },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (error) {
        // console.error("Update category error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update category"
        });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Optional: Check if category is being used in blogs
        // const blogs = await Blog.find({ category: id });
        // if (blogs.length > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Cannot delete category as it is being used in blogs"
        //     });
        // }

        const deletedCategory = await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            category: deletedCategory
        });
    } catch (error) {
        // console.error("Delete category error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete category"
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryBlogs,
    updateCategory,
    deleteCategory
};

// working