const userModel = require('../models/userSchema')
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt')


const signup = async (req,res,next) => {
   const {name , email ,password, confirmPassword} = req.body;
   console.log({name , email ,password, confirmPassword});

   if(!name || !email || !password || !confirmPassword) {
         return res.status(400).json({
            success:false,
            message: "Every field is required"
         })
   }

   const validEmail = emailValidator.validate(email);
    if (!validEmail) {

        return res.status(400).json({
            success:false,
            message: "Please provide a valid email id"
         })
    }
    if(password!==confirmPassword) {
        return res.status(400).json({
            success:false,
            message: "passwor and confirmPassword doesn't match"
         })
    }

   try {
       const userInfo= userModel(req.body)
       const result = await userInfo.save();


       return res.status(200).json({
        succuess :true ,
        data : result
       });
       
   } catch (error) {
      if (error.code === 11000) {
         return res.status(400).json({
            success:false,
            message:'Account Already exists with  provided email id '
         })

      }
    return res.status(400).json({
        success: false,
        message : error.message
    })
    
   }
  
}



const signin = async (req,res) => {
    const {email, password} = req.body ;

    if(!email || !password) {
        return res.status(400).json({
            success:false,
            message: 'Every field is required'
        })
    }
       

    try {

        const user = await userModel.findOne({email}).select('+password');
     
    if(!user || !(await bcrypt.compare(password,user.password) )  ) {
        return res.status(400).json({
            success:false,
            message: 'invalid credentials'
        })
    }
      
    const token = user.jwtToken();
    user.password = undefined ;

    const cookieOption ={
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly : true
    };

    res.cookie("token" , token , cookieOption);
    res.status(200).json({
        success:true,
        data: user
    })
        
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
        
    }
    
}

const getUser = async(req,res,next) =>{
    const userId = req.user.id;

    try {
        const  user = await userModel.findById(userId)
        return res.status(200).json({
            success:true,
            data: user
        })
        
    } catch (error) {
        return res.status(400).json({
            success:false,
            message: "error in controller"
        })
    }

}




const logout =(req,res) => {

    try {
        const cookieOption = {
            expires: new Date(),
            httpOnly : true
        };
        res.cookie("token", null , cookieOption);
        res.status(200).json({
            success: true ,
            message: "Logged out"
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message: error.message
        })
        
    }



}

module.exports= {
    signup,
    signin,
    getUser,
    logout,
}