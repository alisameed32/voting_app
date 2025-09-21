const express = require('express');
require('dotenv').config();
const db = require('./db')
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const app = express();

app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.get('/', (req, res) => {
    res.send("Hello World");
})




app.listen(port, ()=> {
    console.log("Server is listening at 3000");
})
