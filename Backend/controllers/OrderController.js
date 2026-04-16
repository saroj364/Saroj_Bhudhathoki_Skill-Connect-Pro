const Order = require('../models/Order'); 

    const getOrder = async (req ,res) =>{
        try{
            const userid = req.user.id ;
            const orderItems = await Order.find({user_id: userid}).select("course_id total_amount transaction_uid payment_method status createdAt").populate("course_id",{title: 1}).sort({createdAt: -1});
            return res.status(200).json({
                success: true,
                data: orderItems
            });
        }catch(error){
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }



module.exports = {
    getOrder
};