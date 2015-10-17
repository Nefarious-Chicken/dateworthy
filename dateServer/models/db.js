var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase({
    // Support specifying database info via environment variables,
    // but assume Neo4j installation defaults.
    url: process.env['NEO4J_URL'] || process.env['GRAPHENEDB_URL'] ||
        'http://neo4j:password@localhost:7474',
    auth: process.env['NEO4J_AUTH']
});

console.log('DB in db module')
console.log(db);

module.exports = db;