const mongoose = require('mongoose');
require('dotenv').config();

const options = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(process.env.DB_URL, options, (error) => {
    if (error) return console.log(error);
    else console.log("connected");
});
const connection = mongoose.connection,
    client = connection.getClient();

module.exports = { connection, client };