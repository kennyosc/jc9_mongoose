//=====================API======================
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/user.js')

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
app.post('/users/input', (req,res)=>{
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

    person.save().then((results)=>{
        res.send(results)
    }).catch(err=>{ // catch dibutuhkan untuk display error di postman
        //catch memiliki 1 parameter dimana, errornya berasal dari javascript
        res.send(err)
    })
})

// POST ONE TASK




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