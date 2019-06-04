const axios = require('axios');
const _ = require('underscore');
const jsonfile = require('jsonfile');
const fs = require('fs');


const baseURL = 'https://pokeapi.co/api/v2/pokemon/';

const getMaxPokemon = () => {
	return axios.get(baseURL)
		.then(response => {
			return response.data.count
		})
}


const getPokemon = (count) => {
	let promises = [];
	for (let i = 1; i < count; i++) {
		promises.push(
			axios.get(baseURL + i)
			.then(response => {
				return response.data
			})
		)
	}
	return axios.all(promises)
	
}

getPokemon(100).then(results => {
	const file = './pokemon.json';
	// const obj = JSON.stringify(result, null, 4);
	const allowed = ['name', 'order', 'id', 'order', 'stats', 'types']
	const pokemon = []

	results.forEach(result => {
		let filtered = Object.keys(result)
		.filter(key => allowed.includes(key))
		.reduce((obj, key) => {
			obj[key] = result[key];
			return obj;
		}, {})
		pokemon.push(filtered)
	})

	// jsonfile.writeFile(file, pokemon, function(err) {
	// 	if (err) console.log(err)
	// })
	fs.writeFile(file, JSON.stringify(pokemon), null, 4)
	
})
