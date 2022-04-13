const mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

// var validate = require('mongoose-validator')

// const  nameValidator = [
//     validate({
//         validator: 'matches',
//         arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
//         message: 'Name must be at least 3 characters, max 30, no special characters or numbers, must have space in between name.'
//     }),
//     validate({
//         validator: 'isLength',
//         arguments: [3, 20],
//         message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
//     })
// ];

// const emailValidator = [
//     validate({
//         validator: 'matches',
//         arguments: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/,
//         message: 'Email must be at least 3 characters, max 40, no special characters or numbers, must have space in between name.'
//     }),
//     validate({
//         validator: 'isLength',
//         arguments: [3, 40],
//         message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
//     })
// ];
// const mobileValidator = [
//     validate({
//         validator: 'matches',
//         arguments: /^((\+)?(\d{2}[-]))?(\d{10}){1}?$/,
//         message: 'Mobile number must be 10 digits.'
//     }),
//     validate({
//         validator: 'isLength',
//         arguments: [10, 15],
//         message: 'Mobile number should be between {ARGS[0]} and {ARGS[1]} characters'
//     })
// ];
const newSchema = new mongoose.Schema({
    
    username: {
        type: String,
        // required:true
        //  validate: nameValidator 
        
    },

    password:{
        type:String,
        
    },
    email:{
        type:String,
        unique:true,
        // required: true, lowercase:true, unique: true, validate: emailValidator
    },
    phone:{
         type: String
        //   required: true, unique: true, validate: mobileValidator
    },
    profile_file:{
        type:String
    },
    profile_url:{
   type:String
    }

   
})
newSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err); // Exit if error is found
        user.password = hash; // Assign the hash to the user's password so it is saved in database encrypted
        next(); // Exit Bcrypt function
    });
});

newSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password); 
};
module.exports = mongoose.model("New", newSchema);
