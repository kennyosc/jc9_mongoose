//=====================API======================
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/user.js')
const Task = require('./models/task.js')

const port = 2019
const URL = 'mongodb://127.0.0.1:27017/jc9_mongoose'

app.use(express.json())

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

// POST ONE TASK
app.post('/task/input', (req,res)=>{
    const description_data = req.body.description

    const task = new Task({
        description: description_data
    }).then(results =>{
        res.send({
            message: 'Task berhasil diinput',
            description: description_data
        })
    })
})



//======================READ======================
//HOME
app.get('/', (req,res)=>{
    res.send('<h1>Website connected</h1>')
})

//ALL USERS
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

    User.findById(data_id).then((err,userData)=>{
        if(err){
            console.log(err)
        } else{
            res.send(userData)
        }
    })
})

//======================UPDATE======================
// FINDBYIDANDUPDATE USER
app.patch('/users/:id', (req,res)=>{
    const id_data = req.params.id
    const newName = req.body.name

    User.findById(id_data).then(results=>{
        //results = {_id,name,email,password,age} -> object yang dari find
        results.name = newName
        
        //.save() adalah method dari mongoose untuk menyimpan data yang kita ubah ke mongodb
        results.save()
        res.send('Update telah berhasil')
    })
})

//patch task so that completed:true
// patch dan get membutuhkan /:id karena express harus tau :id mana yang akan di get atau update
app.patch('/users/:id', (req,res)=>{
    const id_data = req.params.id

    Task.findByIdAndUpdate(id_data).then(task=>{
        task.completed = !task.completed
        res.send('Task completed')
    }).catch(err){
        res.send(err)
    }
})


//======================DELETE======================

//DELETE USER findbyidanddelete
app.delete('/users/:id', (req,res)=>{
    const id_data = req.params.id

    User.findByIdAndDelete(id_data).then(user=>{
        if(user){
            res.send({
                message:`${user.name} has been deleted `,
                user: user
            })
        }else{
            res.send({
                message: `User with id ${id_data} cannot be found`,
                user: []
            })
        }
    }).catch(err=>{
        console.log(err)
        res.send(err)
    })
})

// DELETE ONE TASK

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