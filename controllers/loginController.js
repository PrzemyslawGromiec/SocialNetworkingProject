import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
dotenv.config();

export async function loginUser(req, res, collection) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            username: user.username
         });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

export async function getLoginStatus(req, res, collection) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!req.headers.authorization) {
        return res.status(401).json({
            loggedIn: false,
            username: null,
            message: "Token missing"
        });
    }

    if (!token) {
        return res.status(401).json({
            loggedIn: false,
            username: null,
            message: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await collection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({
                loggedIn: false,
                username: null,
                message: "User not found"
            });
        }

        res.status(200).json({
            loggedIn: true,
            username: user.username,
            message: "User is logged in"
        });
    } catch (error) {
        console.error("Error verifying token:", error.message);
        res.status(500).json({
            loggedIn: false,
            username: null,
            message: "Invalid or expired token"
        });
    }
}

export async function logoutUser(req, res) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing, user not logged in." });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error verifying token during logout:", error.message);
        res.status(400).json({ message: "Invalid or expired token" });
    }
}


