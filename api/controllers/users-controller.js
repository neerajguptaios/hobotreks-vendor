const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");



exports.get_all_users = (req,res,next) => {
    User.find()
    .exec()
    .then( result => {
        return res.status(200).json({
            count : result.length,
            users : result
        });
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};

exports.post_new_user = (req,res,next) => {
    User.find({email : req.body.email})
    .exec()
    .then(result => {
        if(result.length >= 1){
            return res.status(409).json({
                message : "mail exists!"
            });
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
                        password : hash
                    });

                    user.save()
                    .then(result => {
                        return res.status(201).json({
                            message : "User Created"
                        });                
                    })
                    .catch(err => {
                        return res.status(500).json({
                            error : err
                        });                
                    });
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