require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Shabek 3a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Tarteeb l ma3loumet bl database (Schema)
const leadSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

// Khaleq l Model
const Lead = mongoose.model('Lead', leadSchema);

// Step 4: Tjheez Nodemailer la yib3at l email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Step 2 & 4: Estielam l data, save 3a MongoDB, w b3at Email (POST request)
app.post('/api/contact', async (req, res) => {
    try {
        // Jib l ma3loumet mn l request
        const { name, phone, email, message } = req.body;

        // 1. Sajjil l ma3loumet bl database (MongoDB)
        const newLead = new Lead({ name, phone, email, message });
        await newLead.save();

        // 2. B3at l Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // L email 7a ywslak 3a nafs 7sebak l Gmail
            subject: 'New Lead - Hammoud Real Estate',
            text: `You got a new message from the website!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Message received, saved, and email sent!' });
    } catch (error) {
        console.error('Error saving lead or sending email:', error);
        res.status(500).json({ success: false, message: 'Error saving data or sending email.' });
    }
});

app.get('/', (req, res) => {
    res.send('Hammoud Real Estate Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});