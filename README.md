# library_rest_api
This is a small book library API intended to demonstrate understanding of NodeJs Rest APis, Swagger, Authentication, SQL Databases

## Prerequisites
 * Postgresql version  12 (you need to have a user and a password to create a database)
 * Create a database in Postgresql with any name (Suggestion: "libraryDB").
 * Node Js installed at least version 10

## How to run the api
 * run npm install
 * open the file ".env" at the root folder and edit the line "DATABASE_URL=postgres://edvaldo:library@localhost:5432/libraryDB"
 * Change the words: 
    *"edvaldo" => your username at your Postgres database, 
    *"library" => your user password
    *"libraryDB"=> your created database name
 * Example: DATABASE_URL=postgres://john:myPassword@localhost:5432/myDatabaseName
 * Run => npm run setup
 * You should see on the console "🚀 are live on 5000"


## Test with Swagger
After running the api go to : http://localhost:5000/api-docs
