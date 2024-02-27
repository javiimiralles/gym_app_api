import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {

    const token = req.header('x-token') || req.query.token;

    if (!token) {
        return res.status(400).json({
            ok: false,
            msg: 'The authorization token is missing'
        });
    }

    try {
        const { uid, ...object } = jwt.verify(token, process.env.JWTSECRET);

        req.uidToken = uid;
        next();

    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Invalid token'
        })
    }
}