const express = require('express');
const router = express.Router();

const multer = require('multer');
const EventsController = require('../controllers/events-controller');
const checkAuth = require('../middleware/chack-auth');

const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null,true);
    }
    else{
        cb(new Error('Only image file type supported', false));
    }
}

const storage = multer.diskStorage({
    destination: function(req,file,cb){

        cb(null,'./uploads/');
    },
    filename: function(req,file,cb){
        cb(null,new Date().toISOString() + file.originalname);
    }
});

const upload = multer({storage : storage, 
    limits : {
    fileSize : 1024 * 1024 * 5
    },
    fileFilter : fileFilter
});


router.get('/',checkAuth,EventsController.get_all_events);

router.post('/',checkAuth,upload.single('event_image'),EventsController.post_new_event);

router.get('/:eventId',checkAuth,EventsController.get_single_event);

router.delete('/:eventId',checkAuth,EventsController.delete_event);

router.patch('/:eventId',checkAuth,EventsController.update_event);

module.exports = router;