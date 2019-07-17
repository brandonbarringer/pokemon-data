const axios = require('axios');
const _ = require('underscore');
const fs = require('fs');

const baseURL = 'https://pokeapi.co/api/v2/pokemon/';

const setMoves = async (objArr) => {
	let moves = [];
	objArr.forEach(obj => {
		const urlArr = obj.move.url.split('/');
		const id = urlArr[urlArr.length -2]
		moves.push(Number(id))
	})
	return moves
};
const setBaseStats = async (objArr) => {
	let baseStats = {};
	let total = 0
	objArr.forEach(obj => {
		total += obj.base_stat
		baseStats[obj.stat.name] = obj.base_stat;
	});
	baseStats.total = total
	return baseStats;
};
const setTypes = async (objArr) => {
	let types = [];
	objArr.forEach(obj => {
		types.push(obj.type.name);
	});
	return types;
};
const setDamage = async (objArr) => {
	const flattenDamageArr = (arr, key) => {
		const factor = arr.map(obj => obj[key]);
		const damageArrays = factor.map(obj => obj.map(obj => obj.name));
		return damageArrays.reduce((a, b) => [...a, ...b], [])
	};
	const calcDamage = (arr, key) => {
		// returns duplicates in array
		const duplicates = (arr) => {
			let seen = new Set();
			let store = [];
			arr.filter(item => seen.size === seen.add(item).size && !store.includes(item) && store.push(item))
			return store;
		};
		return duplicates(flattenDamageArr(arr, key))
	};
	const mutateDamage = (arr, key) => {
		return _.difference(flattenDamageArr(arr, key), calcDamage(arr, key))
	};
	const extract = async (promises) => {
		const damage = await axios.all(promises)
		return damage
	};
	const promiseArr = objArr.map(obj => axios.get(obj.type.url));
	const damagesResponse = await extract(promiseArr);
	const damages = damagesResponse.map(obj => obj.data.damage_relations);
	const types = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy']

	return {
		'400': {
			from: calcDamage(damages, 'double_damage_from'),
			to: calcDamage(damages, 'double_damage_to')
		},
		'200': {
			from: mutateDamage(damages, 'double_damage_from'),
			to: mutateDamage(damages, 'double_damage_to')
		},
		'50': {
			from: mutateDamage(damages, 'half_damage_from'),
			to: mutateDamage(damages, 'half_damage_to')
		},
		'0': {
			from: mutateDamage(damages, 'no_damage_from'),
			to: mutateDamage(damages, 'no_damage_to')
		},
		'25': {
			from: calcDamage(damages, 'half_damage_from'),
			to: calcDamage(damages, 'half_damage_to')
		}
	}
}


const setData = async (url) => {
	// let pokemonList = await getPokemonList(baseURL);
	let pageResponse = await axios.get(url);
	let next = pageResponse.data.next;
	let results = pageResponse.data.results;
	// pokemon.push(...results);
	// return pokemon
	results.forEach(async pokemon => {
		const response = await axios.get(pokemon.url);
		const moves = await setMoves(response.data.moves);
		const baseStats = await setBaseStats(response.data.stats);
		const types = await setTypes(response.data.types);
		const damage = await setDamage(response.data.types);
		const name = response.data.name;
		const id = response.data.id;
		const order = response.data.order;
		const data = {
			[response.data.name]: {
				name: response.data.name,
				id: response.data.id,
				order: order,
				stats: baseStats,
				moves: moves,
				types: types,
				damage: damage
			}
		};
		// db.collection('pokemon').doc(doc).set(data)
		fs.appendFile('pokemon.json', JSON.stringify(data, null, 4))

	})
	return next !== null ? setData(next) : results;

}

setData(baseURL)
