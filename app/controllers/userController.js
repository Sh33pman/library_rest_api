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
        const { rows } = await dbQuery.query(createUserQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;

        const { email, name, user_id, username, password } = dbResponse
        const token = generateUserToken(email, user_id, name, username);

        successMessage.data = dbResponse;
        successMessage.data.token = token;
        return res.status(status.created).send(successMessage);

    } catch (error) {
        if (error.routine === '_bt_check_unique') {
            // test with the same email 
            // test with the same username
            // test with the same email and password
            errorMessage.error = 'Email or Username was already taken. Plese select another one';
            return res.status(status.conflict).send(errorMessage);
        }

        errorMessage.error = 'Operation was not successful';
        console.log(error);
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

        // const {email, name, user_id, username, password} = dbResponse;

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

export {
    signupUser,
    siginUser,
};