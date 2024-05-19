const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/blogweb')
.then(()=>{
    console.log("The database is connected successfully");
})
.catch((error)=>{
    console.log(error,"The database connection has some error");
})