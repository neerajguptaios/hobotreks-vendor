const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
 

exports.post_new_user = (req,res,next) => {
    console.log(req.body);
    let user = {};
    User.find({mobile : req.body.mobile})
    .exec()
    .then(result => {

        var alreadyExists = false;

        if(result.length >= 1){
            user = result[0];

            if(user.mobile_verified){
                return res.status(500).json({
                    message : "Mobile number already exist, please login."
                });    
            }

            alreadyExists = true;

            // user.requestOtp(afterRequestingOtp,req,res);
        }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error : err
                    });
                }
                else{

                    if (alreadyExists){

                        User.update({_id : user._id},{ $set : {
                            email : req.body.email,
                            password : hash,
                            name : req.body.name,
                        }})
                        .exec()
                        .then(resultt => {
                            user.requestOtp(afterRequestingOtp,req,res);
                        })
                        .catch(err => {
                            return res.status(500).json({
                                error : err
                            });                
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
                            .then(resultt => {
                                user.requestOtp(afterRequestingOtp,req,res);
                            })
                            .catch(err => {
                                return res.status(500).json({
                                    error : err
                                });                
                            });                    
                    }

                }   
            });
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });


    function afterRequestingOtp(err, result){
        console.log('reached here at after request otp');
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
            user.verifyMobileNumber(pin,afterVerifingOtp);
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

        result.requestAuthToken()
        .then(token => {
            return res.status(200).json({
                message : "Account verified! 🎉",
                 token : token
            })    
        })
        .catch(err => {
            return res.status(401).json({
                error : err
            });
        });
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

                        result[0].requestAuthToken()
                        .then(token => {
                            return res.status(200).json({
                                message : "Auth Logged In! 🎉",
                                 token : token
                            })    
                        })
                        .catch(err => {
                            return res.status(401).json({
                                error : err
                            });
                        });
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