// @ts-check
// import env from '../../env';

/**
   * @param {string} email
   * @returns {Boolean} 
   */
const isValidEmail = (email) => {
    const regEx = /\S+@\S+\.\S+/;
    return regEx.test(email);
};

/**
   * @param {string} password
   * @returns {Boolean} 
   */
const validatePassword = (password) => {
    if (password.length <= 5 || password === '') {
        return false;
    } return true;
};

/**
   * @param {string, integer} input
   * @returns {Boolean} 
   */
const isEmpty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
    if (input.replace(/\s/g, '').length) {
        return false;
    } return true;
};

/**
   * @param {string, integer} input
   * @returns {Boolean} 
   */
const empty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
};

export {
    isValidEmail,
    validatePassword,
    isEmpty,
    empty
};