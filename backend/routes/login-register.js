const router = require('express').Router(),
    passport = require('passport'),
    bcrypt = require('bcrypt'),
    { User } = require('../models/user'),
    issueJWT = require('../lib/utils').issueJWT;
require('dotenv').config();

//require the local passport config
const root = process.env.PUBLIC_ROOT_DIR;

router.get('/register', async (req, res, next) => {
    try {
        if (req.query.taken) {
            return res.sendFile('register.html', { root: '../public' });
        }
        res.sendFile('register.html', { root: root });
    } catch (err) {
        next(err);
    };
});

router.get('/login', async (req, res, next) => {
    try {
        res.sendFile('login.html', { root: root });
    } catch (err) {
        next(err);
    };
});

router.get('/logout', async (req, res, next) => {
    try {
        console.log(req.user)
        req.logout();
        res.clearCookie('accessToken');
        res.end();
    } catch (err) {
        next(err);
    };
});


router.post('/register', async (req, res, next) => {
    console.log('register route', req.body)
    try {
        const { username, password } = req.body;

        //check if the username is taken, if it is return to register with msg
        const exists = await User.findOne({ username: username });
        if (exists) return res.send('Username already taken!');


        if (username && password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = await User.create({ username: username, password: hashedPassword });
            const token = {}
            if(!req.headers.authorization){
                const jwt = issueJWT(newUser._id);
                token.token = jwt.token;
                token. expiresIn = jwt.expiresIn;
                res.cookie('accessToken', jwt.token, { sameSite: true, maxAge: 1000 * 60 * 60 * 24, secure: true });
            }
            res.json({ success: true, user: newUser, accessToken: token.token, expiresIn: token.expiresIn });
        } else throw new Error('Username/password required!')

    } catch (err) {
        next(err);
    };
});

router.post("/login", passport.authenticate("local", { session: false }), async (req, res, next) => {
    try {
        console.log(req.body)
        const user = await User.findOne({ username: req.body.username });
        delete user.password;
        const jwt = issueJWT(user._id);
        console.log(jwt)
        res.cookie('accessToken', jwt.token, { sameSite: true, maxAge: 1000 * 60 * 60 * 24 });
        res.json({ success: true, user: user, accessToken: jwt.token, expiresIn: jwt.expiresIn });
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;