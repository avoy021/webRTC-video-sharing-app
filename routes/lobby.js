const express = require('express');
const { authenticate } = require('../middleware/authentication');

const router = express.Router();

router.get('/',authenticate, (req,res) => {
    res.sendFile('lobby.html', {root:'public'});
})

router.get('/room', (req,res) => {
    res.sendFile('room.html', {root:'public'});
})

module.exports = router