const express = require('express');
const passport = require('passport');
const { authenticate } = require('../middleware/authentication');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/lobby');
});



module.exports = router;