const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const { User } = require('../models/User'); // Assuming User model is defined in models/User.js
const router = express.Router();

// Fetch user data from wearable device API
const fetchWearableData = async (userId, accessToken) => {
    try {
        const response = await axios.get('https://api.wearabledevice.com/user/data', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching wearable data:', error);
        throw new Error('Failed to fetch wearable data');
    }
};

// Update user data in MongoDB
const updateUserWearableData = async (userId, wearableData) => {
    try {
        await User.findByIdAndUpdate(userId, { wearableData }, { new: true });
    } catch (error) {
        console.error('Error updating user data in MongoDB:', error);
        throw new Error('Failed to update user data');
    }
};

// Integration endpoint
router.post('/integrate', async (req, res) => {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
        return res.status(400).json({ error: 'User ID and access token are required' });
    }

    try {
        const wearableData = await fetchWearableData(userId, accessToken);
        await updateUserWearableData(userId, wearableData);
        return res.status(200).json({ message: 'Wearable data integrated successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;