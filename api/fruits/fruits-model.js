// This is where we import a configured instance of knex and use it. 

const db = require('../../data/db-config.js');

function get() {
    // return Promise.reject(new Error('test reject'));
    return db('fruits');
}

function getById(id) {
    // return Promise.reject(new Error('test reject'));
    return db('fruits').first('*').where({ id });
}

async function create(newFruit) {
    // return Promise.reject(new Error('test reject'));
    const ids = await db('fruits').insert(newFruit);
    return getById(ids[0]);
}

module.exports = {
    get,
    getById,
    create
}