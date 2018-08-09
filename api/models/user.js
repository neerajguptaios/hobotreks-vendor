const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {
        type : String,
        required : true,
        unique : true,
        match : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password : {
        type : String,
        required: true
    },
    name : {
        type : String
    },
    mobile : {
        type : String,
        required : true,
        unique : true
    },
    request_id : {
        type : String,
        unique : true
    },
    mobile_verified : {
        type : Boolean
    },
    email_verified : {
        type : Boolean
    }
});


module.exports = mongoose.model('User', userSchema);