const User = require('../models/user');
const Admin = require('../models/admin');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


exports.get_all_users = (req,res,next) => {
    console.log("hello get all users  - ");
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

exports.get_all_admins = (req,res,next) => {
    Admin.find()
    .exec()
    .then( results => {
        return res.status(200).json({
            count : results.length,
            admins : results.map(result => {
                return {
                    Email : result.mobile,
                    id : result._id
                }
            })
        });
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};

exports.post_new_admin = (req,res,next) => {

    Admin.find({mobile : req.body.mobile})
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
                    const admin = new Admin({
                        _id : mongoose.Types.ObjectId(),
                        mobile : req.body.mobile,
                        password : hash
                    });

                    admin.save()
                    .then(result => {

                        // const token = jwt.sign(
                        //     {
                        //         mobile : admin.mobile,
                        //         adminId : admin._id
                        //     },
                        //     process.env.JWT_ADMIN_PASS_KEY,
                        //     {
                        //         expiresIn : "1h"
                        //     }                        
                        // );

                        admin.requestAuthToken()
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
    Admin.find({mobile : req.body.mobile})
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
                                mobile : result[0].mobile,
                                adminId : result[0]._id
                            },
                            process.env.JWT_ADMIN_PASS_KEY,
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
    User.remove({ _id : req.params.userId })
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

exports.delete_admin = (req, res, next)=>{
    const adminId = req.userData.adminId;

    Admin.remove({ _id : adminId })
    .exec()
    .then(result => {
        return res.status(200).json({
            message : "admin deleted"
        });
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};

exports.delete_admin_withId = (req, res, next)=>{
    const adminId = req.params.adminId;

    Admin.remove({ _id : adminId })
    .exec()
    .then(result => {
        return res.status(200).json({
            message : "admin deleted"
        });
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    });
};