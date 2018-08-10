const mongoose = require('mongoose');

const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: "879ba2c0",
  apiSecret: "CaSkha79myFb1PYy"
});


const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {
        type : String,
        unique : true,
        match : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password : {
        type : String,
        required: true
    },
    name : {
        type : String,
        required : true
    },
    mobile : {
        type : String,
        required : true,
        unique : true,
        minlength : 6
    },
    request_id : String,
    mobile_verified : {
        type : Boolean
    },
    email_verified : {
        type : Boolean
    }
});


userSchema.methods.verifyAuthToken = function(otp, cb) {
    const self = this;

    nexmo.verify.check({request_id: self.request_id, code: otp}, (err, result) => {
        if(err){
            return cb(err,nil);
        }
    
        self.mobile_verified = true;
        self.save()
        .then(res => {
            return cb(nil,this)
        })
        .catch(err => {
            return cb(err,nil);
        });

    });
};


userSchema.methods.sendAuthToken = function(cb) {
    var self = this;
    nexmo.verify.request({number: self.mobile, brand: 'Hobotreks Company', country : 'IN'},(err,res)=>{
        
        if(err){
            return cb(err,nil);
        }
    
        self.request_id = res.request_id;
        self.save()
        .then(res => {
            return cb(nil,this)
        })
        .catch(err => {
            return cb(err,nil);
        });
    });

};


module.exports = mongoose.model('User', userSchema);