# Backend: User Avatar Endpoints Implementation

Your backend has the group avatar endpoint but needs the user avatar endpoints. Here's what to add:

---

## Current Status

✅ **Group Avatar:** `PUT /chats/:chatId/avatar` - Already implemented
⏳ **User Avatar:** `PUT /api/users/:userId/avatar` - **Needs implementation**
⏳ **User Avatar Remove:** `DELETE /api/users/:userId/avatar` - **Needs implementation**

---

## Implementation Guide

### Step 1: Add User Avatar Upload Endpoint

Add this to your user routes file (e.g., `routes/userRoutes.js`):

```javascript
const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const protect = require('../middleware/protect'); // Your auth middleware

const router = express.Router();

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});

/**
 * @route   PUT /api/users/:userId/avatar
 * @desc    Upload/Update user avatar
 * @access  Private
 */
router.put('/:userId/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Convert to base64
    const base64Avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    user.avatar = base64Avatar;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      user: user
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload avatar' 
    });
  }
});

/**
 * @route   DELETE /api/users/:userId/avatar
 * @desc    Remove user avatar
 * @access  Private
 */
router.delete('/:userId/avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar removed successfully',
      user: user
    });
  } catch (error) {
    console.error('Avatar removal error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to remove avatar' 
    });
  }
});

module.exports = router;
```

---

### Step 2: Register Routes in Main App

In your main app file (e.g., `server.js` or `app.js`):

```javascript
const userRoutes = require('./routes/userRoutes');

// Register the routes
app.use('/api/users', userRoutes);
```

---

### Step 3: Ensure User Schema Has Avatar Field

Make sure your User model includes:

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  // ... other fields ...
  avatar: {
    type: String,
    default: null
  },
  // ... other fields ...
});
```

---

### Step 4: Install Dependencies (if not already installed)

```bash
npm install multer
```

---

## Testing

### Test with cURL:

```bash
# Upload avatar
curl -X PUT http://localhost:8080/api/users/YOUR_USER_ID/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"

# Delete avatar
curl -X DELETE http://localhost:8080/api/users/YOUR_USER_ID/avatar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test with Postman:

1. **PUT** `http://localhost:8080/api/users/{userId}/avatar`
   - Headers: `Authorization: Bearer {token}`
   - Body: form-data
   - Key: `avatar`, Value: (select image file)

2. **DELETE** `http://localhost:8080/api/users/{userId}/avatar`
   - Headers: `Authorization: Bearer {token}`

---

## Summary

Add 2 endpoints following the same pattern as your group avatar endpoint:

```
PUT /api/users/:userId/avatar      ← Upload user avatar
DELETE /api/users/:userId/avatar   ← Remove user avatar
```

Once these are implemented, the frontend will automatically work!

---

## Current App Status

✅ **Group avatars:** Working (endpoint exists)
✅ **Frontend ready:** Waiting for user avatar endpoints
⏳ **User avatars:** Need to implement endpoints above

Once you add these endpoints, everything will work perfectly! 🚀
