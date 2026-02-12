const User=require("../models/User")
const OTP=require("../models/OTP")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const generateOTP=require("../utils/generateOTP")
const generateToken=require("../utils/generateToken")
const hashPassword=require("../utils/hashPassword")
const {sendEmail}=require("../services/emailService")
const signup=async(req,res)=>{
  try{
    const{name,email,password}=req.body
    if(!name||!email||!password){
      return res.status(400).json({message:"All fields are required"})
    }
    emailregex=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if(!emailregex.test(email)){
        return res.status(400).json({message:"Invalid email format"})
    }
    if(password.length<6){
        return res.status(400).json({message:"Password must be at least 6 characters"})
    }
    const existingUser=await User.findOne({email})
    if(existingUser){
      return res.status(400).json({message:"User already exists"})
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const user=await User.create({
      name,
      email,
      password:hashedPassword
    })
    const token=jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET,
      {expiresIn:"1d"}
    )

    res.status(201).json({
      message:"User registered successfully",
      token
    })
  }catch(error){
    res.status(500).json({message:"Server error"})
  }
}
const login=async(req,res)=>{
  try{
    const{email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({message:"Invalid credentials"})
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
      return res.status(400).json({message:"Invalid credentials"})
    }
    const token=jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET,
      {expiresIn:"1d"}
    )
    res.status(200).json({
      message:"Login successful",
      token
    })
  }catch(error){
    res.status(500).json({message:"Server error"})
  }
}
const forgotPassword=async(req,res)=>{
  try{
    const{email}=req.body
    if(!email){
      return res.status(400).json({message:"Email is required"})
    }
    const user=await User.findOne({email})
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const otp=generateOTP()
    await OTP.deleteMany({email})
    await OTP.create({
      email,
      otp,
      expiresAt:new Date(Date.now()+5*60*1000)
    })
    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP is ${otp}. It expires in 5 minutes.`
    )
    res.status(200).json({
      message:"OTP sent to email"
    })
  }catch(error){
    console.error("Forgot password error:",error)
    res.status(500).json({message:"Server error"})
  }
}
const verifyOTP= async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }
    const otpRecord = await OTP.findOne({ email, otp })
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteMany({ email }) 
      return res.status(400).json({ message: "OTP expired" })
    }
    await OTP.deleteMany({ email }) 

    const tempToken = generateToken({ email }, "10m") 
    res.status(200).json({
      message: "OTP verified",
      token: tempToken
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token) return res.status(401).json({ message: "Token missing" })
    if (!newPassword) return res.status(400).json({ message: "New password is required" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ email: decoded.email })
    if (!user) return res.status(404).json({ message: "User not found" })

    user.password = await hashPassword(newPassword)
    await user.save()
    await OTP.deleteMany({ email: decoded.email })

    res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }
    res.status(500).json({ message: "Server error" })
  }
}

module.exports={signup,login,forgotPassword,verifyOTP,resetPassword}
