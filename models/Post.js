import { ObjectId } from 'mongodb';

export default class Post {
    constructor(collection) {
        this.collection = collection;
    }

    async createPost({ userId, content }) {
        const newPost = {
            userId: (userId),
            userId,
            content,
            createdAt: new Date()
        };

        return await this.collection.insertOne(newPost);
    }

    async getPostsByUserId(userId) {
        return await this.collection
            .find({ userId: (userId) })
            .sort({ createdAt: -1 })
            .toArray();
    }


    async getPostById(postId) {
        return await this.collection.findOne({ _id: new ObjectId(postId) }); // Poprawiona składnia
    }

    async deletePost(postId) {
        return await this.collection.deleteOne({ _id: new ObjectId(postId) }); // Poprawiona składnia
    }
}
