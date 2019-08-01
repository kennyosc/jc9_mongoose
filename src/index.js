//=====================API======================
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const multer = require('multer')
//  npm i --save cors
// resource sharing between 2 network
const cors = require('cors')
const sharp = require('sharp')

const User = require('./models/user.js')
const Task = require('./models/task.js')

const port = 2019
//ganti password dan database yang mau dituju
const URL = 'mongodb+srv://kennyosc:K3nnyatlas@jc9mysqlexpress-gplrt.mongodb.net/jc9MySqlExpress?retryWrites=true&w=majority'

app.use(express.json())
app.use(cors())

// ======================MONGOOSE======================
mongoose.connect(URL, {
    // parser string URL
    useNewUrlParser: true,
    useCreateIndex: true
})

// ======================ROUTES=====================
//======================CREATE======================
//POST USER
app.post('/users/input', async(req,res)=>{ //async ditaruh disitu karena function (req,res) itu adalah yang async
    const {name,email,password,age} = req.body

    const nameData = name
    const emailData = email
    const passwordData = password
    const ageData = age

    const person = new User({
        name: nameData,
        email: emailData,
        password: passwordData,
        age: ageData
    })

    //ES7
    //ini adalah proses async, dimana res.send(results) menunggu hasil results dari var results
    try {
        var results = await person.save()
        res.send(results)
    } catch (err) {
        console.log(err)
    }

    //ES6
    // //ini adalah proses async
    // person.save().then((results)=>{
    //     res.send(results)
    // }).catch(err=>{ // catch dibutuhkan untuk display error di postman
    //     //catch memiliki 1 parameter dimana, errornya berasal dari javascript
    //     res.send(err)
    // })
})

// POST ONE TASK BASED ON USER_ID
app.post('/task/:user_id', (req,res)=>{
    const user_id = req.params.user_id
    const task_description = req.body.description

    //untuk mencari task milik si :user_id
    User.findById(user_id).then((user)=>{
        if(!user){
            return res.send('User not found')
        }

        console.log(user)
        // Membuat task {_id, desc, compl, owner}
        const new_task = new Task({
            description: task_description,
            owner: user_id
        })

        // Masukkan id dari task yg sudah di buat ke array 'tasks' pada user
        user.tasks = user.tasks.concat(new_task._id)
        
        user.save().then(()=>{
            new_task.save().then(()=>{
                res.send(new_task)
            })
        })
    })
})

//npm i --save multer
//KONFIGURASII MULTER a.k.a middleware untuk upload gambar
// multer = middleware for handling multipart/form-data, which is primarily used for uploading files.
const upload = multer({
    limits:{
        fileSize: 1000000 //byte
    },
    fileFilter(req,file,cb){
        if(file.originalname.match(/\.(jpg|png|jpeg)/)){
            cb(undefined, true)
        } else{
            cb(new Error('Please upload a .jpg .png .jpeg photo'))
        }
    }

})


//CREATE AVATAR
//npm i --save sharp (untuk resize gambar yang diupload)
// terdapat :id di tengahnya karena mau memberikan avatarnya khusus pada :id tersebut
// ketika pakai postman untuk upload avatar, itu menggunakan form-data
// ketika post di postman, nama key harus sama dengan upload.single('avatar')
app.post('/users/:id/avatar', upload.single('ravatar'),(req,res)=>{ //multer == middleware
    const id_data = req.params.id

    //sharp = sebuah function
    // sharp menerima sebuah file dimana akan di resize() lalu ubah jadi .png lalu karena di model itu buffer,maka toBuffer()
    sharp(req.file.buffer).resize({width:250}).png().toBuffer().then(buffer=>{
        //cari user berdasrkan id
        User.findById(id_data).then(user=>{
            //masukkan buffer ke dalam user.avatar
            user.avatar = buffer

            user.save().then(()=>{
                res.send('Avatar uploaded')
            }).catch(err=>{
                res.send('Upload failed')
            })
        })
    }).catch(err=>{
        res.send('Upload image to server failed')
    })
})

//LOGIN USER
app.post('/users/login', async(req,res)=>{
    const data_email = req.body.email
    const data_pass = req.body.password

    try {
        const hasil = await User.loginWithEmail(data_email,data_pass)
        res.send(hasil)
    } catch (error) {
        res.send(error.message)
    }
})


//======================READ======================
//HOME
app.get('/', (req,res)=>{
    res.send('<h1>Website connected</h1>')
})

//ALL USERS
//.find akan memasukkan semuanya ke dalam array. ini adalah function dari mongoose yang sangat membantu
// kalau tidak memakai mongoose, harus .toArray()
app.get('/users',(req,res)=>{
    User.find().then((err,results)=>{
        if(err){
            console.log(err)
        }else{
            //results adalah array of object
            res.send(results)
        }
    })
})

//FIND ONE USER
app.get('/users/:id', (req,res)=>{
    const data_id = req.params.id

    User.findById(data_id).then((userData)=>{
        res.send(userData)
    })
})

//READ ALL TASK
app.get('/tasks', async(req,res)=>{
    var allTask = await Task.find({})

    if(!allTask){
        res.send('Task not available')
    }

    res.send(allTask)
})

