const express = require('express'),
    passport = require('passport'),
    session = require('express-session'),
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

const whitelist = ['http://localhost:4200', 'http://192.168.0.11:4200'];

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

//implement strategies
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session());

//-----------------//ROUTER//-----------------//
app.use(require('./routes/index'));

const errorHandler = require('./lib/utils').errorHandler;
app.use(errorHandler);

app.listen(process.env.port || 4000, '192.168.0.11', () => console.log("Listening for requests on 4000"));