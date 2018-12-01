const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const config = require('./knex/config.js');
const store = require('./store.js')
const rawQuery = require('./rawquery.js')


const knexMigration = knex(config.migrationConnection);

knexMigration.migrate.latest(config.migrations)
.then(() => knexMigration.destroy())
.then(function() {
	const app = express();
	app.use(express.static('public'));
	app.use(bodyParser.json());
	app.post('/createUser', (req, res) => {
	  store
	    .createUser({
	      username: req.body.username,
	      password: req.body.password
	    })
	    .then(() => res.sendStatus(200))
	})

	app.post('/rawQuery', async (req, res) => {
	  await rawQuery
	    .getQueryResults(req.body.query)
	    .then(output => {
	    	console.log('Ran query');
	    	res.status(200).send(output);
	    })
	    .catch(err => {
	    	console.log('Query error')
	    	res.status(400).send(err);
	    });
	})



	app.listen(8080, () => {
	  console.log('Server running on http://localhost:8080')
	})
});
