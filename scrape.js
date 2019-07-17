const axios = require('axios');
const cheerio = require('cheerio');
let $;

const url = 'https://pokemondb.net/pokedex/bulbasaur';

const getDocument = async (url) => {
	return axios({
		method: 'get',
		url: url,
		reponseType: 'document'
	});
};

const getStatByName = (name) => {
	return $('th:contains("' + name + '")').next('td');
};

const getStatsArray = (el) => {
	const arr = [];
	el.each(function(index, el) {
		arr[index] = $(this).text()
	});
	return arr;
}

const getDefenses = () => {
	const values = $('.type-table .type-fx-cell');
	const labels = $('.type-table .type-icon');
	const damages = {};

	const types = labels.map(function(){
		return $(this).attr('title').toLowerCase();
	}).get();

	values.each(function(index, elem) {
		damages[types[index]] = Number($(this).attr('class').split(' ')[1].split('-')[2])
	})
	return damages
}

const getEvolutions = () => {
	const evoNames = $('.infocard-list-evo .ent-name');
	const evolutions = [];

	const levels = $('.infocard-list-evo .infocard-arrow small').map(function(){
		return parseInt($(this).text().split(' ')[1], 10);
	}).get();

	evoNames.each(function(index, elem) {
		const levelValue = index > 0 ? levels[index -1] : null
		evolutions[index] = {
			'name' : $(this).text().toLowerCase(),
			'level' : levelValue
		}
	});

	return evolutions;

}

const getMoves = () => {
	/*
	{
		name: null,
		level: null,,
		type: null,
		category: null,
		power: null,
		accurracy: null,
		tm: null,
		egg: null,
		tutor: null,
		transfer: null,
		pp: null,
		targets: {
			foe: [true, true, false],
			ally: [true, false],
			user: true
		},
		effect: null,
		games:
	}

	*/
}

getDocument(url).then(doc => {
	$ = cheerio.load(doc.data);
	const name = $('h1').text();
	const id = getStatByName('National').text();
	const types = getStatsArray(getStatByName('Type').children('a'));
	const abilities = getStatsArray(getStatByName('Abilities').find('a'));
	const hp = getStatByName('HP').text();
	const attack = getStatByName('Attack').text();
	const defense = getStatByName('Defense').text();
	const specialAttack = getStatByName('Sp. Atk').text();
	const specialDefense = getStatByName('Sp. Def').text();
	const speed = getStatByName('Speed').text();
	const total = getStatByName('Total').text();
	const defenses = getDefenses();
	const evolutions = getEvolutions();
	console.log(evolutions);
});
