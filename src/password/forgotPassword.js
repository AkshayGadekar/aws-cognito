const { forgotPassword, confirmForgotPassword, changePassword, adminSetUserPassword } = require('../cognito')
const { validateFields } = require('../validations')
const { authMiddleware } = require('../middleware/auth')

exports.forgotPassword = async (event) => {
    /**
     * if you want to reset password for a user
     * this will send the reset code to the email from Cognito
     */
    

    try {
        const { email } = JSON.parse(event.body)
        validateFields({ email })

        await forgotPassword(email)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Password reset initiated. Please check your email for the confirmation code."
            })
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: error.message,
                error: error.stack
            })
        }
    }
}

exports.confirmForgotPassword = async (event) => {
    /**
     * this will complete the password reset using the confirmation code sent to email from Cognito
     */

    try {
        const { email, code, newPassword } = JSON.parse(event.body)
        validateFields({ email, code, newPassword })

        await confirmForgotPassword(email, code, newPassword)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Password has been sucessfully reset."
            })
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: error.message,
                error: error.stack
            })
        }
    }
}

const changePasswordHandler = async (event) => {
    try {
        const accessToken = event.accessToken
        const { currentPassword, newPassword } = JSON.parse(event.body)
        validateFields({ currentPassword, newPassword })

        await changePassword(accessToken, currentPassword, newPassword)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Password has been successfully changed."
            })
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: error.message,
                error: error.stack
            })
        }
    }   
}

exports.resetPassword = async (event) => {
    /**
     * Custom forgot password flow:
     * 1. Your app sends OTP via your email service
     * 2. User verifies OTP (you handle this verification)
     * 3. Call this endpoint to reset password
     */
    
    try {
        const { email, newPassword } = JSON.parse(event.body)
        
        validateFields({ email, password: newPassword })
        
        await adminSetUserPassword(email, newPassword)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Password has been successfully reset."
            })
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: error.message,
                error: error.stack
            })
        }
    }
}

exports.changePassword = authMiddleware(changePasswordHandler)
