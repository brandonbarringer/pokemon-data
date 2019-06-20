const admin = require('firebase-admin')
const functions = require('firebase-functions')
const serviceAccount = require('./firebaseServiceKey.json')
const FieldValue = admin.firestore.FieldValue


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
const pokemon = db.collection('pokemon').where('id', '==', 1)

const setAbilities = (obj) => {};
const setDamage = (obj) => {};
const setTypes = (obj) => {};

pokemon.get()
.then(query => {
	query.forEach(doc => {
		const 	data = doc.data(),
		 		name = data.name,
		 		abilities = data.abilities,
		 		types = data.types,
		 		stats = data.baseStats,
				newAbilityData = setAbilities(),
				newTypes = setTypes(),
				newDamage = setDamage();

			// pokemon.doc(name).set({
			// 	types: newTypes,
			// 	damage: newDamage,
			// 	abilities: newAbilityData
			// })
			// pokemon.doc(name).update({
			// 	types: FieldValue.delete(),
			// 	abilities: FieldValue.delete()
			// })
		/* 
		abilities: 
			name: {
				description,
				id,
				isHidden,
				name
			}
		damage:
			doubleDamageFrom,
			doubleDamageTo,
			halfDamageFrom,
			halfDamageTo,
		types:
			name: {
				damageClass
				id,
				name
			}
		*/
	})
})
