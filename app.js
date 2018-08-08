const express = require('express');
const app = express();
const morgon = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer  = require('multer')
const upload = multer()

const eventRoutes = require('./api/routes/events');
const adminRoutes = require('./api/routes/admins');
const userRoutes = require('./api/routes/users');

mongoose.connect('mongodb+srv://niku_singla:'+ process.env.MONGO_ATLAS_PW +'@hobo01-fhitw.mongodb.net/test?retryWrites=true',{
    useNewUrlParser:true
} );

app.use(morgon('dev'));

app.use('/uploads',express.static('uploads'))

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    req.header("Access-Control-Allow-Origin","*");
    req.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authourization"
    );
    
    if(req.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({}); 
    }
    next();
});

app.use('/',upload.array());

//Routes to handle reuests
app.use('/events',eventRoutes);
app.use('/admins',adminRoutes);
app.use('/users',userRoutes);


app.use((req, res, next)=>{

    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});


app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message : error.message
        }
    })
});



module.exports = app;