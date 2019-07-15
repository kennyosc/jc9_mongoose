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
        required:true,
        // ini akan memeriksa apakah ada email lainnya yang sama atau tidak
        unique: true,
        //this is for indexing
        index:{
            unique:true
        },
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

            if(value.toLowerCase().includes('password')){
                //throw berguna untuk membuat custom error message, kita akan liat di postman.
                // error messagenya berasal dari kita sendiri, bukan dari javascript
                throw new Error('Password must not contain the word password')
                
            } else if(value.toLowerCase().includes(' ')){
                throw new Error('Please insert password without space')
            }
        }
    },

    age: {
        type:Number,
        default: 0, // default value jika user tidak input data age. kalau user masukkan string kosong (""). hasilnya akan 0
        validate(value){
            if(value === null){
                throw new Error('Please insert age')
            } else if(value <= 0){
                throw new Error('Please insert age more than 0')
            }
        }
    },

    avatar: {
        //ini akan menyimpan string image foto berupa .jpeg dll.
        //In computer science, a data buffer (or just buffer) is a region of a physical memory storage used to temporarily store data while it is being moved from one place to another. ... 
        //However, a buffer may be used when moving data between processes within a computer.
        type: Buffer
    },

    tasks:[
        {//ini akan menyimpan objectID dari models task
            type: mongoose.Schema.Types.ObjectId,
            //synthax kedua akan mengambil data Task nya dari mana? yaitu dari model "Task"
            ref:'Task'
        }
    ]
})

const User = mongoose.model('User', userSchema)

module.exports = User;