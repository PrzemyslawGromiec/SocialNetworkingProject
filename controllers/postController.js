import Post from '../models/Post.js';

export const createPost = async (req, res, collection) => {
    const userId = req.user?.id;
    // const { userId } = req.params;
    // const { content } = req.body;
    const { content } = req.body; 

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const postModel = new Post(collection);
        const result = await postModel.createPost({ userId, content });
        res.status(201).json({ message: 'Post created successfully', postId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPostsByUserId = async (req, res, collection) => {
    const { userId } = req.params;
    console.log("userId from request:", userId);

    try {
        const postModel = new Post(collection);
        const posts = await postModel.getPostsByUserId(userId);
        console.log("Posts found:", posts);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePost = async (req, res, collection) => {
    const { postId } = req.params;

    try {
        const postModel = new Post(collection);
        const result = await postModel.deletePost(postId);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};