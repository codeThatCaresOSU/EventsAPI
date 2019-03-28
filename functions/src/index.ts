import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp()
const firestore = admin.firestore()

export const getAllEvents = functions.https.onRequest((req, res) => {
    return firestore.collection('events').get().then(snap => {

        let updatedObject = [];

        // The following code is modifying the returned timestamp so it is in the format of Seconds from 1970
        snap.docs.forEach(doc => {

            let newObject = {};
            Object.assign(newObject, doc.data());

            let oldTime = newObject['timeStamp'];
            let newDateObject = new Date(oldTime).getTime() / 1000.0;

            newObject['timeStamp'] = newDateObject;
            updatedObject.push(newObject);
        });

        res.status(200).send(updatedObject);
    });
});

export const getEventById = functions.https.onRequest((req, res) => {
    const id = req.headers['id'] as string;

    return firestore.collection('events').doc(id).get().then(snap => {
        res.status(200).send(snap.data());
    })
});
