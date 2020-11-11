import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorMessage, status } from '../helpers/status';
import env from '../../env';

dotenv.config();

const verifyToken = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        errorMessage.error = 'Token not provided';
        return res.status(status.bad).send(errorMessage);
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        //   email,
        //   user_id,
        //   name,
        //   username,

        req.user = {
            email: decoded.email,
            user_id: decoded.user_id,
            name: decoded.name,
            username: decoded.username,
        };

        next();
    } catch (error) {
        errorMessage.error = 'Failed To Authenticate';
        return res.status(status.unauthorized).send(errorMessage);
    }
};

export default verifyToken;