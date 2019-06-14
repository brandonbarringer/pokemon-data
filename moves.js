const admin = require('firebase-admin')
const functions = require('firebase-functions')
const serviceAccount = require('./firebaseServiceKey.json')
const FieldValue = admin.firestore.FieldValue


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
const pokemon = db.collection('pokemon').limit(1)

pokemon.get()
.then(query => {
	query.forEach(doc => {
		let data = doc.data();
		let name = data.name;
		let moves = data.moves;
		// console.log(name)
		// db.collection('pokemon')
		// .doc(name)
		// .collection('moves')
		// .set({
		// 	[moves.name]: moves
		// })
		console.log({
			[moves.name]: moves
		})
	})
})
