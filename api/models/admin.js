const mongoose = require('mongoose');
const Nexmo = require('nexmo');
const jwt = require("jsonwebtoken");


const nexmo = new Nexmo({
  apiKey: "879ba2c0",
  apiSecret: "CaSkha79myFb1PYy"
});

const adminSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    mobile : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required: true
    },
    request_id : String,
    mobile_verified : Boolean
});


adminSchema.methods.requestAuthToken = () => {
    var self = this;

    const token = jwt.sign(
        {
            mobile : self.mobile,
            adminId : self._id
        },
        process.env.JWT_PASS_KEY,
        {
            expiresIn : "1h"
        }
    );
    return Promise.resolve(token);
}

module.exports = mongoose.model('Admin', adminSchema);