import { client, sender } from "./mailtrap.config.js"
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js"

export const sendVerificationEmail = async(email, verificationToken) => {
    const recipient = [{email}]

    try {
        const response = await client.send ({
            from: sender,
            to: recipient,
            subject: "Xác thực email của bạn",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email sent successfully", response)
    } catch (error) {
        console.log(error)
        throw new Error(`Error sending email: ${error}`)
    }
}