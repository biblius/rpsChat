const router = require('express').Router(),
    passport = require('passport');
require('dotenv').config();
require('../config/passport-jwt')

//authentication middleware
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;

router.use(isAuth, (req, res, next) => {
    console.log(req.cookies)
    if (req.cookies.jwt) {
        req.headers.authorization = req.cookies.jwt
        return next();
    }
    res.redirect('/?unauthorized=true');
});

router.use(passport.authenticate('jwt', {failureRedirect: '/?unauthorized=true', session: false}));

router.get('/dashboard', (req, res, next) => {
    res.send('<h1> Dashboard </h1> <a href="/logout">Logout</a>')
})

module.exports = router;
