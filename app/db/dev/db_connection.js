// @ts-check
import pool from './pool';

pool.on('connect', () => {
    console.log('Conneted to DB')
});


const usePool = async (query) => {
    try {

        const res = await pool.query(query);
        console.log(res);
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
        password VARCHAR(100) NOT NULL
    )`;


    return await usePool(createUserTableQuery)

    // pool.query(createUserTableQuery)
    //     .then(res => {
    //         console.log(res);
    //         pool.end();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         pool.end();
    //     })
}

const createAuthorTable = async () => {
    const createAuthorTableQuery = `CREATE TABLE IF NOT EXISTS authors
    (
        author_id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL
    )`;

    return await usePool(createAuthorTableQuery)

    // pool.query(createAuthorTableQuery)
    //     .then(res => {
    //         console.log(res);
    //         pool.end();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         pool.end();
    //     })
}

const createCategoryTable = async () => {
    const createCategoryTableQuery = `CREATE TABLE IF NOT EXISTS categories
    (
        category_id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description VARCHAR(100) NOT NULL
    )`;

    return await usePool(createCategoryTableQuery)

    // pool.query(createCategoryTableQuery)
    //     .then(res => {
    //         console.log(res);
    //         pool.end();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         pool.end();
    //     })
}

const createBookTable = async () => {
    const createBookTableQuery = `CREATE TABLE IF NOT EXISTS books
    (
        isbn_number VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        author INT NOT NULL,
        year_published VARCHAR(100) NOT NULL,
        CONSTRAINT fk_author 
        FOREIGN KEY(author) REFERENCES authors(author_id) 

    )`;

    return await usePool(createBookTableQuery)

    // pool.query(createBookTableQuery)
    //     .then(res => {
    //         console.log(res);
    //         pool.end();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         pool.end();
    //     })
}

const createBookCategoryTable = async () => {
    const createBookCategoryTableQuery = `CREATE TABLE IF NOT EXISTS book_categories
    (
        category_id INT,
        isbn_number VARCHAR(100),
        CONSTRAINT pk_category_group PRIMARY KEY (category_id,isbn_number),
        CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES categories(category_id),
        CONSTRAINT fk_isbn_number FOREIGN KEY(isbn_number) REFERENCES books(isbn_number)
    )`;

    return await usePool(createBookCategoryTableQuery)

    // pool.query(createBookCategoryTableQuery)
    //     .then(res => {
    //         console.log(res);
    //         pool.end();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         pool.end();
    //     })
}


const dropUserTable = () => {
    const dropUserTableQuery = 'DROP TABLE IF EXISTS users';
    pool.query(dropUserTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};

const dropAuthorTable = () => {
    const dropAuthorTableQuery = 'DROP TABLE IF EXISTS authors';
    pool.query(dropAuthorTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const dropCategoryTable = () => {
    const dropCategoryTableQuery = 'DROP TABLE IF EXISTS categories';
    pool.query(dropCategoryTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const dropBookTable = () => {
    const dropBookTableQuery = 'DROP TABLE IF EXISTS books';
    pool.query(dropBookTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const dropBookCategoryTable = () => {
    const dropBookGenreTableQuery = 'DROP TABLE IF EXISTS book_categories';
    pool.query(dropBookGenreTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const createAllTables = async () => {

    await createUserTable();
    await createAuthorTable();
    await createCategoryTable();
    await createBookTable();
    await createBookCategoryTable();

    pool.end();

    // createUserTable();
    // createAuthorTable();
    // createCategoryTable();
    // createBookTable();
    // createBookCategoryTable();
}


const dropAllTables = () => {
    dropUserTable();
    dropAuthorTable();
    dropCategoryTable();
    dropBookTable();
    dropBookCategoryTable();
}

pool.on('remove', () => {
    console.log('user removed');
    process.exit(0);
})


// module.exports = {
//     createAllTables,
//     // dropAllTables
// }

export {
    createAllTables,
    dropAllTables
}

require('make-runnable');