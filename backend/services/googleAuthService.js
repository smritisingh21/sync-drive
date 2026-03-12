import {OAuth2Client} from 'google-auth-library'

const clientId = '161294537714-4q7nu1eifqguppt1f7jcgp4h73ggcka8.apps.googleusercontent.com'

const client= new OAuth2Client({clientId})

export async function verifyToken (idToken) {
    const loginTicket =  await client.verifyIdToken({
        idToken,
        audience :clientId,
    })
    const user = loginTicket.getPayload();
    return user;
}