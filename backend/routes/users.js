const router = require('express').Router(),
    { User } = require('../models/user')
require('dotenv').config();

router.get('/', async (req, res, next) => {
    try {
        if (req.session.viewCount) req.session.viewCount++;
        else req.session.viewCount = 1;
        const users = await User.find();
        res.json(users)
    } catch (err) {
        next(err);
    }
})

router.put('/:userId/toggleOnlineStatus', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        user.onlineStatus ? user.onlineStatus = false : user.onlineStatus = true;
        user.save();
        res.json(user)
    } catch (err) {
        next(err);
    }
})

router.delete('/:userId', async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        console.log(user)
        res.json(user)
    } catch (err) {
        next(err)
    }
})

router.get('/activeUser', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        console.log(user)
        res.json(user)
    }
    catch (err) {
        next(err);
    }
})

module.exports = router;