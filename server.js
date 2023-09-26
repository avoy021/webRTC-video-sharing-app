const express = require('express');
const dotenv = require('dotenv');

//config
dotenv.config({path: __dirname + '/config/config.env'});

const passport = require('passport');
const session = require('express-session');
const googleStrategy = require('./config/passport')(passport);
const connectDatabase = require('./config/connectDB');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const app = express();

const PORT = process.env.PORT || 5000;
connectDatabase();

//static folder
app.use(express.static(__dirname + '/public'))

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3*30*60*60*1000 // in milliseconds- 90hours
    }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth',require('./routes/auth'));
app.use('/lobby',require('./routes/lobby'))

app.get('/',(req,res) => {
    res.sendFile(__dirname + '/public/home.html');
})

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`))
