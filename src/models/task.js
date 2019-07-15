const mongoose = require('mongoose')

var taskSchema = new mongoose.Schema(
    {
    description:{
        type:String,
        required:true,
        trim:true
        },
    completed:{
        type:Boolean,
        default: false
        },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
        }
    },
    {
        //ini akan data the type DATE TIME, dalam bentuk createdAt dan EditiedAt secara otomatis
    timestamps: true
    }
    
)

module.exports = mongoose.model("Task",taskSchema)