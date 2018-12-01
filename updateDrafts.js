const config = require('./knex/config.js');
const knex = require('knex')(config.knex);
const fs = require('fs');
const papa = require('papaparse');

//function main() {
	const file = fs.createReadStream('draftData.csv');
	
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
		const draftRows = [];
		const ownerRows = await knex('owner')
			.select()
			.catch(err => {
				console.log(err);
				reject('Cannot fetch owners')
			});
		
		for (let i = 0; i < results.data.length; i++) {
			const currentRow = results.data[i];
			const owner = ownerRows.filter(obj => {
				return obj.name === currentRow.owner;
			});
			
			if (owner.length == 0) {
				console.log('Could not process drafts - owner in file not in database');
				reject();
			} else if (owner.length >= 2) {
				console.log('Could not process drafts - some owner name exists twice in database');
				reject();
			} else {
				const metaData = currentRow.labels.trim().split(" ");
				let p1;
				let p2;
				if (metaData[1].length > 4) {
					const positions = metaData[1].split('/')
					p1 = positions[1].toUpperCase();
					p2 = positions[2].toUpperCase();
				} else {
					p1 = metaData[1].toUpperCase();
					p2 = null;
				}
				
				const pickValues = {
					year: currentRow.year,
					selection_id: currentRow.selection,
					round: currentRow.round,
					pick: currentRow.pick,
					owner_id: owner[0].owner_id,
					player_name: currentRow.player,
					player_team: metaData[0].toUpperCase(),
					position_1: p1,
					position_2: p2				
				};
				console.log(pickValues);
				draftRows.push(pickValues);
			}
		}
		
		knex.transaction(trx => {
			knex('draft')
			.insert(draftRows)
			.transacting(trx)
		    .then(trx.commit)
		    .catch(trx.rollback);
		})
		.then(() => {
			if (results.data.length > 0) {
				console.log(results.data.length + ' new draft picks processed and added to database.');
			}
		    resolve();
		})
		.catch(error => {
		    console.error(error);
		    reject(error)
		});
	});
}

