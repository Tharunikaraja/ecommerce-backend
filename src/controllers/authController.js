const User = require("../models/User")
const OTP = require("../models/OTP")
const generateOTP = require("../utils/generateOTP")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false
  const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return re.test(email)
}

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const normalizedEmail = email && String(email).trim().toLowerCase()

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.status(201).json({ message: "User registered successfully", token })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const normalizedEmail = email && String(email).trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.status(200).json({ message: "Login successful", token })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const normalizedEmail = email && String(email).trim().toLowerCase()
    if (!normalizedEmail) return res.status(400).json({ message: "Email is required" })

    if (!isValidEmail(normalizedEmail)) return res.status(400).json({ message: "Invalid email format" })

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }

    const otp = generateOTP()
    await OTP.deleteMany({ email: normalizedEmail })
    await OTP.create({ email: normalizedEmail, otp, expiresAt: Date.now() + 10 * 60 * 1000 })
    return res.status(200).json({ message: "OTP sent to email", otp })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    const normalizedEmail = email && String(email).trim().toLowerCase()
    if (!normalizedEmail || !otp) return res.status(400).json({ message: "Email and OTP are required" })

    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp })
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" })
    }
    if (otpRecord.expiresAt < Date.now()) {
      await OTP.deleteOne({ email: normalizedEmail, otp })
      return res.status(400).json({ message: "OTP expired" })
    }
    res.status(200).json({ message: "OTP verified" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = email && String(email).trim().toLowerCase()
    if (!normalizedEmail || !password) return res.status(400).json({ message: "Email and new password are required" })
    if (typeof password !== "string" || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" })

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword })
    await OTP.deleteMany({ email: normalizedEmail })
    res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
module.exports = { signup, login, forgotPassword, verifyOTP, resetPassword }
