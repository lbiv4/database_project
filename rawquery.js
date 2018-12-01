const knex = require('knex')(require('./knex/config.js').knex);

const getQueryResults = (query) => {
	return new Promise((resolve, reject) => {
		let results;
		if (query === null || query === "") {
			reject('Error - please enter a valid query before submitting');
		}
		
		const create = query.toLowerCase().includes('create table');
		const alter = query.toLowerCase().includes('alter table');
		const drop = query.toLowerCase().includes('drop table');
		const insert = query.toLowerCase().includes('insert into');
		const del = query.toLowerCase().includes('delete from');

		
		if(create || alter || drop || insert || del) {
			reject('Error - database altering queries are not allowed');
		}
		
		console.log(query)
		knex.raw(query)
			.then(result => {
				console.log(result);
				if (result.rows === null || result.rows.length === 0) {
					reject('Empty Response')
				}
				console.log('In query')
				let output = '<table><tr>';
				//Result should have fields attributes that holds array with column names
				const columns = Object.keys(result.rows[0]);
				for (let i=0; i < columns.length; i++) {
					output += `<th>${columns[i]}</th>`;
				}
				
				output += '</tr>';
				let row  = 0;
				while(row < result.rows.length) {
					output += '<tr>';
					for(let i=0; i < columns.length; i++) {
						output += `<td>${result.rows[row][columns[i]]}</td>`;
					}
					output += '</tr>';
					row++;
				}
				output += `</table><h3>Result returned ${row} rows</h3>`;
				resolve(output);
			})
			.catch(err => {
				reject(`${err}`);
			});
	});
}

module.exports = { getQueryResults };


