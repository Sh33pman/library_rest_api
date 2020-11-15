// @ts-check

import pool from './pool'

export default {

    async query(queryText, params) {
        try {
            const res = await pool.query(queryText, params);
            return res;
        } catch (error) {
            return error;
        }
    }
}


// const dbQuery = {

//     query(queryText, params){
//         return new Promise((resolve, reject) => {
//             pool.query(queryText, params)
//             .then(res => {
//                 resolve(res)
//             })
//             .catch(err => {
//                 reject(err);
//             })
//         })
//     }
// }

// export default dbQuery;