const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
 

exports.post_new_user = (req,res,next) => {
    console.log(req.body);
    let user = {};
    User.find({mobile : req.body.mobile})
    .exec()
    .then(result => {
        if(result.length >= 1){
            user = result[0];
            user.sendAuthToken(afterRequestingOtp);
        }
        else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error : err
                    });
                }
                else{
                    const user = new User({
                    _id : mongoose.Types.ObjectId(),
                    email : req.body.email,
                    password : hash,
                    name : req.body.name,
                    mobile : req.body.mobile
                    });

                    user.save()
                    .then(result => {
                        user.sendAuthToken(afterRequestingOtp);
                    })
                    .catch(err => {
                        return res.status(500).json({
                            error : err
                        });                
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


    function afterRequestingOtp(err, result){
        if(err || !result){
            return res.status(401).json({
                error : err
            });
        }
        return res.status(200).json({
            message : "Otp successfully sent"
        });
    }
    
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
            let user = result[0];
            user.verifyAuthToken(pin,afterVerifingOtp);
        }
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });


    function afterVerifingOtp(err, result){
        if(err || !result){
            return res.status(401).json({
                error : err
            });
        }

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
    }

}


exports.try_login = (req,res,next) => {
    User.find({mobile : req.body.mobile})
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