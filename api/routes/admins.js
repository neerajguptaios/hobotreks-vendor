const express = require('express');
const router = express.Router();
const checkAdminAuth = require('../middleware/check-admin-auth');

const AdminController = require('../controllers/admin-controller');

router.get('/',checkAdminAuth,AdminController.get_all_admins);

router.get('/users',checkAdminAuth,AdminController.get_all_users);

router.post('/signup',AdminController.post_new_admin);

router.post('/login',AdminController.try_login);

router.delete('/user/:userId',AdminController.delete_user);

router.delete('/',AdminController.delete_admin);

module.exports = router;