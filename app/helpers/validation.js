// @ts-check

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../env';

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const hashPassword = password => bcrypt.hashSync(password, salt);


const comparePassword = (hashedPassword, password) => {
    return bcrypt.compareSync(password, hashedPassword);
};


const isValidEmail = (email) => {
    const regEx = /\S+@\S+\.\S+/;
    return regEx.test(email);
};


const validatePassword = (password) => {
    if (password.length <= 5 || password === '') {
        return false;
    } return true;
};

const isEmpty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
    if (input.replace(/\s/g, '').length) {
        return false;
    } return true;
};


const empty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
};


const generateUserToken = (email, user_id, name, username) => {
    const token = jwt.sign(
        {
            email,
            user_id,
            name,
            username,
        },
        env.secret, { expiresIn: '5d' });

    return token;
};


export {
    hashPassword,
    comparePassword,
    isValidEmail,
    validatePassword,
    isEmpty,
    empty,
    generateUserToken,
};
