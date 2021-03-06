// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_query';
import {
    hashPassword, comparePassword, isValidEmail, validatePassword, isEmpty, generateUserToken
} from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';

const signupUser = async (req, res) => {
    const { email, name, username, password } = req.body;

    const hashedPassword = hashPassword(password);

    const createUserQuery = `INSERT INTO users(name, username, email, password) VALUES($1, $2, $3, $4)  returning *`;
    const values = [name, username, email, hashedPassword];

    try {

        const dbRes = await dbQuery.query(createUserQuery, values);
        if (dbRes.name == "error") {
            if (dbRes.code === '23505') {
                let details = dbRes.constraint.split('_')[1]
                console.log(details)
                errorMessage.error = `${details} was already taken. Plese select another one`;
                return res.status(status.conflict).send(errorMessage);
            }
            return res.status(status.error).send(errorMessage);
        }

        const dbResponse = dbRes.rows[0];
        delete dbResponse.password;
        delete dbResponse.token;

        const { email, name, user_id, username, password } = dbResponse
        const token = generateUserToken(email, user_id, name, username);

        successMessage.data = dbResponse;
        return res.status(status.created).send(successMessage);

    } catch (error) {
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'Email or Username was already taken. Plese select another one';
            return res.status(status.conflict).send(errorMessage);
        }

        errorMessage.error = 'Operation was not successful';
        errorMessage.message = 'Operation was not successful';
        console.log(error.code)
        return res.status(status.error).send(errorMessage);
    }
};


const siginUser = async (req, res) => {
    const { username, password } = req.body;

    try {

        const signinUserQuery = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await dbQuery.query(signinUserQuery, [username]);
        const dbResponse = rows[0];

        if (!dbResponse) {
            errorMessage.error = 'Password or Username you provided is incorrect';
            return res.status(status.notfound).send(errorMessage);
        }

        if (!comparePassword(dbResponse.password, password)) {
            errorMessage.error = 'Password or Username you provided is incorrect';
            return res.status(status.bad).send(errorMessage);
        }

        const token = generateUserToken(dbResponse.email, dbResponse.user_id, dbResponse.name, dbResponse.username);
        delete dbResponse.password;

        successMessage.data = dbResponse;
        successMessage.data.token = token;
        return res.status(status.success).send(successMessage);

    } catch (error) {
        errorMessage.error = 'Operation was not successful';
        return res.status(status.error).send(errorMessage);
    }
};


const getUser = async (req, res) => {
    const { user_id } = req.user;

    try {
        const getAllCategoriesQuery = `SELECT * FROM users WHERE user_id=$1 `;
        console.log(getAllCategoriesQuery)
        const { rows } = await dbQuery.query(getAllCategoriesQuery, [user_id]);
        const dbResponse = (rows && rows[0]) || {};
        delete dbResponse.password;
        successMessage.data = dbResponse;

        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch users';
        return res.status(status.error).send(errorMessage);
    }
};

export {
    signupUser,
    siginUser,
    getUser,
};