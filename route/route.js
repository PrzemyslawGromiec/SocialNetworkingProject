import express from 'express';
import { registerUser } from '../controllers/registrationController.js';
import { loginUser, getLoginStatus, logoutUser } from '../controllers/loginController.js';
import validateInput from '../middleware/validateInput.js';
import { createPost, getPostsByUserId, deletePost } from '../controllers/postController.js';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/users', validateInput, (req, res) => {
    registerUser(req, res, req.collection);
});

router.delete('/users/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const userModel = new User(req.collection);
        const result = await userModel.deleteUser(id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const userModel = new User(req.collection);
        const users = await userModel.getAllUsers();

        if (!users.length) {
            return res.status(404).json({ error: 'No users found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.delete('/users/email/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const userModel = new User(req.collection);
        const result = await userModel.deleteUserByEmail(email);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: `User with email ${email} successfully deleted` });
    } catch (error) {
        console.error("Error deleting user by email:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.delete('/users', async (req, res) => {
    try {
        const userModel = new User(req.collection);
        const result = await userModel.deleteAllUsers();

        res.status(200).json({
            message: `${result.deletedCount} user(s) successfully deleted`
        });
    } catch (error) {
        console.error("Error deleting all users:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.get('/login', (req, res) => {
    getLoginStatus(req, res, req.collection);
});

router.post('/login', (req, res) => {
    loginUser(req, res, req.collection);
});

router.delete('/login', logoutUser);

// router.post('/contents', (req, res) => {
//     createPost(req, res, req.collection);
// });

router.post('/contents', authenticateUser, (req, res) => {
    createPost(req, res, req.collection);
});


router.get('/contents/:userId', (req, res) => {
    getPostsByUserId(req, res, req.collection);
});

router.delete('/contents/:postId', (req, res) => {
    deletePost(req, res, req.collection);
});

export default router;