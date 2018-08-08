const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/chack-auth');

const UsersController = require('../controllers/users-controller');

router.post('/signup',UsersController.post_new_user);

router.post('/login',UsersController.try_login);

router.delete('/',checkAuth,UsersController.delete_user);

module.exports = router;