let express = require('express');
let router = express.Router();
let controller = require('../controllers/travel');

/* GET travel page */
router.get('/', controller.travel);

module.exports = router;
