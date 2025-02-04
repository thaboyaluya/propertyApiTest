const express = require('express')
const propertyController = require('../controllers/propertyController')


const router = express.Router()


router.route('/').get(propertyController.welcome)
router.route('/davido').get(propertyController.lagos)





module.exports = router