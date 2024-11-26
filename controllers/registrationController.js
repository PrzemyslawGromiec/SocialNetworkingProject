import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

export async function registerUser(req, res, collection) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const userModel = new User(collection); 

    try {
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Saving user...");
        const newUser = await userModel.createUser({
            username,
            email,
            password: hashedPassword
        });

        // Generate a JWT
        const token = jwt.sign(
            { id: newUser.insertedId, username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            userId: newUser.insertedId
        });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
