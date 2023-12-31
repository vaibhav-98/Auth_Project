const mongoose = require('mongoose')
const JWT = require ('jsonwebtoken')
const bcrypt = require('bcrypt')
const {Schema} = mongoose;

const userSchema = new Schema ( {
   name : {
       type:String,
       required:[true, 'user name is Required'],
       minLength: [5, 'Name must be at least 5 char '],
       maxLength:[25, 'Name must be at least 50 char'],
       trim : true
   },
   email:{
      type:String,
      required:[true, 'user email is required'],
      unigue:[true, 'already registered'],
      lowercase: true
   },
   password:{
       type:String,
       select:false,
   },
   forgotPasswordToken:{
       type:String,
   },
   forgotPasswordExpiryDate:{
      type:String,
   }
},{timestamps:true});


userSchema.pre('save', async function (next) {
       if(!this.isModified('password')) {
        return next();
       }
       this.password = await bcrypt.hash(this.password,10);
       return next();
})




userSchema.methods = {
    jwtToken () {
        return JWT.sign({id: this._id, email: this.email},
            process.env.SECRET,
            { expiresIn :'24h'}
            )
    }
}

const userModel = mongoose.model('user3', userSchema)
module.exports= userModel
