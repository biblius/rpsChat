/*Automagically creates a public and private key pair and puts them in their respective files for use with the JWT strategy*/

const crypto = require('crypto'),
    fs = require('fs');

function genKeyPair() {
    //Generate object with publicKey and privateKey properties
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, //number of bits, standard for rsa
        publicKeyEncoding: {
            type: 'pkcs1',  //Public Key Cryptography Standards 1
            format: 'pem'   //Most common formatting choice
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });
    //Store the keys into 2 .pem files, one for public and one for private
    fs.writeFileSync(__dirname + '/id_rsa_pub.pem', keyPair.publicKey);
    fs.writeFileSync(__dirname + '/id_rsa_priv.pem', keyPair.privateKey);
}

genKeyPair();
