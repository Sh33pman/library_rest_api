# library_rest_api
This is a small book library API intended to demonstrate understanding of NodeJs Rest APIs, Swagger, Authentication, SQL Databases

## Prerequisites
 * Postgresql version  12 (you need to have a valid user and a password to create a database)
 ~~* Create a database in Postgresql with any name (Suggestion: "libraryDB").~~
 * Node Js installed at least version 10

## How to run the api
 * On the root folder run => npm install
 * open the file ".env" at the root folder and edit the line "DATABASE_URL=postgres://edvaldo:library@localhost:5432/libraryDB"
 * Change the words: 
    *"edvaldo" => your username at your Postgres database, 
    *"library" => your user password (Postgres database)
    *"libraryDB"=> the database name that you want to create
 * Example: DATABASE_URL=postgres://john:myPassword@localhost:5432/myDatabaseName
 * On the ".env" file still, change the variables: 
    * *DATABASE_USER*=postgres (this is my Postgres username at my local database)
    * *DATABASE_NAME*=libraryDB (the database name you want to create)
    * *DATABASE_PASSWORD*=987 (the user password)
 * Run => npm run setup
 * Note: When you run *npm run setup* it will attempt to see if you have the database called *libraryDB* at your system.
 If it didn't find it, the script will use your credentials on the *.env* file to create a new database with the 
 credentials you supplied.
 * You should see on the console "🚀 are live on 5005" and other messages informing the creation of the database and tables.
 * Note: If it fails please make sure that your credentials on the *.env* file are correct 


## Test with Swagger
After running the api go to : http://localhost:5005/api-docs
* When you run for the first time, you can load some dummy data by calling http://localhost:5005/api-docs/load_data on swagger
only once
