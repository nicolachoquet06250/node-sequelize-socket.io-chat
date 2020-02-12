const Sequelize = require('sequelize');
const credentials = require('../../config/config')[process.env.NODE_ENV];

if(credentials) {
    const sequelize = new Sequelize(`${credentials.dialect}://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.database}`);

    module.exports = {sequelize};
} else {
    throw 'Veuillez insérer des crédentials pour la connection en base de données !!';
}

/***************************************************************************/
/************************* Author: Nicolas Choquet *************************/
/********************** DB for private chat real time **********************/
/***************************************************************************/
/*        message        --        discussion        --        user        */
/***************************************************************************/
/*          id           --            id            --         id         */
/*         text          --           name           --     first_name     */
/*      discussion       --         createAt         --      last_name     */
/*       createAt        --                          --       avatar       */
/*        author         --                          --      createAt      */
/***************************************************************************/
