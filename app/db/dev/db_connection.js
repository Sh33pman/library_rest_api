// @ts-check
import pool from './pool';
var pgtools = require("pgtools");

pool.on('connect', () => {
    console.log('Conneted to DB')
});


const usePool = async (query) => {
    try {

        const res = await pool.query(query);
        // console.log(res);
    } catch (error) {
        console.log(error);
        pool.end();
        return null
    }
}

const createUserTable = async () => {
    const createUserTableQuery = `CREATE TABLE IF NOT EXISTS users
    (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
		date_time timestamp DEFAULT now()
    )`;

    return await usePool(createUserTableQuery)
}

const createAuthorTable = async () => {
    const createAuthorTableQuery = `CREATE TABLE IF NOT EXISTS authors
    (
        author_id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
		operation_by_user VARCHAR(100) NOT NULL
    )`;

    return await usePool(createAuthorTableQuery)
}

const createCategoryTable = async () => {
    const createCategoryTableQuery = `CREATE TABLE IF NOT EXISTS categories
    (
        category_id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description VARCHAR(100) NOT NULL,
		operation_by_user VARCHAR(100) NOT NULL
    )`;

    return await usePool(createCategoryTableQuery)
}

const createBookTable = async () => {
    const createBookTableQuery = `CREATE TABLE IF NOT EXISTS books
    (
        isbn_number VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        author INT NOT NULL,
        year_published VARCHAR(100) NOT NULL,
		operation_by_user VARCHAR(100) NOT NULL,
        CONSTRAINT fk_author 
        FOREIGN KEY(author) REFERENCES authors(author_id) 

    )`;

    return await usePool(createBookTableQuery)
}

const createBookCategoryTable = async () => {
    const createBookCategoryTableQuery = `CREATE TABLE IF NOT EXISTS book_categories
    (
        category_id INT,
        isbn_number VARCHAR(100),
		operation_by_user VARCHAR(100) NOT NULL,
        CONSTRAINT pk_category_group PRIMARY KEY (category_id,isbn_number),
        CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES categories(category_id),
        CONSTRAINT fk_isbn_number FOREIGN KEY(isbn_number) REFERENCES books(isbn_number)
    )`;

    return await usePool(createBookCategoryTableQuery)

}

const createAuditSchema = async () => {
    const query = `CREATE SCHEMA IF NOT EXISTS logging;`
    return await usePool(query);
}


const createAuditTable = async () => {
    const query = `CREATE TABLE IF NOT EXISTS logging.logs (
        id serial,
        tstamp timestamp DEFAULT now(),
        schemaname text,
        tabname text,
        operation text,
        who text DEFAULT session_user,
        new_val json,
        old_val json
    );`
    return await usePool(query);
}

const createChangeTriggerFunction = async () => {
    const query = `CREATE OR REPLACE FUNCTION change_trigger() RETURNS trigger AS $$ 
    BEGIN
       IF TG_OP = 'INSERT' 
    THEN
       INSERT INTO logging.logs (tabname, schemaname, operation, who, new_val) 
       VALUES( TG_RELNAME, TG_TABLE_SCHEMA, TG_OP,  NEW.operation_by_user, row_to_json(NEW));
    RETURN NEW;
    ELSIF TG_OP = 'UPDATE' 
    THEN
       INSERT INTO logging.logs (tabname, schemaname, operation,who, new_val, old_val) 
       VALUES(TG_RELNAME, TG_TABLE_SCHEMA, TG_OP,  NEW.operation_by_user, row_to_json(NEW), row_to_json(OLD));
    RETURN NEW;
    END IF;
    END;
    $$ LANGUAGE 'plpgsql' SECURITY DEFINER;`
    return await usePool(query);
}

const createAuthorTrigger = async () => {
    const query = `CREATE TRIGGER author_trigger BEFORE INSERT OR UPDATE ON public.authors
    FOR EACH ROW EXECUTE PROCEDURE change_trigger();`;
    return await usePool(query);
}

const createCategoryTrigger = async () => {
    const query = `CREATE TRIGGER category_trigger BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW EXECUTE PROCEDURE change_trigger();`;
    return await usePool(query);
}

const createBookTrigger = async () => {
    const query = `CREATE TRIGGER book_trigger BEFORE INSERT OR UPDATE ON public.books
    FOR EACH ROW EXECUTE PROCEDURE change_trigger();`;
    return await usePool(query);
}

