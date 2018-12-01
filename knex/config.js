module.exports = {	
    knex: {
	    client: 'pg',
	    connection: {
            host : 'localhost',
            user : process.env.DATABASE_USER || 'admin',
            password : process.env.DATABASE_PASSWORD || 'ffadmin4372',
            database : 'fantasy_football'
        }
    },
    migrationConnection: {
	    client: 'pg',
	    connection: {
            host : 'localhost',
            user : process.env.DATABASE_USER || 'admin',
            password : process.env.DATABASE_PASSWORD || 'ffadmin4372',
            database : 'fantasy_football'
        }
    },
    migrations: {
		directory: __dirname+"/migrations",
    }
}