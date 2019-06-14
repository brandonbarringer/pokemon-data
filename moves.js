const admin = require('firebase-admin')
const functions = require('firebase-functions')
const serviceAccount = require('./firebaseServiceKey.json')
const FieldValue = admin.firestore.FieldValue


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
const pokemon = db.collection('pokemon').where('id', '>', 400).where('id', '<=', 500)

// db.runTransaction(transaction => {
// 	return transaction.get(pokemon)
// 	.then(query => {
// 		console.log('query: ', query)
// 	})
// 	.catch(err => {
// 		console.log('err: ', err)
// 	})
// })
// .then(result => {
// 	console.log('result: ', result)
// })
// .catch(err => {
// 	console.log('last err: ', err)
// })

// pokemon.get()
// .then(query => {
// 	console.log(query)
// })

pokemon.get()
.then(query => {
	query.forEach(doc => {
		let data = doc.data();
		let name = data.name;
		let moves = data.moves;
		moves.forEach(move => {
			let moveName = move.name
			db.collection('pokemon').doc(name).collection('moves').doc(moveName).set(move)
			.then()
			.catch(err => {
				console.log(err)
			})
		})
	})
})
