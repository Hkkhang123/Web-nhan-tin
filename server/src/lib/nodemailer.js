import nodemailer from 'nodemailer';

// Configure the transporter for sending emails
// NOTE: You should use environment variables to store your email credentials securely.
// For example, process.env.EMAIL_USER and process.env.EMAIL_PASS
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // TODO: Replace with your email address
        pass: process.env.EMAIL_PASS,    // TODO: Replace with your app password
    }
});

/**
 * Sends an email using the configured transporter.
 * @param {string} to The recipient's email address.
 * @param {string} subject The subject of the email.
 * @param {string} html The HTML body of the email.
 */
export const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // TODO: Replace with your email address
        to,
        subject,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Error sending email');
    }
};