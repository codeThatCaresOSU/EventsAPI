import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp()
const firestore = admin.firestore()

export const getAllEvents = functions.https.onRequest((req, res) => {
    return firestore.collection('events').get().then(snap => {
        res.status(200).send(snap.docs.map(doc => doc.data()));
    });
});
