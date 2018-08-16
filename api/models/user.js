const mongoose = require('mongoose');
const Nexmo = require('nexmo');
const jwt = require("jsonwebtoken");


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


userSchema.methods.verifyMobileNumber = function(otp, cb) {
    const self = this;

    nexmo.verify.check({request_id: self.request_id, code: otp}, (err, result) => {
        if(err){
            return cb(err,null);
        }
    
        self.mobile_verified = true;
        self.save()
        .then(res => {
            return cb(null,this)
        })
        .catch(err => {
            return cb(new Error(err),null);
        });

    });
};


userSchema.methods.requestOtp = function(cb,req,res) {
    var self = this;

    console.log('start');
    self.request_id = "result.request_id";
    self.save()
    .then(res => {
        console.log('then 1');
        console.log('then 2');
         return cb(null,this);
    })
    .catch(err => {
        console.log('error 1');
            //do your job here
            console.log('error 2');
            return cb('error',null);

            // return res.status(500).json({
            //     message : "Internal Server Error !!",
            //     Error : err
            // });

    });

    console.log('last');

    // User.update({_id : self.id},{ $set : {
    //     request_id : result.request_id
    // }})
    // .exec()

    // nexmo.verify.request({number: self.mobile, brand: 'Hobotreks Company', country : 'IN'},(err,result)=>{
        
    //     if(err){
    //         return cb(err,nil);
    //     }
    
    // });

};

userSchema.methods.requestAuthToken = () => {
    var self = this;

    const token = jwt.sign(
        {
            mobile : self.mobile,
            userId : self._id
        },
        process.env.JWT_PASS_KEY,
        {
            expiresIn : "1h"
        }
    );
    return Promise.resolve(token);
}


module.exports = mongoose.model('User', userSchema);