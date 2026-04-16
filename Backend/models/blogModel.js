const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/1080x720'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Technology', 'Lifestyle', 'Business', 'Health', 'Travel', 'Food', 'Other'],
    default: 'Other'
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
blogSchema.index({ title: 'text', content: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;