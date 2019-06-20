const axios = require('axios');
const _ = require('underscore');
const fs = require('fs');


const baseURL = 'https://pokeapi.co/api/v2/pokemon/';
let pokemon = [];
let count = 0
const getPokemonList = async (url) => {
	let pageResponse = await axios.get(url);
	let next = pageResponse.data.next;
	let results = pageResponse.data.results;
	results.forEach(result => {
		pokemon.push(result)
	})
	// return next !== null ? getPokemonList(next) : pokemon;
	return pokemon
}

const setStats = async (obj) => {
	console.log("stats", obj)
};
const setMoves = async (obj) => {
	console.log("moves", obj)
};
const setBaseStats = async (obj) => {
	console.log("base stats", obj)
};
const setTypes = async (obj) => {
	console.log("types", obj)
};


const setData = async () => {
	let pokemonList = await getPokemonList(baseURL);
	pokemonList.forEach(async pokemon => {
		let response = await axios.get(pokemon.url);
		let stats = await setStats(response.data.stats);
		// let moves = await setMoves(response.data.moves);
		// let baseStats = await setBaseStats(response.data.stats);
		// let types = await setTypes(response.data.types);
	})
}

setData()