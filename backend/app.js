const express = require('express'),
    passport = require('passport'),
    session = require('express-session'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    { jwtStrategy, localStrategy } = require('./config/passport'),
    { User } = require('./models/user'),
    MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

const whitelist = ['http://localhost:4200', 'http://192.168.0.11:4200', 'http://25.62.25.2:4200'];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) === -1) {
            callback(new Error('Not allowed by CORS'));
        } else {
            callback(null, true);
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//-----------------//SESSION MIDDLEWARE//-----------------//
const { client } = require('./config/database');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        client,
        collection: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 20, secure: false, httpOnly: true }
}));

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(passport.initialize())
app.use(passport.session());

//attaches a user ID to req.session.passport on successfull login
passport.serializeUser((user, done) => {
    console.log('serializing', user)
    done(null, user.id);
});

//takes the ID from the passport, finds the user and attaches it to req.user on subsequent requests
passport.deserializeUser((id, done) => {
    console.log('deserializing', id)
    User.findById(id, (err, user) => {
        if (err) { return done(err) };
        done(null, user);
    });
});

//-----------------//ROUTER//-----------------//
app.use(require('./routes/index'));

const errorHandler = require('./lib/utils').errorHandler;
app.use(errorHandler);

app.listen(process.env.SERVER_PORT, process.env.PROXY_IP, () => console.log("Listening for requests on 4000"));