# Mongoose vs Native MongoDB Driver Comparison

This document provides a detailed comparison between using Mongoose ODM and the native MongoDB driver for building Express.js APIs.

## Overview

Both implementations provide the same functionality but with different approaches to data modeling, validation, and database operations.

## Code Comparison

### 1. Schema Definition

**Mongoose Approach:**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot be more than 120']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Static method
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Instance method
userSchema.methods.getUserInfo = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    age: this.age,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
```

**Native MongoDB Approach:**
```javascript
const { MongoClient, ObjectId } = require('mongodb');

class UserWithoutMongoose {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    this.client = new MongoClient(process.env.MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db();
    this.collection = this.db.collection('users');
    
    // Manual index creation
    await this.collection.createIndex({ email: 1 }, { unique: true });
    await this.collection.createIndex({ isActive: 1 });
  }

  // Manual validation
  validateUser(userData) {
    const errors = [];
    
    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    if (userData.firstName && userData.firstName.length > 50) {
      errors.push('First name cannot be more than 50 characters');
    }
    // ... more validation logic
    return errors;
  }

  // Helper method (equivalent to virtual)
  getUserInfo(user) {
    return {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      age: user.age,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  }
}
```

### 2. Creating a User

**Mongoose Approach:**
```javascript
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, age, role } = req.body;

    // Automatic validation through schema
    const user = new User({
      firstName,
      lastName,
      email,
      age,
      role
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser.getUserInfo()
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    // ... error handling
  }
};
```

**Native MongoDB Approach:**
```javascript
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, age, role } = req.body;

    // Manual validation
    const errors = userModel.validateUser({
      firstName,
      lastName,
      email,
      age,
      role
    });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Manual data preparation
    const user = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      age: age || null,
      isActive: true,
      role: role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedUser = await userModel.createUser(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userModel.getUserInfo(savedUser)
    });
  } catch (error) {
    // Manual error handling
    if (error.message.includes('Validation errors:')) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.message.replace('Validation errors: ', '').split(', ')
      });
    }
    // ... error handling
  }
};
```
