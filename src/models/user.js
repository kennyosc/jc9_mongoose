const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true, // wajib diisi
        trim: true // menghapus whitespace di awal dan akhir data
    },
    email: {
        type:String,
        validate(value){ // value: data yang diinput user
            
        }
    },
    password: String,
    age: Number
})

const User = mongoose.model('User', userSchema)

module.exports = User;