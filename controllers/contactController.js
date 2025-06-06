// Submit contact form
const Contact = require('../models/contactSchema');
const transporter = require('../utils/emailConfig');

const submitContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        // Create new contact
        const contact = await Contact.create({
            name,
            email,
            phone,
            message
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, // Email where you want to receive contacts
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // Send confirmation email to user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting us',
            html: `
                <h2>Thank you for reaching out!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you soon.</p>
                <p>Your message:</p>
                <p><em>${message}</em></p>
                <br>
                <p>Best regards,</p>
                <p>Your Blog Team</p>
            `
        };

        // Send emails
        await Promise.all([
            transporter.sendMail(mailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        // Send response
        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            contact
        });

    } catch (error) {
        console.error("Contact submission error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            contacts
        });
    } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
};

module.exports = {
    submitContact,
    getAllContacts
};