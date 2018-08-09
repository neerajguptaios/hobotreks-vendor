const User = require('../models/user');
const Admin = require('../models/admin');
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

exports.get_all_admins = (req,res,next) => {
    Admin.find()
    .exec()
    .then( results => {
        return res.status(200).json({
            count : results.length,
            users : results.map(result => {
                return {
                    Email : result.email
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

    Admin.find({email : req.body.email})
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
                        email : req.body.email,
                        password : hash
                    });

                    admin.save()
                    .then(result => {

                        const token = jwt.sign(
                            {
                                email : admin.email,
                                adminId : admin._id
                            },
                            process.env.JWT_ADMIN_PASS_KEY,
                            {
                                expiresIn : "1h"
                            }
                        );
                        return res.status(201).json({
                            message : "Admin Created",
                            token : token
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
    Admin.find({email : req.body.email})
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