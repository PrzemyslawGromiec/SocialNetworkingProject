import { ObjectId } from 'mongodb';

export default class User {
    constructor(collection) {
        this.collection = collection;
    }

    // Create a new user
    async createUser({ username, email, password }) {
        const newUser = {
            username,
            email,
            password,
            createdAt: new Date()
        };

        try {
            const result = await this.collection.insertOne(newUser);
            return result;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error("Duplicate key error: Username or email already exists.");
            }
            throw error;
        }
    }

    async findByEmail(email) {
        return await this.collection.findOne({ email });
    }

    async findById(userId) {
        return await this.collection.findOne({ _id: userId });
    }

    async getAllUsers() {
        const users = await this.collection.find({
            username: { $exists: true }, 
            email: { $exists: true }, 
            password: { $exists: true }
        }).toArray();

        return users.map(user => {
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            };
        });
    }

    async deleteUser(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('Invalid ObjectId format');
            }

            const objectId = ObjectId.createFromHexString(id);
            return await this.collection.deleteOne({ _id: objectId });
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    async deleteUserByEmail(email) {
        try {
            const result = await this.collection.deleteOne({ email });
            return result;
        } catch (error) {
            throw new Error(`Failed to delete user by email: ${error.message}`);
        }
    }

    async deleteAllUsers() {
        try {
            const result = await this.collection.deleteMany({});
            return result;
        } catch (error) {
            throw new Error(`Failed to delete all users: ${error.message}`);
        }
    }
    

}
