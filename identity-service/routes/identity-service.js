const express = require('express');
const {userRegistration,loginuser} = require('../controllers/identity-controller');
const router = express.Router();

router.post('/register', userRegistration);
router.post('/login', loginuser);
module.exports = router;
