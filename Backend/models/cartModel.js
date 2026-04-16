const mongoose = require('mongoose'); 

const CartSchema = new mongoose.Schema({
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required : true
    },
    price : {
        type: Number,
        required: [true,'price not found'],
        min: 0
    }
},{
    timestamps: true
});

CartSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
const Cart = mongoose.model('Cart',CartSchema); 
module.exports = Cart; 
 
