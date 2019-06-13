const oldDB = require('./pokemon-team-builder-8cf49-export.json');
const _ = require('underscore');
const admin = require('firebase-admin')
const functions = require('firebase-functions')
let serviceAccount = require('./firebaseServiceKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

Object.keys(oldDB.pokemon).forEach((key, index) => {
	// only the ones we want
	if (index <= 600 || index > 807) {
		return
	}
	// get the name of the obj
	let newKey = oldDB.pokemon[key].name;
	// create a new obj using the old obj data
	oldDB.pokemon[newKey] = oldDB.pokemon[key];
	// delete the old data
	delete oldDB.pokemon[key];
	// write the document to the database
	db.collection('pokemon').doc(newKey).set(oldDB.pokemon[newKey])
})