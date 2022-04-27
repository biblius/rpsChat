const fs = require('fs'),
    jwt = require('jsonwebtoken');
require('dotenv').config();

function issueJWT(userId) {
    const PRIV_KEY = fs.readFileSync('C:/Users/Bunkus Khan/Desktop/chatNstuff/config/crypto/id_rsa_priv.pem', 'utf-8');
    const expiresIn = '1d';
    const payload = {
        sub: userId,
        iat: Date.now()
    }
    const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
    return {
        token: 'Bearer ' + signedToken,
        expiresIn: expiresIn
    }
}

function errorHandler(err, req, res, next) {
    if (err)
        console.log(err)
        return res.send(`<h1> There was an error: ${err} </h1>`)
}

module.exports.issueJWT = issueJWT;
module.exports.errorHandler = errorHandler;
