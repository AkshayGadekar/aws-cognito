exports.validateFields = (fields) => {
    const fieldsArray = Object.entries(fields)

    for (const [key, value] of fieldsArray) {
        if (!value) throw new Error(`Field ${key} is required`)
        
        if (key === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Invalid email')
        }

        if (key === 'password') {
            // As per password policy mentioned in serverless.yml, password must have at least 8 characters
            // and contain at least one lowercase letter, one uppercase letter, one number, and one special character
            if (value.length < 8) throw new Error('Password must be at least 8 characters long')
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?`~]).+$/.test(value)) {
                throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
            }
        }

        if (key === 'code') {
            // Code must be a number
            if (!/^[0-9]{4,10}$/.test(value)) throw new Error('Invalid code')
        }

        if (key === 'newPassword') {
            if (value.length < 8) throw new Error('New password must be at least 8 characters long')
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?`~]).+$/.test(value)) {
                throw new Error('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
            }
        }

        if (key === 'name') {
            // Allow letters, spaces, hyphens, apostrophes for names (e.g., "Mary-Jane O'Connor")
            if (!/^[a-zA-Z\s\-']+$/.test(value)) throw new Error('Name must contain only letters, spaces, hyphens, and apostrophes')
            if (value.length < 2) throw new Error('Name must be at least 2 characters long')
            if (value.length > 50) throw new Error('Name must be less than 50 characters')
        }

        if (key === 'phoneNumber') {
            // AWS Cognito requires E.164 format: +[country code][number] (e.g., +1234567890)
            if (!/^\+[1-9]\d{1,14}$/.test(value)) throw new Error('Invalid phone number. Must be in E.164 format (e.g., +1234567890)')
        }

        if (key === 'gender') {
            // Common gender values - adjust based on your requirements
            const allowedGenders = ['male', 'female', 'other', 'prefer-not-to-say', 'm', 'f', 'o']
            if (!allowedGenders.includes(value.toLowerCase())) {
                throw new Error('Invalid gender. Must be one of: male, female, other, prefer-not-to-say, M, F, O')
            }
        }

        if (key === 'timeZone') {
            // Validate IANA timezone format (e.g., America/New_York, Asia/Kolkata, Europe/London)
            // Common timezone regex pattern
            if (!/^[A-Za-z_]+\/[A-Za-z_]+$/.test(value)) throw new Error('Invalid timezone format. Must be in IANA format (e.g., America/New_York, Asia/Kolkata)')
            
            // Additional check: validate against a list of valid timezones
            try {
                // Check if date can be formatted with this timezone
                Intl.DateTimeFormat(undefined, { timeZone: value })
            } catch (e) {
                throw new Error('Invalid timezone. Timezone not recognized.')
            }
        }

        if (key === 'birthdate') {
            // AWS Cognito uses ISO 8601 format: YYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid birthdate format. Must be YYYY-MM-DD (e.g., 1990-01-15)')
            
            // Validate date is valid and not in future
            const date = new Date(value)
            if (isNaN(date.getTime())) throw new Error('Invalid birthdate. Date is not valid.')
            
            const today = new Date()
            if (date > today) throw new Error('Invalid birthdate. Birthdate cannot be in the future.')
            
            // Check reasonable age (e.g., at least 13 years old, not more than 150 years old)
            const age = today.getFullYear() - date.getFullYear()
            const monthDiff = today.getMonth() - date.getMonth()
            const dayDiff = today.getDate() - date.getDate()
            const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age
            
            if (actualAge < 13) throw new Error('Invalid birthdate. User must be at least 13 years old.')
            if (actualAge > 150) throw new Error('Invalid birthdate. Age seems unrealistic.')
        }

        if (key === 'picture') {
            // Validate URL format
            const url = new URL(value)
            // Check if it's http or https
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Invalid picture URL. Must be HTTP or HTTPS.')
            }
            // Check if it's a valid image URL (optional - can be more lenient)
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            const pathname = url.pathname.toLowerCase()
            const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext))
            if (!hasImageExtension) throw new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp are allowed.')
            
            // Check URL length (AWS Cognito attribute limit is 2048 characters)
            if (value.length > 2048) throw new Error('Picture URL must be less than 2048 characters.')
        }

        if (key === 'filename') {
            // As per AWS Cognito attribute limit, filename must be less than 255 characters
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            const ext = value.toLowerCase().substring(value.lastIndexOf('.'))
            if (!allowedExtensions.includes(ext)) throw new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp are allowed.')
            if (value.length > 255) throw new Error('Filename must be less than 255 characters.')
        }

        if (key === 'fileType') {
            // As per AWS Cognito attribute limit, file type must be less than 255 characters and must be a valid image type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(value)) throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
        }
        
    }
}
