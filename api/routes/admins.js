const express = require('express');
const router = express.Router();
const checkAdminAuth = require('../middleware/check-admin-auth');

const UsersController = require('../controllers/users-controller');

router.get('/',checkAdminAuth,UsersController.get_all_users);

router.post('/signup',UsersController.post_new_user);

router.post('/login',UsersController.try_login);

router.delete('/:userId',UsersController.delete_user);

module.exports = router;