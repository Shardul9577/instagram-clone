const mongoose = require('mongoose')

const BlogSchema = new mongoose.Schema({
    photo:{
       url:{
        type:String,
        required: [true, "Please provide the photo"]
       }
    },
    description:{
        type:String,
        required: [true, "Please provide the description"]
    },
    user:[
        {name:{ 
        type:String,
        required:true
        },
        id:{
            type:String,
            required:true    
        }}
    ], 
    createdAt:{
        type:Date,
        default:Date.now(),
        required:true
    }

})

const Blog = mongoose.model("Blog", BlogSchema)

module.exports = Blog