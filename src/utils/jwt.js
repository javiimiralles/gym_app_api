import jwt from 'jsonwebtoken';

export const generateJWT = (uid, role) => {

    return new Promise((resolve, reject) => {

        const payload = {
            uid,
            role
        }

        jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: '1y'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('The JWT could not be generated');
            } else {
                resolve(token);
            }
        });
    });
}