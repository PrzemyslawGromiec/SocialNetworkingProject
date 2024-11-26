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
        return await this.collection.find({}).toArray();
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
}
