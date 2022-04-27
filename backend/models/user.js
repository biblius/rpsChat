const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    from: String,
    to: String,
    date: {
        type: Date,
        default: new Date,
        immutable: true
    },
    accepted: {
        type: Boolean,
        default: false
    }
});

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required!"]
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    pic: {
        type: String,
        default: 'C:/Users/Bunkus Khan/Desktop/chatNstuff/public/materials/bunkus.jpg'
    },
    friends: {
        type: [mongoose.ObjectId],
        ref: 'user',
        default: []
    },
    pendingRequests: {
        type: [requestSchema],
        ref: 'request',
        default: []
    },
    isAdmin: Boolean,
    onlineStatus: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('user', userSchema);
module.exports = { User };