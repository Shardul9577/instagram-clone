const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.isAuthenticated = async (req, res, next) => {
    // Assuming you have cookie-parser middleware set up
    const token = req.cookies.token; // Corrected way to access the token

    // console.log(token);

    if (!token) {
        return res.status(401).send('Please login to access this resource'); // Added return to prevent further execution
    }

    try {
        const decodedData = jwt.verify(token , "vmvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvnvvnvnvnvnvnvnv");

        req.user = await User.findById(decodedData._id);

        // console.log(user , "user");

        next();
    } catch (error) {
        // Handle token verification errors (e.g., token expired, invalid token)
        return res.status(403).send('Invalid token, please log in again');
    }
};

exports.autorizeRoles = (...roles)=>{
   return (req,res,next)=>{

    if (!roles.includes(req.user.role)) {
        return next(
                    res.status(401).send("User is not allowed to access the functionality to add products")
        )
    }

    next()

   }
}
