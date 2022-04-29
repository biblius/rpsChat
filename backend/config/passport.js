const passport = require('passport'),
    fs = require('fs'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    { User } = require('../models/user');

///////////////////////////////////////LOCAL STRATEGY///////////////////////////////////////////////////////
const localStrategy = new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username: username });
    try {
        if (!user) {
            return done(null, false)
        };
        const matchedPassword = await bcrypt.compare(password, user.password)
        if (!matchedPassword) {
            console.log("incorrect password")
            return done(null, false)
        };
        return done(null, user);
    } catch (err) {
        next(err);
    }
});

///////////////////////////////////////////JWT STRATEGY//////////////////////////////////
const PUB_KEY = fs.readFileSync(__dirname + '/crypto/id_rsa_pub.pem', 'utf-8');
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
}

const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
    const user = await User.findById(payload.sub);
    console.log(user)
    try {
        if (!user) return done(null, false);
        return done(null, user);
    }
    catch (err) {
        return done(err, false);
    }
});

module.exports = { localStrategy, jwtStrategy }