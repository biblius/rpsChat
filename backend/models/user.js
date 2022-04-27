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

userSchema.methods.removeRequest = function (request) {
    if (this.pendingRequests.length > 0) {
        for (let i = 0; i < this.pendingRequests.length; i++) {
            if (this.pendingRequests[i].id == request.id) {
                const index = this.pendingRequests.indexOf(this.pendingRequests[i]);
                return this.pendingRequests.splice(index, index + 1);
            }
        }
    }
    return "Could not find request";
}

const User = mongoose.model('user', userSchema);
module.exports = { User };