import jwt from 'jsonwebtoken';

export const infoToken = (token) => {
    return jwt.verify(token, process.env.JWTSECRET);
}