const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const cors = require("cors");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(express.static(path.join(__dirname, 'public')));


//DATABASE
mongoose.connect('mongodb+srv://admin:Admin123@donortrack.fr6p2.mongodb.net/DonorTrackDB?retryWrites=true&w=majority'
, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


    const userSchema = new mongoose.Schema({
      donorName: String,
      donorPhone: String,
      donorEmail: String,
      donorAge: Number,
      gender: String,
      state: String,
      city: String,
      donorBloodGroup: String,
      isVerified: Boolean,
      dtCoins: Number,
      locations: [
          {
              label: String,
              latitude: Number,
              longitude: Number
          }
      ]
  });
  
  const User = mongoose.model('donors', userSchema);
  




//API ENDPOINTS
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/main/index.html');
})
app.get('/requestBlood', (req, res) => {
  res.sendFile(__dirname + '/public/requestBlood/index.html');
})
app.get('/auth',(req,res)=>{
  res.sendFile(__dirname + '/public/authentication/index.html');
})




// const accountSid = "AC122f8454ba8f1b48cc924acfd3e1e133";
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

// client.calls.create({
//   url: "http://demo.twilio.com/docs/voice.xml",
//   to: "+919902227821",
//   from: "+17753699722",
// })
// .then(call => console.log(call.sid));



// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'aswinja05@gmail.com',
      pass: 'iqyr qvkp ryfc esxj' // Use an App Password if 2FA is enabled
  }
});



let otpStorage = {};
// Generate a random OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP email
function sendOTPEmail(email, otp, text) {
  const mailOptions = {
      from: 'aswinja05@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: text
  };

  return transporter.sendMail(mailOptions);
}

// Endpoint to request OTP
app.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).send('Email is required');
  }

  const otp = generateOTP();

  try {
      await sendOTPEmail(email, otp, `Your OTP code is: ${otp}`);

      otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP valid for 5 minutes
      res.send(JSON.stringify('OTP sent to your email'));
  } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).send('Error sending OTP');
  }
});

// Endpoint to save new user details
app.post('/save-new-user', async (req, res) => {
  const { name, email, age, gender, phone, state, city, bloodType } = req.body;

  if (!name || !email || !phone) {
      return res.status(400).send('Name, phone number, and email are required');
  }

  try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).send('User already exists');
      }

      // Create a new user record
      user = new User({
          donorName: name,
          donorEmail: email,
          donorAge: age,
          gender,
          donorPhone: phone,
          state,
          city,
          donorBloodGroup: bloodType,
          isVerified: true // Mark as verified since OTP was confirmed
      });

      await user.save();
      res.send(JSON.stringify({
          message: 'User Created Successfully',
          isNewUser: false,
          redirectTo: '/main', // Redirect URL
          isLoggedIn: true,      // Login status
          cId: user._id
      }));
  } catch (error) {
      console.error('Error saving new user:', error);
      res.status(500).send('Internal server error');
  }
});



// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
      return res.status(400).send(JSON.stringify('Email and OTP are required'));
  }

  const storedOtpData = otpStorage[email];

  if (!storedOtpData) {
      return res.status(400).send(JSON.stringify('OTP not requested'));
  }

  if (Date.now() > storedOtpData.expiresAt) {
      return res.status(400).send(JSON.stringify('OTP has expired'));
  }

  if (storedOtpData.otp === otp) {
      delete otpStorage[email];
      const user = await User.findOne({ email });
      if (!user) {
          res.send(JSON.stringify({
              message: 'You are a new user. Please provide your name and phone number.',
              isNewUser: true
          }));
      }
      else {
          res.send(JSON.stringify({
              message: 'OTP verified successfully',
              isNewUser: false,
              // redirectTo: 'back', // Redirect URL
              redirectTo: '/main',
              isLoggedIn: true,      // Login status
              cId: user._id
          }));
      }
  } else {
      res.status(400).send(JSON.stringify('Invalid OTP'));
  }
});







app.listen(3000,()=>{
    console.log(`Running in 3000`)
})