//READ TASK BY USER_ID
app.get('/tasks/:user_id', (req,res)=>{

    // Mencari user berdasarkan Id
    User.findById(req.params.user_id)
        //.populate adalah mempopulasikan Tasks yang ada di user dengan task yang terdapat di 'Task' Model
        .populate(
            {
                //ini pathnya ke property yang terdapat di dalam model. bukan ke ref.
                //ref itu ke model yang lainnya. tpi untuk mengaksesnya, itu harus ke property
                path: 'tasks',
                options:{
                    // sorting data secara descending berdasarkan field completed
                    // 1 = Ascending : false -> true
                    // -1 = Descending : true -> false
                    sort:{
                        completed:1
                    }
                }
            }
            ).exec() // Mencari data ke tasks berdasarkan task id untuk kemudian di kirim sebagai respon
        .then(user => {
            // Jika user tidak ditemukan
            if(!user){
                res.send('Unable to read tasks')
            }

            // Kirim respon hanya untuk field (kolom) tasks
            res.send(user.tasks)
        })
})

// READ AVATAR
app.get('/users/:id/avatar', async (req, res) => {
    // get user, kirim foto
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar){
        throw new Error('Foto / User tidak ada')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar) // default: ContentType : application/json
})

//======================UPDATE======================
// FINDBYIDANDUPDATE USER
app.patch('/users/:id',upload.single('ravatar'), (req,res)=>{
    //req.body adalah sebuah object.
    // jika Object.keys, akan dijadikan menjadi array. tetapi tidak mengubah data req.body dari object menjadi array
    let arrayBody = Object.keys(req.body)
    console.log(req.body)
    console.log(arrayBody)
    //req.body  = {name,email, age,password}
    // arrayBody [name,email,age,password]

    //akan di cek setiap key nya,apakah kosong valuenya atau tidak ('',undefined,null)
    // jika kosong, maka delete req.body.key
    arrayBody.forEach(key =>{
        if(!req.body[key]){
            delete req.body[key]
        }
    })

    console.log(hasil2)

    // const newName = req.body.name
    // const newEmail = req.body.email
    // const newAge = req.body.age
    // const newPass = req.body.password

    //dalam hal ini, password yang tidak ada updatenya
    //req.body  = {name,email, age}
    // ini memasukkan ke dalam arrayBody menjadi array lagi supaya di dalam user.findById dapat di foreach mana saja dapat yang akan diupdate
    //yaitu array yang ada di bawah
    arrayBody = Object.keys(req.body)
    // arrayBody [name,email,age]
    const id_data = req.params.id

    User.findById(id_data).then(user=>{
        if(!user){
            //ini harus pakai return supaya program tidak melanjutkan baca yang bagian bawah
            return res.send('User not found')
        }

        //update user
        arrayBody.forEach(key=>{
            user[key] = req.body[key]
        })

        sharp(req.file.buffer).resize({width:250}).png().toBuffer().then(buffer=>{
            
            user.avatar = buffer
            // user.name = newName
            // user.email = newEmail
            // user.age = newAge
            // user.password = newPass

        // //.save() adalah method dari mongoose untuk menyimpan data yang kita ubah ke mongodb
            user.save().then(()=>{
                res.send('Update Photo Profile Berhasil')
            })
        })
    })
})

//patch task so that completed:true
// patch dan get membutuhkan /:id karena express harus tau :id mana yang akan di get atau update
// UPDATE TASK BY USERID AND TASKID
app.patch('/tasks/:userid/:taskid', (req, res) => {
    const data_userid = req.params.userid
    const data_taskid = req.params.taskid
    // Menemukan user by id
    User.findById(data_userid)
        .then(user => {
            if(!user) {
                return res.send('User tidak ditemukan')
            }

            console.log(user)
            // Menemukan task by id
            Task.findOne({_id: data_taskid})
                .then(task => {
                    if(!task) {
                        return res.send('Task tidak ditemukan')
                    }

                    task.completed = !task.completed

                    task.save()
                        .then(()=>{
                            res.send('Selesai dikerjakan')
                        })
                })
        })

})

//======================DELETE======================
// DELETE JUGA MEMBUTUHKAN :id karena delete harus specify id mana yang mau di delete
//DELETE USER findbyidanddelete
app.delete('/users/:id', (req,res)=>{
    const id_data = req.params.id

    User.findByIdAndDelete(id_data).then(user=>{
        if(user){
            res.send({
                message: user.name + ' has been deleted',
                user: user
            })
        }else{
            res.send({
                message:'User with id '+ id_data+ ' cannot be found',
                user: []
            })
        }
    }).catch(err=>{
        console.log(err)
        res.send(err)
    })
})

// DELETE ONE TASK BY ID 
app.delete('/users/:id', async(req,res)=>{
    const id_data = req.params.id

    try{
        //await literally makes JavaScript wait until the promise settles, and then go on with the result
        // promise anggapan adalah janji. dimana nantinya akan ditepati ketika di call di .then atau dipanggil
        //Promises in JavaScript represent processes which are already happening, which can be chained with callback functions.
        //wait till Task.findByIdAndDelete resolves, then insert it into the var hasil. then res.send
        var hasil = await Task.findByIdAndDelete(id_data)
        res.send(hasil+ ' has been deleted')
    }catch(err){
        res.send(err)
    }

})


//DELETE TASK
app.delete('/tasks/:task_id', (req,res)=>{
    const task_id = req.params.task_id

    
    Task.findByIdAndDelete({_id:task_id}).then((task)=>{
        res.send(task)
    })
})

//DELETE TASK BY ID



//====PORT LISTEN====
app.listen(port, ()=>{
    console.log('Connected to port ' + port)
})

/*
ini digunakan bersama dengan ASYNC dan AWAIT
CONTOH TRY DAN CATCH

var value1 = 5

try{
    var hasil = value1 + value2
    console.log(hasil)
} catch(error){
    //catch akan dijalankan jika di bagian try, terdapat kode yang error
    console.log(error)
    console.log('hai')
}
*/