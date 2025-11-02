const { forgotPassword, confirmForgotPassword, changePassword } = require('../cognito')
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
    /**
     * if you want to change password for a user
     * this can be used to implement forgot password from your app side instead of using Cognito
     * trigger this from your app to change the password after implementing your own verification flow
     */

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

exports.changePassword = authMiddleware(changePasswordHandler)
