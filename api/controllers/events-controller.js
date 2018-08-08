const mongoose = require('mongoose');
const Event = require('../models/event');


exports.get_all_events = (req,res,next) => {

    const userId = req.userData._id;
    Event.find({user : userId})
    .select('_id name cost_per_night place image')
    .exec()
    .then(docs => {
        console.log(docs);

        const response = {
            count : docs.length,
            events : docs.map(doc => {
                return {
                    id : doc._id,
                    name : doc.name,
                    cost_per_night : doc.cost_per_night,
                    image : 'http://localhost:3000/' + doc.image,
                    place : doc.place,
                    request : {
                        type : 'GET',
                        url : 'http://localhost:3000/events/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
};

exports.post_new_event = (req,res,next) => {
    const userId = req.userData.userId;

    const event = new Event({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        cost_per_night : req.body.cost_per_night,
        image : req.file.path,
        place : req.body.place,
        user : userId
    });

    event.save()
    .then(result =>{
        res.status(200).json({
            message : 'Created successfully',
            created_event : {
                id : result._id,
                name : result.name,
                cost_per_night : result.cost_per_night,
                image : 'http://localhost:3000/' + result.image,
                place : result.place,
                request : {
                    type : 'GET',
                    url : 'http://localhost:3000/products/' + result._id
                }
            }
        })    
    })
    .catch(err => {
        res.status(404).json({
            error : err
        })
    });
};

exports.get_single_event = (req,res,next) => {
    const id = req.params.eventId;
    const userId = req.userData._id;

    Event.find({_id : id, user : userId})
    .select('_id name cost_per_night image place')
    .exec()
    .then(result => {
        console.log("From Database", result);
        if(result){
            res.status(200).json({
                event : result,
                request : {
                    type : 'GET',
                    description : 'Get all Events',
                    url : 'http://localhost:3000/events/'
                }
            });
        }
        else{
            res.status(201).json({
                error : "No Valid id found"
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error : err
        })
    });
};

exports.delete_event = (req,res,next) => {
    const id = req.params.eventId;
    const userId = req.userData._id;

    Event.remove({_id : id, user : userId})
    .exec()
    .then(result => {
        console.log("From Database", result);
        res.status(200).json({
            message : "Event deleted",
            request : {
                type : 'POST',
                url : 'http://localhost:3000/events/',
                payload : {
                    name : 'String',
                    cost_per_night : 'Number',
                    place : 'String',
                    image : 'jpg'
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error : err
        })
    });
};

exports.update_event = (req,res,next) => {
    const id = req.params.eventId;
    const userId = req.userData._id;

    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.key] = ops.value;
    }

    Event.update({_id : id, user : userId},{ $set : updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message : "Event updated",
            request : {
                type : 'GET',
                url : "http://localhost:3000/events/" + result._id
            }
        });
    })
    .catch(err => {
        console.log(result);
        res.status(500).json({
            error : err
        });
    });
};