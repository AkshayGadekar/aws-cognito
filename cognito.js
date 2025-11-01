const { CognitoIdentityProviderClient, DescribeUserPoolCommand, AdminUpdateUserAttributesCommand, AdminConfirmSignUpCommand, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, GlobalSignOutCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand, GetUserCommand, UpdateUserAttributesCommand, DeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const region = process.env.REGION
const bucket = process.env.S3_BUCKET_NAME
const UserPoolId = process.env.COGNITO_USER_POOL_ID
const ClientId = process.env.COGNITO_CLIENT_ID

const client = new CognitoIdentityProviderClient({
    region
})

const s3Client = new S3Client({
    region
})

exports.signUp = async (Username, Password, attributes) => {
    const command = new SignUpCommand({ ClientId, Username, Password, UserAttributes: attributes })

    await client.send(command)
}

exports.isEmailAutoVerified = async () => {
    const command = new DescribeUserPoolCommand({
        UserPoolId
    })
    
    const response = await client.send(command)
    const autoVerifiedAttributes = response.UserPool?.AutoVerifiedAttributes || []
    
    return autoVerifiedAttributes.includes('email')
}

exports.markEmailAsVerified = async (email) => {
    const command = new AdminUpdateUserAttributesCommand({
        UserPoolId,
        Username: email,
        UserAttributes: [
            { Name: "email_verified", Value: "true" },
        ]
    })

    await client.send(command)
}

exports.confirmAccountManually = async (email) => {
    const command = new AdminConfirmSignUpCommand({
        UserPoolId,
        Username: email,
    })

    await client.send(command)
}

exports.confirmAccountByCode = async (email, confirmationCode) => {
    console.log('Confirming sign up for email:', email, 'with confirmation code:', confirmationCode.toString())
    const command  = new ConfirmSignUpCommand({
        ClientId,
        Username: email,
        ConfirmationCode: confirmationCode.toString()
    })

    await client.send(command)
}

exports.signIn = async (email, password) => {
    const command = new InitiateAuthCommand({
        ClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    })

    const response = await client.send(command)

    return response
}

exports.signOut = async (AccessToken) => {
    const command = new GlobalSignOutCommand({
        AccessToken
    })

    await client.send(command)
}

exports.forgotPassword = async (email) => {
    const command = new ForgotPasswordCommand({
        ClientId,
        Username: email
    })

    await client.send(command)
}

exports.confirmForgotPassword = async (email, code, newPassword) => {
    const command = new ConfirmForgotPasswordCommand({
        ClientId,
        Username: email,
        ConfirmationCode: code.toString(),
        Password: newPassword
    })

    await client.send(command)
}

exports.getUserInfo = async (AccessToken) => {
    const command = new GetUserCommand({
        AccessToken
    })

    const response = await client.send(command)

    return response
}

exports.updateUserInfo = async (AccessToken, attributes) => {
    const command = new UpdateUserAttributesCommand({
        AccessToken,
        UserAttributes: attributes
    })

    await client.send(command)
}

exports.deleteUser = async (AccessToken) => {
    const command = new DeleteUserCommand({
        AccessToken
    })

    await client.send(command)
}

exports.uploadPicture = async (AccessToken, picture) => {
    const command = new UpdateUserAttributesCommand({
        AccessToken,
        UserAttributes: [{ Name: 'picture', Value: picture.url }]
    })

    await client.send(command)

    return picture.url
}

exports.generatePresignedUrl = async (filename, fileType, user) => {
    const sub = user.attributes.sub
    
    // Create unique key with user identifier
    const key = `profile-pictures/${sub}/${Date.now()}-${filename}`
    
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: fileType
    })
    
    const url = await getSignedUrl(s3Client, command, { 
        expiresIn: 3600 
    })
    
    return {
        url,
        pictureUrl: `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    }
}

exports.getPresignedPictureUrl = async (pictureUrl) => {
    const urlMatch = pictureUrl.match(/\.amazonaws\.com\/(.+)$/)
    if (!urlMatch || !urlMatch[1]) {
        throw new Error('Invalid picture URL format')
    }
    
    const key = urlMatch[1]
    
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    })
    
    const presignedUrl = await getSignedUrl(s3Client, command, { 
        expiresIn: 3600 * 24
    })
    
    return presignedUrl
}
