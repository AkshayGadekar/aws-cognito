const { forgotPassword, confirmForgotPassword, changePassword } = require('../cognito')
const { validateFields } = require('./validations')
const { authMiddleware } = require('./middleware/auth')

exports.forgotPassword = async (event) => {
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

exports.changePassword = authMiddleware(changePasswordHandler)
