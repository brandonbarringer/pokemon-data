const axios = require('axios');
const _ = require('underscore');
const fs = require('fs');


const baseURL = 'https://pokeapi.co/api/v2/pokemon/';

const getMaxPokemon = () => {
	return axios.get(baseURL)
		.then(response => {
			return response.data.count
		})
}


const getPokemon = (from, through) => {
	let promises = [];
	for (let i = from; i <= through; i++) {
		promises.push(
			axios.get(baseURL + i)
			.then(response => {
				return response.data
			})
		)
	}
	return axios.all(promises)
	
}

getPokemon(601, 807).then(results => {
	const file = './pokemon.json';
	const allowed = ['name', 'order', 'id', 'order', 'stats', 'types']
	const pokemon = []

	results.forEach(result => {
		// return only objs in allowed
		let filtered = Object.keys(result)
			.filter(key => allowed.includes(key))
			.reduce((obj, key) => {
				obj[key] = result[key];
				return obj;
			}, {})

		// add total of all stats as total in stats
		let total = 0;
		filtered.stats.forEach(stat => {
			total += stat.base_stat
		})
		filtered.stats.push({base_stat: total, stat: {name: 'total'}})

		// add the mutated obj to the container
		pokemon.push(filtered)
	})

	// write the container to the file
	fs.appendFile(file, JSON.stringify(pokemon, null, 4))
	
})
