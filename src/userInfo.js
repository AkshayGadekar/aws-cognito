const { updateUserInfo, deleteUser, generatePresignedUrl, getPresignedPictureUrl } = require('../cognito')
const { authMiddleware } = require('./middleware/auth')
const { validateFields } = require('./validations')
const { makeAttributes } = require('./helpers')

const getUserInfoHandler = async (event) => {
    try {
        const userInfo = event.user
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User information retrieved successfully",
                user: userInfo,
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


const updateUserHandler = async (event) => {
    try {
        const accessToken = event.accessToken
        const { name, phoneNumber, gender, timeZone, birthdate, picture } = JSON.parse(event.body)

        const attributes = makeAttributes({name, phoneNumber, gender, timeZone, birthdate, picture})

        await updateUserInfo(accessToken, attributes)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User information updated successfully"
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

const generatePresignedUrlHandler = async (event) => {
    try {
        const user = event.user
        const { filename, fileType } = JSON.parse(event.body)
        validateFields({ filename, fileType })
        
        const { url, pictureUrl } = await generatePresignedUrl(filename, fileType, user)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Presigned URL generated successfully",
                uploadUrl: url,
                pictureUrl: pictureUrl,
                expiresIn: 3600
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

const getPresignedPictureUrlHandler = async (event) => {
    try {
        const { pictureUrl } = JSON.parse(event.body)
        validateFields({ picture: pictureUrl })
        
        const presignedUrl = await getPresignedPictureUrl(pictureUrl)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Presigned picture URL generated",
                presignedUrl: presignedUrl,
                expiresIn: 86400
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


const deleteUserHandler = async (event) => {
    try {
        const accessToken = event.accessToken
        await deleteUser(accessToken)
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User deleted successfully"
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

exports.userInfo = authMiddleware(getUserInfoHandler)
exports.updateUser = authMiddleware(updateUserHandler)
exports.generatePresignedUrl = authMiddleware(generatePresignedUrlHandler)
exports.getPresignedPictureUrl = authMiddleware(getPresignedPictureUrlHandler)
exports.deleteUser = authMiddleware(deleteUserHandler)
