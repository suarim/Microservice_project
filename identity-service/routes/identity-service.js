const express = require('express');
const {userRegistration,loginuser,RefreshTokenController,logoutController} = require('../controllers/identity-controller');
const router = express.Router();

router.post('/register', userRegistration);
router.post('/login', loginuser);
router.post('/refresh',RefreshTokenController);
router.post('/logout',logoutController);

module.exports = router;
