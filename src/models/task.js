const mongoose = require('mongoose')

var taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model("Task",taskSchema)