//====API====
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/user.js')

const port = 2019
const URL = 'mongodb://127.0.0.1:27017/jc9_mongoose'

app.use(express.json())

// ====MONGOOSE====
mongoose.connect(URL, {
    // parser string URL
    useNewUrlParser: true,
    useCreateIndex: true
})

// ====ROUTES====
app.get('/', (req,res)=>{
    res.send('<h1>Website connected</h1>')
})

app.get('/users', (req,res)=>{
    const {name,email,password,age} = req.query

    const nameData = name
    const emailData = email
    const passwordData = password
    const ageData = age



})

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

    person.save().then(()=>{
        console.log('User inserted')
    })
})

//====PORT LISTEN====
app.listen(port, ()=>{
    console.log('Connected to port ' + port)
})