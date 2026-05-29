import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// helper function to generate a secure jwt token

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc Register a new user
// @route POST /api/auth/register

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    // 2. Create the user (password hashing is handled by the pre save)

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || "VISITOR",
    });

    // 3. Return the user data and a secure token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data recieved" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Authenticate a user & get token
// @route POST /api/auth/login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // 2. verify email exists and compare the raw password
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user via Google OAuth
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  const { name, email } = req.body;

  try {
    // 1. Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // 2. If they are a new user, create an account
      // We generate a complex random password since they are authenticating via Google
      const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      user = await User.create({
        name,
        email,
        password: generatedPassword,
        role: 'VISITOR' // Default role for new signups
      });
    }

    // 3. Issue the secure JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 4. Send back the user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Server error during Google Authentication" });
  }
};