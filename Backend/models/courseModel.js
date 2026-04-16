const mongoose = require('mongoose'); 

const courseSchema = new mongoose.Schema(
{
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true,'Please provide a title'],
        trim: true,
        maxlength: [100,'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true,'Please enter description'],
    },
    duration: {
        type:Number,
        required: true
    },
    price: {
        type: Number,
        required: [true,'Please enter price'],
        min: 0,
    },
    category: {
    type: String,
    enum: [
        'web development',
        'backend',
        'frontend',
        'mobile development',
        'devops',
        'cybersecurity',
        'data science',
        'machine learning',
        'cloud computing',
        'database',
        'ui/ux design'
    ],
    default: 'web development'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    thumbnail: {
        type: String
    },
    isRequested:{
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    enrolledStudents: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
    
},
{
    timestamps: true
}
);

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ price: 1 });
courseSchema.index({ instructor_id: 1 });
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
