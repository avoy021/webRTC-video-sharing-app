const passport = require('passport');

const authenticate = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = {
    authenticate
}