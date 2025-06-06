const Blog = require('../models/blogSchema'); 
const User = require('../models/userSchema');
const getAllBlogs = async (req, res) => {
    try {
        // Fetch all blogs from the database
        const blogs = await Blog.find().populate('category', 'name').sort({ createdAt: -1 });

        // Check if blogs were found
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No blogs found"
            });
        }

        // Return the list of blogs
        res.status(200).json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    // Check if the current user has liked this blog
    const isLiked = blog.likeBlogs?.some(
      likedUserId => likedUserId.toString() === userId?.toString()
    );

    return res.status(200).json({
      success: true,
      blog: {
        ...blog.toObject(),
        isLiked,
        likesCount: blog.likeBlogs?.length || 0
      }
    });

  } catch (error) {
    console.error("Error in getBlogById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

// const updateBlog = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         // Log the incoming request data for debugging
//         console.log('Request body:', req.body);
//         console.log('Request file:', req.file);

//         // Get form data from request
//         const title = req.body.title;
//         const description = req.body.description;
//         const category = req.body.category;

//         // Validate basic fields
//         if (!title || !description || !category) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Required fields are missing"
//             });
//         }

//         // Create update object
//         const updateData = {
//             title,
//             description,
//             category
//         };

//         // If there's a new image file
//         if (req.file) {
//             updateData.image = req.file.path;
//         }

//         // Find and update the blog
//         const updatedBlog = await Blog.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true }
//         ).populate('category', 'name');

//         if (!updatedBlog) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Blog not found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             blog: updatedBlog
//         });

//     } catch (error) {
//         console.error("Error updating blog:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// }


const adminUpdateBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const { title, description, category } = req.body;

        // console.log('Update Request:', {
        //     body: req.body,
        //     file: req.file,
        //     cloudinaryResult: req.cloudinaryResult
        // });

        // Find existing blog
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: "Blog not found" 
            });
        }

        // Update fields
        if (title) blog.title = title;
        if (description) blog.description = description;
        if (category) blog.category = category;

        // Only update image if new one was uploaded
        if (req.cloudinaryResult && req.cloudinaryResult.secure_url) {
            blog.image = req.cloudinaryResult.secure_url;
            // console.log('New image URL:', blog.image);
        }

        await blog.save();
        res.status(200).json({ 
            success: true, 
            message: "Blog updated successfully", 
            blog 
        });

    } catch (err) {
        console.error("Update Blog Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Something went wrong" 
        });
    }
};


const deleteBlog = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the blog by ID and delete it
        const deletedBlog = await Blog.findByIdAndDelete(id);
        // Check if the blog was found and deleted      
        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        // Return success message
        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        }); 
    }
    catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


const recentBlogs = async (req, res) => {
    try {
        // Fetch the most recent blogs
        const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3).populate('category', 'name');

        // Check if blogs were found
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No recent blogs found"
            });
        }

        // Return the list of recent blogs
        res.status(200).json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error("Error fetching recent blogs:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


const addBlogFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find blog and user
        const [blog, user] = await Promise.all([
            Blog.findById(id),
            User.findById(userId).select('favorites')
        ]);

        // Check if blog and user exist
        if (!blog || !user) {
            return res.status(404).json({
                success: false,
                message: !blog ? "Blog not found" : "User not found"
            });
        }

        // Initialize likeBlogs array if it doesn't exist
        if (!blog.likeBlogs) blog.likeBlogs = [];

        // Check if user has already liked this blog
        const hasLiked = blog.likeBlogs.some(
            likedUserId => likedUserId.toString() === userId.toString()
        );

        if (hasLiked) {
            return res.status(400).json({
                success: false,
                message: "Blog already in favorites"
            });
        }

        // Add user to blog's likeBlogs
        blog.likeBlogs.push(userId);

        // Add blog to user's favorites
        user.favorites.push(id);

        // Save both documents with validation disabled for blog
        await Promise.all([
            blog.save({ validateBeforeSave: false }), // Skip validation
            user.save()
        ]);

        return res.status(200).json({
            success: true,
            message: "Blog added to favorites",
            isLiked: true,
            likesCount: blog.likeBlogs.length
        });

    } catch (error) {
        console.error("Error in addBlogFavorite:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const removeBlogFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find blog and user
        const [blog, user] = await Promise.all([
            Blog.findById(id),
            User.findById(userId).select('favorites')
        ]);

        // Check if blog and user exist
        if (!blog || !user) {
            return res.status(404).json({
                success: false,
                message: !blog ? "Blog not found" : "User not found"
            });
        }

        // Initialize likeBlogs array if it doesn't exist
        if (!blog.likeBlogs) blog.likeBlogs = [];

        // Remove user from blog's likeBlogs
        blog.likeBlogs = blog.likeBlogs.filter(
            likedUserId => likedUserId.toString() !== userId.toString()
        );

        // Remove blog from user's favorites
        user.favorites = user.favorites.filter(
            blogId => blogId.toString() !== id.toString()
        );

        // Save both documents with validation disabled for blog
        await Promise.all([
            blog.save({ validateBeforeSave: false }), // Skip validation
            user.save()
        ]);

        return res.status(200).json({
            success: true,
            message: "Blog removed from favorites",
            isLiked: false,
            likesCount: blog.likeBlogs.length
        });

    } catch (error) {
        console.error("Error in removeBlogFavorite:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getAllBlogs,
    getBlogById,
    adminUpdateBlog,
    deleteBlog,
    recentBlogs,
    addBlogFavorite,
    removeBlogFavorite,
    
};