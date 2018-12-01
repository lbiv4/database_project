const config = require('./knex/config.js');
const knex = require('knex')(config.knex);
const fs = require('fs');
const papa = require('papaparse');

//function main() {
	const file = fs.createReadStream('gameData.csv');
	
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
		const games = [];
		const scores = [];
		
		const maxCount = await knex('game')
			.max('game_id')
			.catch(err => {
				console.log(err);
				reject('Cannot fetch max game values')
			});
		const ownerRows = await knex('owner')
			.select()
			.catch(err => {
				console.log(err);
				reject('Cannot fetch owners')
			});
		const gameTypeRows = await knex('game_type')
			.select()
			.catch(err => {
				console.log(err);
				reject('Cannot fetch game types')
			});
		
		let max = maxCount[0].max || 0;
		
		for (let i = max; i < results.data.length; i++) {
			const currentRow = results.data[i];
			const owner1 = ownerRows.filter(obj => {
				return obj.name === currentRow.owner_1;
			});
			const owner2 = ownerRows.filter(obj => {
				return obj.name === currentRow.owner_2;
			});
			const gameType = gameTypeRows.filter(obj => {
				return ((obj.season_type === currentRow.season) &&
						(obj.round === currentRow.round));
			});
			
			if ((owner1.length == 0) || (owner2.length == 0)) {
				console.log('Could not process games - owner in file not in database');
				reject();
			} else if ((owner1.length >= 2) || (owner2.length >= 2)) {
				console.log('Could not process games - some owner name exists twice in database');
				reject();
			} else if ((gameType.length == 0) || (gameType.length >= 2)) {
				console.log('Could not process games - gameType error');
				reject();
			} else {
				const gameValues = {
					game_id: currentRow.game_id,
					year: currentRow.year,
					week: currentRow.week,
					game_type: gameType[0].type_id 
				};
				const score1 = {
					game_id: currentRow.game_id,
					owner_id: owner1[0].owner_id,
					score: currentRow.score_1,
					result: currentRow.result_1
				};
				const score2 = {
					game_id: currentRow.game_id,
					owner_id: owner2[0].owner_id,
					score: currentRow.score_2,
					result: currentRow.result_2
				};
				games.push(gameValues);
				scores.push(score1);
				scores.push(score2);
			}
		}
		
		knex.transaction(trx => {
			knex('game')
			.insert(games)
			.transacting(trx)
			.then(() => {
				return knex('game_score')
					.insert(scores)
					.transacting(trx);
			})
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

