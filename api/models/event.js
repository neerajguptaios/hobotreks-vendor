const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {
        type : String,
        required : true
    },
    cost_per_night : {
        type : Number,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    place : {
        type : String,
        required : true
    },
    approved : {
        type : Boolean
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

});


module.exports = mongoose.model('Event', eventSchema);