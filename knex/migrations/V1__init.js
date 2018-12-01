exports.up = async function (knex, Promise) {
    return Promise.all([
    	knex.schema.createTable('owner', table => {
		    table.increments('owner_id').primary();
		    table.string('name').unique().notNullable();
		    table.integer('seasons_played').notNullable();
		    table.boolean('active').notNullable();
		  }),
		  
		knex.schema.createTable('rival', table => {
		    table.integer('owner_id');
		    table.integer('rival_id');
		}),
		
		knex.schema.createTable('game', table => {
			table.increments('game_id').primary();
		    table.integer('year').notNullable();
		    table.integer('week').notNullable();
		    table.integer('game_type').notNullable();
		}),
		
		knex.schema.createTable('game_type', table => {
			table.increments('type_id').primary();
		    table.string('season_type').notNullable();
		    table.string('round').notNullable();
		}),
		
		knex.schema.createTable('game_score', table => {
			table.integer('game_id');
			table.integer('owner_id');
		    table.float('score', 1).notNullable();
		    table.string('result', 1).notNullable();
		}),
		
		/*knex.schema.createTable('regular_season', table => {
		    table.integer('year').notNullable();
		    table.integer('owner_id').notNullable();
		    table.integer('rank').notNullable();
		    table.integer('wins').notNullable();
		    table.integer('losses').notNullable();
		    table.integer('ties').notNullable();
		    table.integer('points_for').notNullable();
		    table.integer('points_against').notNullable();
		}),
		
		knex.schema.createTable('post_season', table => {
		    table.integer('year').notNullable();
		    table.integer('owner_id').notNullable();
		    table.integer('round_completed').notNullable();
		    table.integer('rank').notNullable();
		    table.integer('wins').notNullable();
		    table.integer('losses').notNullable();
		    table.integer('ties').notNullable();
		    table.integer('points_for').notNullable();
		    table.integer('points_against').notNullable();
		    table.primary(['year', 'owner_id']);
		}),*/
		
		knex.schema.createTable('draft', table => {
		    table.integer('year');
		    table.integer('selection_id');
		    table.integer('round').notNullable();
		    table.integer('pick').notNullable();
		    table.integer('owner_id').notNullable();
		    table.string('player_name', 100).notNullable();
		    table.string('player_team', 5).notNullable();
		    table.string('position_1', 5).notNullable();
		    table.string('position_2', 5).nullable();
		}),
	])
	.then(async () => {
		return Promise.all([				  
			knex.schema.alterTable('rival', table => {
			    table.integer('owner_id').references('owner.owner_id').alter();
			    table.integer('rival_id').references('owner.owner_id').alter();
			    table.primary(['owner_id', 'rival_id']);
			}),
			
			knex.schema.alterTable('game', table => {
			    table.integer('game_type').references('game_type.type_id').alter();
			}),
			
			knex.schema.alterTable('game_score', table => {
				table.integer('game_id').references('game.game_id').alter();
				table.integer('owner_id').references('owner.owner_id').alter();
			    table.primary(['game_id', 'owner_id']);
			}),
			
			/*knex.schema.alterTable('regular_season', table => {
				knex.raw(`ALTER TABLE game 
	    		          ADD CONSTRAINT valid_year CHECK(year >= 2012),
	    		          ADD CONSTRAINT valid_rank CHECK(rank >= 1 AND rank <= 10),
	    		          ADD CONSTRAINT valid_num_wins CHECK(wins >= 0 AND win <= 13),
	    		          ADD CONSTRAINT valid_num_losses CHECK(losses >= 0 AND losses <= 13),
	    		          ADD CONSTRAINT valid_num_ties CHECK(ties >= 0 AND ties <= 13);`);
			    table.integer('owner_id').references('owner.owner_id').alter();
			    console.log('Regular_Season done');
			}),
			
			knex.schema.alterTable('post_season', table => {
				knex.raw(`ALTER TABLE game 
	    		          ADD CONSTRAINT valid_year CHECK(year >= 2012),
	    		          ADD CONSTRAINT valid_rank CHECK(rank >= 1 AND rank <= 10),
	    		          ADD CONSTRAINT valid_num_wins CHECK(wins >= 0 AND win <= 3),
	    		          ADD CONSTRAINT valid_num_losses CHECK(losses >= 0 AND losses <= 3),
	    		          ADD CONSTRAINT valid_num_ties CHECK(ties >= 0 AND ties <= 3);`);
			    table.integer('owner_id').references('owner.owner_id').alter();
			    console.log('Post_Season done');
			}),*/
			
			knex.schema.alterTable('draft', table => {
			    table.integer('owner_id').references('owner.owner_id').alter();
			    table.primary(['year', 'selection_id']);
			})
		]);
	})
	.then(() => {
		return knex.schema.raw(`ALTER TABLE game 
		          ADD CONSTRAINT valid_year CHECK(year >= 2012),
				  ADD CONSTRAINT valid_week CHECK(week >= 1 AND week <= 17);`);
	})
	.then(() => {
		return knex.schema.raw(`ALTER TABLE owner 
  			ADD CONSTRAINT non_negative_seasons CHECK(seasons_played >= 0)`);
	})
	.then(() => {
		return knex.schema.raw(`ALTER TABLE draft 
		          ADD CONSTRAINT valid_year CHECK(year >= 2012),
		          ADD CONSTRAINT valid_selection CHECK(selection_id >= 1 AND selection_id <= 180),
		          ADD CONSTRAINT valid_round CHECK(round >= 1 AND round <= 18),
		          ADD CONSTRAINT valid_pick CHECK(pick >= 1 AND pick <= 10),
		          ADD CONSTRAINT valid_position_1 CHECK(position_1 IN ('QB','RB','WR','TE','D/ST','K')),
		          ADD CONSTRAINT valid_position_2 CHECK(position_2 IN ('QB','RB','WR','TE','D/ST','K')),
		          ADD CONSTRAINT valid_position_order CHECK(position_1 IS NOT NULL OR position_2 IS NULL);`);
	})
	.then(() => {
		console.log('Creation completed');
	})
	.catch(err => {
		console.log('In creation error');
		console.log(err);
	});
    
}

exports.down = function (knex, Promise) {}