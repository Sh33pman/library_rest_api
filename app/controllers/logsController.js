// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { errorMessage, successMessage, status } from '../helpers/status';



const getAllLogs = async (req, res) => {

    try {
        const getAllLogsQuery = buildGetAllLogsQuery(req.query)
        const { rows } = await dbQuery.query(getAllLogsQuery);
        const dbResponse = rows;

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch Logs';
        return res.status(status.error).send(errorMessage);
    }
};

function buildGetAllLogsQuery(payload) {
    const { limit, offset, entity } = payload;
    let query = `SELECT * FROM logging.logs `;

    query += entity && entity === 'logs' ? "" : ` WHERE tabname = '${entity}' `

    if (limit) {
        query += ` LIMIT ${limit}`
    }

    if (offset) {
        query += ` OFFSET ${offset}`
    }

    return query
}

export {
    getAllLogs,
};