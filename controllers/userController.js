const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
// const { deleteImage } = require("../utils/cloudinary");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // validation below code
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email is not valid" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: {
        url: "https://res.cloudinary.com/dgetpw2fy/image/upload/v1748459542/blogapp/image-1748459541078-123238188_jqpdor.jpg", // Add your default avatar URL
        publicId: "default-avatar", // Add your default avatar public ID
      },
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add updateAvatar controller
const updateAvatar = async (req, res) => {
  try {
    console.log("UpdateAvatar called", req.user, req.cloudinaryResult);

    if (!req.user || !req.cloudinaryResult) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
      });
    }

    const userId = req.user.id;
    const { url, publicId } = req.cloudinaryResult;

    // Rest of your code...
  } catch (error) {
    console.error("Avatar update error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to update avatar: ${error.message}`,
    });
  }
};

const login = async (req, res) => {
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

const logout = async (req, res) => {
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

// below code of check cookie
const checkCookie = async (req, res) => {
  try {
    const token = req.cookies.blogsapptcm;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }
    //below code of verify token and find user by id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking cookie",
    });
  }
};

const getProfileData = async (req, res) => {
  try {
    const { user } = req;
    const userData = await User.findById(user.id).select(
      "username email avatar"
    );

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile data",
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password and update
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
};

// Update module exports
module.exports = {
  register,
  login,
  logout,
  checkCookie,
  getProfileData,
  changePassword,
  updateAvatar,
};