const createBookCategoryTrigger = async () => {
    const query = `CREATE TRIGGER book_category_trigger BEFORE INSERT OR UPDATE ON public.book_categories
    FOR EACH ROW EXECUTE PROCEDURE change_trigger();`;
    return await usePool(query);
}





// const createAllTables = async () => {

//     // Add everything in a transaction

//     await createUserTable();
//     await createAuthorTable();
//     await createCategoryTable();
//     await createBookTable();
//     await createBookCategoryTable();

//     await createAuditSchema();
//     await createAuditTable();
//     await createChangeTriggerFunction();
//     await createAuthorTrigger();
//     await createCategoryTrigger();
//     await createBookTrigger();
//     await createBookCategoryTrigger();



//     pool.end();

// }

const createAllTables = async () => {

    let isExitDb = await checkDb();

    console.log(` 💾  => ATTEMPTING TO CREATE TABLES CReating Tables...`)

    try {
        let createUser = await createUserTable();
        let createAuthor = await createAuthorTable();
        let createCategories = await createCategoryTable();
        let createBook = await createBookTable();
        let createBookCategory = await createBookCategoryTable();

        let _createAuditSchema = await createAuditSchema();
        let createAudit = await createAuditTable();
        let createChangeTrigger = await createChangeTriggerFunction();
        let createuthorTrigger = await createAuthorTrigger();
        let _createCategoryTrigger = await createCategoryTrigger();
        let _createBookTrigger = await createBookTrigger();
        let _createBookCategoryTrigger = await createBookCategoryTrigger();

        console.log(`✅  => TABLES CREATED ...`)
        console.log(`✅  => TRIGGERS CREATED ...`)


    } catch (error) {
        console.log(error.code)

        if (error.code === '28000') {
            console.log(`================================================================`)
            console.log(`❌  Failed to create db. Invalid Username. Change the .env file with a valid DATABASE_USER`)
            console.log(`==================================================================`)
            process.exit(1)
        }

        if (error.code === '28P01') {
            console.log(`================================================================`)
            console.log(`❌  Failed to create db. Invalid Password. Change the .env file with a valid DATABASE_PASSWORD`)
            console.log(`==================================================================`)
            process.exit(1)
        }
    }




    pool.end();

}

async function checkDb() {
    try {
        let res = await isDBUp();
        return res
    } catch (error) {
        let invalid_catalog_name = '3D000';

        if (error.code === invalid_catalog_name) {
            console.log(`================================================================`)
            console.log(`❌  ${error['message']}. ATTEMPTING TO CREATE A NEW ONE...`)
            console.log(`==================================================================`)
        }

        if (error.code === '28000') {
            console.log(`================================================================`)
            console.log(`❌  Failed to create db. Invalid Username. Change the .env file with a valid DATABASE_USER`)
            console.log(`==================================================================`)
            process.exit(1)
        }

        if (error.code === '28P01') {
            console.log(`================================================================`)
            console.log(`❌  Failed to create db. Invalid Password. Change the .env file with a valid DATABASE_PASSWORD`)
            console.log(`==================================================================`)
            process.exit(1)
        }

        let createDbRes = await CreateDatabase();

        if (createDbRes['command'].toLowerCase().includes("create")) {
            console.log(`✅  => ${process.env.DATABASE_NAME}  DATABASE CREATED ...`)
        }

        return true
    }
}

async function isDBUp() {
    try {
        const res = await pool.query(`SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${process.env.DATABASE_NAME}');`);
        return res;
    } catch (error) {
        // pool.end();
        throw error
    }
}

async function CreateDatabase() {

    const config = {
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT
    };


    if (!config.password || (config.password && config.password === "")) {
        delete config.password;
    }

    let res;
    try {
        res = await pgtools.createdb(config, `${process.env.DATABASE_NAME}`, function (err, res) {
            if (err) {
                // return err;
                // process.exit(-1);
                throw err
            }

            return res;
        });

    } catch (error) {
        if (error.code === '28000') {
            console.log(`================================================================`)
            console.log(`❌  Failed to create db. Invalid Username. Change the .env file with a valid DATABASE_USER`)
            console.log(`==================================================================`)
            process.exit(1)
        }

        if (error.code === '28P01') {
            console.log(`================================================================`)
            console.log(`❌  Failed to create db. Invalid Password. Change the .env file with a valid DATABASE_PASSWORD`)
            console.log(`==================================================================`)
            process.exit(1)
        }
    }

    return res

}


pool.on('remove', () => {
    console.log('user removed');
    process.exit(0);
})


export {
    createAllTables
}

require('make-runnable');