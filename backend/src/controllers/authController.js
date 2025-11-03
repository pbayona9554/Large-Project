//All API code for authentification will be here

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const User = require("../models/User"); // Mongoose model or native db ref


//Login api/endpoint with bcrypt hashing and JWT token session management
exports.SignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection("users").findOne({ email : email});
    if (!email) {
      return res.status(400).json({ error: "Invalid email or password"});
    }

    const isMatch = await bcrypt.compare(password, user.password); 
    if(!isMatch){
      return res.status(400).json({error : "Invalid username or password"});
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification: user.verification,
        clubsjoined: user.clubsjoined
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Signup API endpoint with Hashing password and JWT token for session management
exports.Login = async (req, res) => {
  const {name, email ,password, role} = req.body;
  
  try {
    if(!name || !email || !password || !role) {
      return res.status(400).json({error: "All fields are required"});
    }

    //Check if user exists
    const existingUser = await db.collection("users").findOne({email: email});
    if(existingUser){
      return res.status(400).json({error: "User already exists"});
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = {
      name: name,
      email: email,
      password: hashedPassword,
      role: role || "member",
      verification : false,
      clubsjoined: []
    };
    const result = await db.collection("users").insertOne(newUser);
    
    const token = jwt.sign(
      {id: result.insertedId, email, role : newUser.role},
      process.env.JWT_SECRET,
      {expiresIn: "1h"} 
    );
    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        role: newUser.role,
        verification: newUser.verification,
        clubsjoined: newUser.clubsjoined
      }
    });
  } catch(err){
    console.error("Signup error:", err);
    res.status(500).json({error: "Internal server error"});
  }  
});


// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  // Use token from middleware
  // Return current user info
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  // Generate reset token
  // Send email (future)
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  // Verify reset token
  // Update password
};

// GET /api/auth/verify/:token
exports.verifyEmail = async (req, res) => {
  // Validate email verification token
  // Update user's verification status 
  };