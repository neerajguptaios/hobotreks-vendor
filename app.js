const express = require('express');
const app = express();
const morgon = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
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

//Routes to handle reuests
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
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