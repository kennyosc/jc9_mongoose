const mongoose = require('mongoose')
const validators = require('validator')
const bcrypt = require('bcrypt')

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
            //ref itu akan merefensikan ketika .populate dijalankan, bukan untuk menyambungkan antar model
            ref:'Task'
        }
    ]
})

//MODEL METHOD
//statics berguna untuk memasukkan method baru ke dalam model userSchema
userSchema.statics.loginWithEmail = async(da_email,da_password)=>{
    try{
        const f_user = await User.findOne({email:da_email})

        if(!f_user){
            //throw ini akan masuk ke try,catch ketika function ini dipanggil
            // ini akan masuk ke dalam propery .message
            // untuk mengakses nya adalah dengan cara error.message di dalam catch
            throw new Error("User not found")
        }
    
        //.compare menerima 2 parameter
        // 1. password yang dimasukkan/ diinput
        // 2. password yang ada di database
        // dia akan memeriksa apakah password yang diinput = password yang di database, yang sudah di hash
        const check_password = await bcrypt.compare(da_password, f_user.password)
        if(!check_password){
            throw new Error('Unable to login')
        }
    
        //ini di return karena merupakan sebuah function dan tidak ada 'res'.
        // makanya tidak di res.send
        return f_user
    }catch(error){
        return({
            status:'FAIL',
            message: error
        })
    }
}

userSchema.pre('save', async function(next){
    //this akan mengacu pada object user di mana function ini dipanggil, yaitu user
    const user = this
    //check first whether the document is modified or not, then run the bcrypt function
    if(user.isModified){
        //brcrypt akan menerima 2 parameter, yaitu 'variable yang akan di hash', dan berapa bnyk hash yang diinginkan
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;