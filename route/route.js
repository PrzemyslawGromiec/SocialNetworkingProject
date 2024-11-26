import express from 'express';
import { registerUser } from '../controllers/registrationController.js';
import { loginUser } from '../controllers/loginController.js';
import validateInput from '../middleware/validateInput.js';
import { createPost, getPostsByUserId, deletePost } from '../controllers/postController.js';
import User from '../models/User.js';

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
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.post('/login', (req, res) => {
    loginUser(req, res, req.collection);
});

router.post('/contents', (req, res) => {
    createPost(req, res, req.collection);
});


router.get('/contents/:userId', (req, res) => {
    getPostsByUserId(req, res, req.collection);
});

router.delete('/contents/:postId', (req, res) => {
    deletePost(req, res, req.collection);
});

export default router;