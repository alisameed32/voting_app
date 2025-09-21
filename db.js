const mongoose = require('mongoose');
require('dotenv').config();

// Define the mongodb URL Connection

//const mongoURL = MONGO_DB_URL_LOCAL
const mongoURL = process.env.localDBURL;

// Set Up the MongoDB Connection

mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log("Connected to MongoDB Server");
})

db.on('error', (err)=>{
    console.log("MongoDB connection err: ", err);
})

db.on('disconnected', ()=>{
    console.log("MongoDB Server disconnected");
})


module.exports = db;