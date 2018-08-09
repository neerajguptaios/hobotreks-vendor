const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: "879ba2c0",
  apiSecret: "CaSkha79myFb1PYy"
});
 

exports.post_new_user = (req,res,next) => {
    console.log(req.body);
    User.find({email : req.body.email})
    .exec()
    .then(result => {
        if(result.length >= 1){
            return res.status(409).json({
                message : "mail exists!"
            });
        }
        else{
            password = req.body.password;
            if(!password){
                return res.status(401).json({
                    error : "password is required"
                });
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error : err
                    });
                }
                else{
                    nexmo.verify.request({number: req.body.mobile, brand: 'Hobotreks Company', country : 'IN'}, (err, 
                        result) => {
                          if(err) {
                            return res.status(500).json({
                                Error : err
                            });
                          } else {
                              console.log("result - " + result);
                            let requestId = result.request_id;
                            if(result.status == '0') {
                                const user = new User({
                                    _id : mongoose.Types.ObjectId(),
                                    email : req.body.email,
                                    password : hash,
                                    name : req.body.name,
                                    request_id : requestId,
                                    mobile : req.body.mobile
                                });
                                user.save()
                                .then(result => {
                                    return res.status(201).json({
                                        message : "User Created - verify Otp",
                                    });                
                                })
                                .catch(err => {
                                    return res.status(500).json({
                                        error : err
                                    });                
                                });            
                            } else {
                                res.status(401).json({
                                    Error : result.error_text
                                  });
                              }
          
                            }
                        });

                    }
                });
        }
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};


exports.verify_user = (req,res,next) => {
    User.find({mobile : req.body.mobile})
    .exec()
    .then(result => {
        if(result.length < 1){
            return res.status(409).json({
                message : "No such mobile number found!"
            });
        }
        else{
            let pin = req.body.otp;
            let requestId = result[0].request_id;
            
            console.log(result);

            nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
                if(err) {
                    return res.status(500).json({
                        message : "Server Error",
                        error : err
                    });    
            } else {
                if(result && result.status == '0') { // Success!
                    User.update({_id : result[0]._id},{ $set : {
                        mobile_verified : true
                    }})
                    .exec()
                    .then(result => {
                        const token = jwt.sign(
                            {
                                email : result[0].email,
                                userId : result[0]._id
                            },
                            process.env.JWT_PASS_KEY,
                            {
                                expiresIn : "1h"
                            }
                        );
                        return res.status(200).json({
                            message : "Account verified! 🎉",
                             token : token
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            message : "Server Error",
                            error : err
                        });    
                    });
                } else {
                    return res.status(409).json({
                        message : "Wrong Otp",
                        result : result
                    });
                }
            }
        });
        }
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
}


exports.try_login = (req,res,next) => {
    User.find({email : req.body.email})
    .exec()
    .then(result => {
        if(result.length < 1){
            return res.status(401).json({
                message : "Auth Failed!"
            });
        }
        else{
            if(!result[0].mobile_verified){
                return res.status(401).json({
                    message : "Mobile Number Not Verified"
                });
            }

            bcrypt.compare(req.body.password, result[0].password, (err, match) => {
                if(err){
                    return res.status(401).json({
                        message : "Auth Failed!"
                    });
                }
                else{
                    if(match){

                        const token = jwt.sign(
                            {
                                email : result[0].email,
                                userId : result[0]._id
                            },
                            process.env.JWT_PASS_KEY,
                            {
                                expiresIn : "1h"
                            }
                        );
                        return res.status(200).json({
                            message : "Auth Successful",
                             token : token
                        })
                    }
                    else{
                        return res.status(401).json({
                            message : "Auth Failed!"
                        });            
                    }
                }
            })
        }
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};

exports.delete_user = (req, res, next)=>{
    const userId = req.userData.userId;
    User.remove({ _id : userId })
    .exec()
    .then(result => {
        return res.status(200).json({
            message : "user deleted"
        });
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};