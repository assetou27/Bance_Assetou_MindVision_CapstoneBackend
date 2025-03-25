// Blog post routes
const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');

// @route   POST api/blog
// @desc    Create a new blog post
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    
    // Create new blog post
    const blogPost = new BlogPost({
      title,
      content,
      image,
      tags,
      author: req.user.id
    });
    
    // Save blog post to database
    await blogPost.save();
    
    res.json(blogPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogPosts = await BlogPost.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    
    res.json(blogPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/blog/:id
// @desc    Get blog post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id)
      .populate('author', 'name');
    
    // Check if blog post exists
    if (!blogPost) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    
    res.json(blogPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/blog/:id
// @desc    Update blog post
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    
    // Find blog post
    let blogPost = await BlogPost.findById(req.params.id);
    
    // Check if blog post exists
    if (!blogPost) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    
    // Update fields
    if (title) blogPost.title = title;
    if (content) blogPost.content = content;
    if (image) blogPost.image = image;
    if (tags) blogPost.tags = tags;
    
    // Update timestamp
    blogPost.updatedAt = Date.now();
    
    await blogPost.save();
    
    res.json(blogPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/blog/:id
// @desc    Delete blog post
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);
    
    // Check if blog post exists
    if (!blogPost) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    
    await blogPost.deleteOne(); // Using deleteOne instead of remove (deprecated)
    
    res.json({ msg: 'Blog post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;