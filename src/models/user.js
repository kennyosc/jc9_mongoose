const mongoose = require('mongoose')
const validators = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true, // wajib diisi
        trim: true // menghapus whitespace di awal dan akhir data
    },
    email: {
        type:String,
        // ini akan memeriksa apakah ada email lainnya yang sama atau tidak
        unique: true,
        validate(value){ // value: data yang diinput user
            //akan menghasilkan true /false ketika memeriksa emailnya
            var hasil = validators.isEmail(value)
            if(!hasil){
                throw new Error('Please insert a valid email address')
            }
        }
    },
    password: {
        type:String,
        //harus diisi
        required:true,
        //hapus space di awal dan akhir
        trim: true,
        // minimal 7 karakter
        minlength: 7,
        maxlength: undefined,
        //tidak boleh mengandung kata 'password'
        validate(value){
            var hasil = validators.contains(value,' ')
            var hasil2 = validators.contains(value,'password')

            if(hasil){
                //throw berguna untuk membuat custom error message, kita akan liat di postman
                throw new Error('Please insert without space')
            } else if(hasil2){
                throw new Error('Password must not contain the word password')
            }
        }
    },
    age: {
        type:Number,
         //tidak boleh string kosong
        required: true,
        default: 0,
        //umurnya lebih dari 0
        min: 1
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User;