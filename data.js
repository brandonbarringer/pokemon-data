const axios = require('axios');
const _ = require('underscore');

const baseURL = 'https://pokeapi.co/api/v2/pokemon/';
let pokemon = {}



const getBaseData = (urls) => {
	return axios.all(urls)
	.then(res => {
		return res
	})
};

const getBaseStats = (statObj) => {
	// create a template
	let tempObj = {
		'speed': null,
		'attack': null,
		'special-attack': null,
		'special-defense': null,
		'hp': null,
		'defense': null
	};
	// for each stat in the stat obj
	statObj.forEach(stat => {
		// set the value of the key that matches the stat
		// name to the stat base stat
		tempObj[stat.stat.name] = stat.base_stat;
	})
	// set our keys to the names we actually want
	tempObj['specialAttack'] = tempObj['special-attack'];
	tempObj['specialDefense'] = tempObj['special-defense'];
	// delete the old key names
	delete tempObj['special-attack'];
	delete tempObj['special-defense'];
	//return all our hard work
	return tempObj
};

const getAbilities = (abilityObj) => {
	let urls = [];
	let promises;
	let hiddenArr = []
	// for each ability in the ability obj
	abilityObj.forEach(ability => {
		// add the urls to our variable
		urls.push(ability.ability.url)
		// then create an array of objects
		// that we can match to the promise data
		hiddenArr.push({
			isHidden: ability.is_hidden,
			name: ability.ability.name
		})
	});

	return getPromiseData(urls)
	.then(responses => {
		let abilityData = [];
		// for each response as res
		responses.forEach(res => {
			let hidden;
			// and for each obj in the array we set earlier
			hiddenArr.forEach(hiddenObj => {
				// if the response name is the same as
				// the hidden obj aray
				if (hiddenObj.name === res.data.name) {
					// set the value of hidden
					// equal to the hidden objects hidden value
					hidden = hiddenObj.isHidden;
				}

			})
			// create an object with the values we just got
			abilityData.push({
				name: res.data.name,
				id: res.data.id,
				description: res.data.effect_entries[0].short_effect,
				isHidden: hidden
			})
		})
		// return the final obj
		return abilityData
	})
};

const getPromiseData = (urls) => {
	let promises;
	// returns an array of axios.get promises based on url array
	promises = urls.map(url => axios.get(url));
	return axios.all(promises)
	.then(res => {
		return res
	})
};

const getMoves = (moveObj) => {
	let urls = [];
	moveObj.forEach(move => {
		urls.push(move.move.url)
	})
	return getPromiseData(urls)
	.then(moves => {
		let movesData = [];
		moves.forEach(move => {
			let description;
			 move.data.flavor_text_entries.forEach(text => {
				if (text.language.name === 'en') {
					description = text.flavor_text.replace(/(?:\r\n|\r|\n)/g, ' ');
				}
			})
			movesData.push({
				id: move.data.id,
				name: move.data.name,
				accuracy: move.data.accuracy,
				pp: move.data.pp,
				priority: move.data.priority,
				power: move.data.power,
				damageClass: move.data.damage_class.name,
				target: move.data.target.name,
				type: move.data.type.name,
				description: description,
				effectEntries: move.data.effect_entries,
				effectChance: move.data.effect_chance
			})
		})
		return movesData
	})
};

const getTypes = (typeObj) => {
	let urls = [];
	typeObj.forEach(type => {
		urls.push(type.type.url)
	})
	return getPromiseData(urls)
	.then(types => {
		let typesData = [];
		types.forEach(type => {
			typesData.push({
				damage: type.data.damage_relations,
				id: type.data.id,
				name: type.data.name,
				damageClass: type.data.move_damage_class.name
			})
		})
		return typesData
	})
};

const promiseArray = (url, num) => {
	let arr = [];
	for (var i = 1; i <= num; i++) {
		arr.push(axios.get(url + i))
	}
	return arr
} 

getBaseData(promiseArray(baseURL, 2)).then(responses => {
	responses.forEach(res => {
		// lazy variable
		const data = res.data
		// set our data obj with the easy ones
		pokemon[data.name] = {
				id: data.id,
				order: data.order,
			}
		// set the base stats obj
		pokemon[data.name].baseStats = getBaseStats(data.stats)
		// set the abilities obj
		getAbilities(data.abilities)
		.then(res => {
			pokemon[data.name].abilities = res
			getMoves(data.moves)
			.then(res => {
				pokemon[data.name].moves = res
				getTypes(data.types)
				.then(res => {
					pokemon[data.name].types = res
					console.log("pokemon", pokemon)
				})
			})
		})
	})
	
})

// const updatePokemon = (minNum, maxNum) => {
// 	let pokemon = {}
// 	for (var i = minNum; i <= maxNum; i++) {

// 	}
// }

// updatePokemon(1,50)