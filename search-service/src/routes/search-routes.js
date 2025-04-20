const express = require('express');
const router = express.Router();
const {SearchPostController} = require('../controller/search-controller');
const { authenticationuser } = require('../middleware/authmiddleware');
router.use(authenticationuser)
router.get('/', SearchPostController);
module.exports = router;