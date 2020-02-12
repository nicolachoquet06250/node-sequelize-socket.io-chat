let fs = require('fs');

if(!fs.existsSync(__dirname + '/../.env')) {
    fs.writeFile(__dirname + '/../.env', `NODE_ENV=development
DB_USERNAME=username
DB_PASSWORD=password
DB_PORT=3306
DB_DIALECT=mysql
DB_DATABASE=sequelize
DB_HOST=mysql.host.com

PORT=80
LOGS_FORMAT=dev`, () => console.log('creation du ficher .env'));
}