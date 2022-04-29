const router = require('express').Router(),
    passport = require('passport');
require('dotenv').config();

//authentication middleware
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;

router.use((req, res, next) => {
    console.log('index req user', req.session);
    next();
})

/************************************** LOGIN AND REGISTER *************************************/
router.use(require('./login-register'));

/************************************** JWT AUTHENTICATION *************************************/
router.use(passport.authenticate('jwt', { session: true }), (req, res, next) => {
    next()
});
/******************************EVERY ROUTE BEYOND THIS POINT REQUIRES AUTHENTICATION *********************************/
router.use('/users', require('./users'));

module.exports = router;