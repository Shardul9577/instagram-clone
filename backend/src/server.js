// This are all requirements which is needed in our website
require("../db/db");
require("dotenv").config();
const express = require("express");
const app = express();
const port = 8000;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const User = require("../model/userModel");
const cors = require('cors');
const cloudinary = require('cloudinary')
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")

const { isAuthenticated, autorizeRoles } = require("../utils/Authenticated");
const blog = require("../model/blogModel");
cloudinary.config({
    cloud_name:"diztzvzxi",
    api_key: "971776117993223" ,
    api_secret:"Wg1i2pkevL_cdG-2DWk5bTfgApE"
})



// The usable things of our website

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// // ________________________________________________________________________________________________

// // Users api of our website

app.post("/user/new", cors() , async (req, res) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar.url,{
      folder:"avatars",
      width:150,
      crop:"scale"
  })

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar: {
        url: myCloud.secure_url
      }
    });

    const token = await user.getJwtToken();
    console.log(token,"token");

    const options = {
      expire: new Date(
        Date.now() + 5 * 1000 * 60 * 60 * 24
      ),
      httpOnly: true,
    };

    res.cookie("token", token, options);

    await user.save();

    res
      .status(201)
      .send({user});
  } catch (error) {
    res
      .status(401)
      .send({error});
  }
});

app.get("/users", isAuthenticated, autorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find();

    console.log({users});

    res
      .status(201)
      .send({users});
  } catch (error) {
    res
      .status(401)
      .send({error});
  }
});

app.post("/user/login",cors() , async (req, res) => {
  try {
    const { email, password } = req.body;
    const specificUser = await User.findOne({ email });

    if (!specificUser) {
      return res
        .status(400)
        .send("Please enter the correct email and password!");
    }

    const comparePassword = await bcrypt.compare(
      password,
      specificUser.password
    );

    if (comparePassword) {
      const token = await specificUser.getJwtToken();
      const options = {
        expire: Date(
          Date.now() + 5 * 1000 * 60 * 60 * 24
        ),
        httpOnly: true,
      };
      res.cookie("token", token, options);

      await specificUser.save();
      res
        .status(200)
        .send({specificUser , token});
        
    } else {
      res.status(400).send({specificUser});
    }
  } catch (error) {
    res.status(500).send(`An error occurred: ${error}`);
  }
});

app.get("/users/logout",cors(), isAuthenticated , async (req, res) => {
  try {
    // Use findOne to find user by email
    const specificUser = await User.findOne({ email: req.body.email });
    console.log(specificUser);
    if (!specificUser) {
      return res.status(404).send("User not found");
    }
    // Assuming you want to invalidate all tokens or a specific one, add your logic in filter()
    // For example, to remove all tokens:
    specificUser.tokens = [];

    res.clearCookie("token");
    // Alternatively, to filter out a specific token, you might need additional information from req.body
    // specificUser.tokens = specificUser.tokens.filter(token => token !== theTokenToInvalidate);

    await specificUser.save();

    res.status(200).send("The user has been logged out successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("There is some error in logging out");
  }
});

// {*isAuthenticated*}

app.get("/users/:_id", cors(),isAuthenticated , async (req, res) => {
  try {
    const userDetails = await User.findById(req.params._id);

    // console.log(userDetails);

    res.send(userDetails);
  } catch (error) {
    res.send(error);
  }
});

app.delete( "/users/admin/:_id",cors(),isAuthenticated,autorizeRoles("admin"),async (req, res) => {
    try {
      const userDetails = await User.findById({_id:req.params._id});

      await userDetails.deleteOne()

      console.log(userDetails);

      res.send({userDetails});
    } catch (error) {
      res.status(401).send({error});
    }
  }
);

// // user api section get over here


// // Blogs api of our website

app.post("/blogs/newblog",cors(), async (req, res) => {

  const myCloud = await cloudinary.v2.uploader.upload(req.body.photo.url,{
    folder:"avatars",
    width:150,
    crop:"scale"
})

  try {
    const {
      description,
      createdAt
    } = req.body;
  
    const Blog = new blog({
      photo:{
        url:myCloud.secure_url
      },
      description,
      user:[{
        name:req.body.user[0].name,
        id:req.body.user[0].id
      }],
      createdAt
    })

    await Blog.save()

    res.status(201).send({Blog})

  } catch (error) {
    res.status(404).send(error)
  }

});

app.get("/blog/:_id" ,cors() , async(req,res,next)=>{
  try {

    const Blog = await blog.findById({_id:req.params._id})

    console.log(Blog);

    if (!Blog) {
      return next(res.send("Such a blog dosen't exist"))
    }

    res.status(201).send({Blog})
  } 
  catch (error) {
    res.status(401).send({error})
  }
})

app.get("/blogs/myblogs",cors(), async(req,res,next)=>{
  try {
    const Blog = await blog.find({id:req.body._id})

    console.log(Blog);

    if (!Blog) {
      return next(res.send("You have no orders yet !"))
    }

    res.status(201).send({Blog})

  } catch (error) {
    res.status(404).send(error)
  }
})

app.post("/blog/deleteblog",cors(), async(req,res,next)=>{
  try {
    const Blog = await blog.findById({_id:req.body._id})

    await Blog.deleteOne()
    await Blog.save()

    res.status(201).send({Blog})

  } catch (error) {
    res.status(400).send({error})
  }
})

app.get("/blogs",cors(), async(req,res,next)=>{
  try {
    const Blog = await blog.find()

    if (!Blog) {
      return next(res.status(401).send("You have no blogs yet !"))
    }

    res.status(201).send({Blog})

  } catch (error) {
    res.status(401).send({error})
  }
})

app.delete("/blogs/admin/deleteBlog/:_id",cors(), isAuthenticated , autorizeRoles("admin") , async(req,res,next)=>{
  try {
    const Blog = await blog.findOne({_id:req.params._id})

    await Blog.deleteOne()

    res.status(201).send({Order})

  } catch (error) {
    res.status(401).send({error})
  }
})

// // Blogs api section get over here

// ____________________________________________________________________________________________

// The UI Routing of our website

app.get("/", (req, res) => {
  res.send("This is a very nice website !");
});

app.listen(port, () => {
  console.log(`The website is live at port : ${port}`);
});