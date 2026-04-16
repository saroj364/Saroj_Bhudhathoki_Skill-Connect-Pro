const mongoose = require('mongoose'); 

const commentSchema = new mongoose.Schema({
    rating : {
        type: Number,
        required: [true,'Please provide rating.'],
        maxlength: [5,'error']
    },
    description: {
        type: String ,
        required: [true,'Please write something about the lesson'],
        maxlegnth: [250,'only 250 characters are allowed']
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true 
});

commentSchema.index({description:'text'}); 

const Comment = mongoose.model('Comment',commentSchema); 
module.exports = Comment; 