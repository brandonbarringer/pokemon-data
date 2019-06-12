const axios = require('axios');
const _ = require('underscore');
const firebase = require('firebase');
const baseURL = 'https://pokeapi.co/api/v2/pokemon/';

const firebaseConfig = {
	apiKey: "AIzaSyAZr6SOXUHCIUN5aX6zTVG7XnY76oDYPFg",
	authDomain: "pokemon-team-builder-8cf49.firebaseapp.com",
	databaseURL: "https://pokemon-team-builder-8cf49.firebaseio.com",
	projectId: "pokemon-team-builder-8cf49",
	storageBucket: "pokemon-team-builder-8cf49.appspot.com",
	messagingSenderId: "766885399002",
	appId: "1:766885399002:web:b057b550a3c6a500"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();


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
	let hiddenArr = [];
	// for each ability in the ability obj
	abilityObj.forEach(ability => {
		// add the urls to our variable
		urls.push(ability.ability.url);
		// then create an array of objects
		// that we can match to the promise data
		hiddenArr.push({
			isHidden: ability.is_hidden,
			name: ability.ability.name
		});
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
			});
			// create an object with the values we just got
			abilityData.push({
				name: res.data.name,
				id: res.data.id,
				description: res.data.effect_entries[0].short_effect,
				isHidden: hidden
			});
		});
		// return the final obj
		return abilityData
	});
};

const getPromiseData = (urls) => {
	let promises;
	// returns an array of axios.get promises based on url array
	promises = urls.map(url => axios.get(url));
	return axios.all(promises)
	.then(res => {
		return res
	});
};

const getMoves = (moveObj) => {
	let urls = [];
	// set a bunch of urls for use to fetch
	moveObj.forEach(move => {
		urls.push(move.move.url)
	});
	return getPromiseData(urls)
	.then(moves => {
		let movesData = [];
		moves.forEach(move => {
			let description;
			// for each flavor text entry
			 move.data.flavor_text_entries.forEach(text => {
			 	// only get the english version
				if (text.language.name === 'en') {
					// replace '/n' with a space (why the hell did they add newlines?)
					// then set the description value to the better text
					description = text.flavor_text.replace(/(?:\r\n|\r|\n)/g, ' ');
				}
			});
			// create our data obj
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
			});
		});
		return movesData
	})
};

const getTypes = (typeObj) => {
	let urls = [];
	// create an arr of urls to fetch
	typeObj.forEach(type => {
		urls.push(type.type.url)
	});
	return getPromiseData(urls)
	.then(types => {
		let typesData = [];
		// set our data
		types.forEach(type => {
			let dc
			if(type.data.move_damage_class !== null) {
				dc = type.data.move_damage_class.name
			} else {
				dc = null
			}
			typesData.push({
				damage: type.data.damage_relations,
				id: type.data.id,
				name: type.data.name,
				damageClass: dc
			})
		})
		return typesData
	});
};

const promiseArray = (url, from, through) => {
	let arr = [];
	for (var i = from; i <= through; i++) {
		arr.push(axios.get(url + i))
	}
	return arr
}

let pokemon = {}
getBaseData(promiseArray(baseURL, 801, 807))
.then(responses => {
	responses.forEach(res => {
		// lazy variable
		const data = res.data;
		// set our data obj with the easy ones

		let pokemon = {
			name: data.name,
			id: data.id,
			order: data.order,
		}
		// set the base stats obj
		pokemon.baseStats = getBaseStats(data.stats)
		// set the abilities obj
		pokemon[data.name].abilities = getAbilities(data.abilities)
		.then(res => {
			pokemon.abilities = res
			getMoves(data.moves)
			.then(res => {
				pokemon.moves = res
				getTypes(data.types)
				.then(res => {
					pokemon.types = res
					database.ref('pokemon').push().set(pokemon)
					// console.log(pokemon)
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