const config = require('./knex/config.js');
const knex = require('knex')(config.knex);
const fs = require('fs');
const papa = require('papaparse');

//function main() {
	const file = fs.createReadStream('regSeasonData.csv');
	
	const papaConfig = {
	    header: true,
	    dynamicTyping: true,
	    skipEmptyLines: true,
	    //preview: 10,
	    chunk: parseData
	}
	papa.parse(file, papaConfig);
	
//} 

function parseData(results, parser) {
	return new Promise(async (resolve, reject) => {
		const data = [];
		
		const maxCount = await knex('regular_season')
			.count()
			.catch(err => {
				console.log(err);
				reject('Cannot fetch regular_season values')
			});
		
		let max = maxCount[0].max || 0;
		
		knex.transaction(trx => {
			knex('regular_season')
			.insert(results.data.slice(max))
			.transacting(trx)
		    .then(trx.commit)
		    .catch(trx.rollback);
		})
		.then(() => {
			if (results.data.length > 0) {
				console.log((results.data.length - max) + ' new games processed and added to database.');
			}
		    resolve();
		})
		.catch(error => {
		    console.error(error);
		    reject(error)
		});
	});
}

