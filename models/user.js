const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type : String,
        require: ['true', 'Id is required']
    },
    name: {
        type : String,
        require: ['true', 'name is required']
    }
})

const User = mongoose.model('User',userSchema);

module.exports = User;