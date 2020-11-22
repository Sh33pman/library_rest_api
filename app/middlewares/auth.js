// @ts-check
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorMessage, status } from '../helpers/status';
import env from '../../env';
import dbQuery from '../db/dev/db_query';

dotenv.config();

const verifyToken = async (req, res, next) => {

    const { authorization } = req.headers;

    if (!authorization) {
        errorMessage.error = 'Token not provided';
        return res.status(status.bad).send(errorMessage);
    }

    var token = authorization.split(' ')[1];

    if (!token) {
        errorMessage.error = 'Token not provided';
        return res.status(status.bad).send(errorMessage);
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        let user = await isUserOnBd(decoded.user_id)

        if (user) {
            console.log(user)
            req.user = {
                email: user.email,
                user_id: user.user_id,
                name: user.name,
                username: user.username,
            };

            console.log("========== USER IS ON DB ==========\n", req.user)
            next();
        } else {
            errorMessage.error = 'Failed To Authenticate';
            return res.status(status.unauthorized).send(errorMessage);
        }


    } catch (error) {
        errorMessage.error = 'Failed To Authenticate';
        return res.status(status.unauthorized).send(errorMessage);
    }
};

async function isUserOnBd(user_id) {
    try {
        const getAllCategoriesQuery = `SELECT * FROM users WHERE user_id=$1 `;
        console.log(getAllCategoriesQuery)
        const { rows } = await dbQuery.query(getAllCategoriesQuery, [user_id]);
        if (rows.length === 0) {
            return false
        }
        const dbResponse = (rows && rows[0]) || {};
        delete dbResponse.password;

        return dbResponse
    } catch (error) {
        console.log("---------ERROR WHILE FETCHING USERS-----------")
        console.log(error)
        // errorMessage.error = 'An error occured while trying to fetch users';
        return false
    }

}



export default verifyToken;