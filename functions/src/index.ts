import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp()
const firestore = admin.firestore()

export const getAllEvents = functions.https.onRequest((req, res) => {
    return firestore.collection('events').get().then(snap => {
        res.status(200).send(convertSnapshotTimeStampsToSecondsSince1970(snap));
    });
});

export const getEventById = functions.https.onRequest((req, res) => {
    const id = req.headers['id'] as string;

    return firestore.collection('events').doc(id).get().then(snap => {
        res.status(200).send(snap.data());
    })
});

function convertSnapshotTimeStampsToSecondsSince1970(snap: FirebaseFirestore.QuerySnapshot): Array<Object> {
    let returnValue = [];

    snap.docs.forEach(doc => {

        let newObject = {};
        Object.assign(newObject, doc.data());

        let oldTime = newObject['timeStamp'];
        let newDateObject = new Date(oldTime).getTime() / 1000.0;

        newObject['timeStamp'] = newDateObject;
        returnValue.push(newObject);
    });

    return returnValue;
}
