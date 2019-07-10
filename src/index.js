//API
const express = require('express')
const app = express()
const mongoose = require('mongoose')

const port = 2019
const URL = 'mongodb://127.0.0.1:27017/jc9_mongoose'

app.use(express.json())

// MONGOOSE
mongoose.connect(URL, {
    // parser string URL
    useNewUrlParser: true,
    useCreateIndex: true
})

const User = mongoose.model('User', {
    name: String,
    age: Number
})

var person = new User({name:'Alvin', age:24})

person.save().then(()=>{
    console.log('Data berhasil diinput')
})

app.listen(port, ()=>{
    console.log('Connected to port ' + port)
})