const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const fs = require('fs');
const path = require('path');



const registerUser = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;
    
    // Validation: Ensure required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicPath = '';
    
    // Handle base64 image if provided
    if (profilePic && profilePic.startsWith('data:image/')) {
      try {
        console.log('Processing image, length:', profilePic.length);
        console.log('Image starts with:', profilePic.substring(0, 50));
        
        // Extract the base64 data and file extension
        const matches = profilePic.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const extension = matches[1];
          const base64Data = matches[2];
          
          console.log('Extracted extension:', extension);
          console.log('Base64 data length:', base64Data.length);
          
          // Validate base64 data
          if (!base64Data || base64Data.length === 0) {
            throw new Error('Empty base64 data');
          }
          
          // Create unique filename
          const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`;
          
          // Create uploads directory path relative to project root
          const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pics');
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = path.join(uploadsDir, fileName);
          
          // Convert base64 to buffer and save file
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(filePath, buffer);
          
          console.log('Image saved successfully:', filePath);
          
          // Store relative path
          profilePicPath = `uploads/profile-pics/${fileName}`;
        } else {
          console.error('Regex match failed for:', profilePic.substring(0, 100));
          throw new Error('Invalid base64 image format - regex match failed');
        }
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return res.status(400).json({ message: `Invalid image format: ${imageError.message}` });
      }
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic: profilePicPath,
    });

    // Generate a token for the new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Input Password:', password);
    console.log('Stored Hashed Password:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, upload };
