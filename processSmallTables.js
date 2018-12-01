const config = require('./knex/config.js');
const knex = require('knex')(config.knex);

const processOwners = () => {
	const owners = [
		{name: 'LB', 'seasons_played': 6, active: true},
		{name: 'DG', 'seasons_played': 6, active: true},
		{name: 'OB', 'seasons_played': 6, active: true},
		{name: 'CD', 'seasons_played': 6, active: true},
		{name: 'WF', 'seasons_played': 6, active: true},
		{name: 'CN', 'seasons_played': 6, active: true},
		{name: 'NN', 'seasons_played': 6, active: true},
		{name: 'ML', 'seasons_played': 6, active: true},
		{name: 'DK', 'seasons_played': 6, active: true},
		{name: 'PD', 'seasons_played': 1, active: false},
		{name: 'RW', 'seasons_played': 6, active: true}
	];
	
	return knex('owner')
		.max('owner_id')
		.then(max => {
			const currentOwners = max[0].max || 0;
			const ownersToInsert = []
			for (let i = currentOwners; i <owners.length; i++) {
				ownersToInsert.push(owners[i])
			}
			return knex('owner').insert(ownersToInsert);
		})
		.catch(err => {
			console.log('processOwners error')
			console.log(err);
		});
	
}

const createGameTypes = () => {
	const gameTypes = [
		{season_type: 'Regular Season', round: 'Regular Season'},
		{season_type: 'Post Season', round: 'B4 Playoffs'},
		{season_type: 'Post Season', round: 'Wildcard'},
		{season_type: 'Post Season', round: 'Semifinal'},
		{season_type: 'Post Season', round: 'Consolation'},
		{season_type: 'Post Season', round: '3rd Place'},
		{season_type: 'Post Season', round: 'Championship'}
	];
	
	return knex('game_type')
		.select()
		.then(output => {
			if (output.length === 0) {
				return knex('game_type').insert(gameTypes);
			} else if (output.length < gameTypes.length) {
				return knex('game_type').insert(gameTypes.slice(output.length));
			}
		})
		.catch(err => {
			console.log('createGameTypes error')
			console.log(err);
		});	
}

const processRivals = () => {
	const rivalries = [
		{owner_1: 'LB', owner_2: 'DG'},
		{owner_1: 'CN', owner_2: 'NN'},
		{owner_1: 'CN', owner_2: 'WF'},
		{owner_1: 'NN', owner_2: 'RW'},
		{owner_1: 'CN', owner_2: 'PD'},
		{owner_1: 'CD', owner_2: 'OB'},
		{owner_1: 'ML', owner_2: 'DK'},
		{owner_1: 'LB', owner_2: 'DK'}
	];
	
	return knex('rival')
		.select()
		.then(output => {
			const draftLength = output.length;
			return knex('owner')
			.select()
			.then(owners => {
				const dataToInsert = [];
				for(let i = draftLength; i < rivalries.length; i++) {
					const owner1 = owners.filter(obj => {
						return obj.name === rivalries[i].owner_1;
					});
					const owner2 = owners.filter(obj => {
						return obj.name === rivalries[i].owner_2;
					}); 
					dataToInsert.push({owner_id: owner1[0].owner_id, rival_id: owner2[0].owner_id})
					dataToInsert.push({owner_id: owner2[0].owner_id, rival_id: owner1[0].owner_id})
					console.log('Adding data')
				}
				console.log(dataToInsert)
				return knex('rival').insert(dataToInsert);
			})
			
		})
		.catch(err => {
			console.log('processRivals error')
			console.log(err);
		});		
}

module.exports = { processOwners, createGameTypes, processRivals }



