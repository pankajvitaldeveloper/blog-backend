const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Blog = require("../models/blogSchema");

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user and handle non-existent user
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set cookie with the token
    res.cookie("blogsapptcm", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: true,
      sameSite: "None",
      path: "/", // Add path for consistency
    });

    // Send response without sensitive info
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        avatar: existingUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const adminlogout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie("blogsapptcm", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      secure: true,
      sameSite: "None",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// create blog below api
const adminBlog = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required"
      });
    }
    if(!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    const newBlog = new Blog({
      title,
      description,
      category,
      image: req.file.path, // Assuming req.file.path contains the image URL
    });

    await newBlog.save();
    
    // Add success response
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog
    });

  } catch (error) {
    res.status(500).json({
      success: false, // Fixed typo in success
      message: "Internal Server Error"
    });
  }
};

// Update the exports
module.exports = {
  adminlogin,
  adminlogout,
  adminBlog  
};