import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { on } from 'cluster';

admin.initializeApp()
const firestore = admin.firestore()

export const getAllEvents = functions.https.onRequest( async (req, res) => {
        const snap = await firestore.collection('events').get();
        const onlyNewEvents = findAllNewDates(snap);

        res.status(200).send(convertSnapshotTimeStampsToSecondsSince1970(onlyNewEvents.map(doc => doc.data())));
    
        return removeOldDates(snap.docs, onlyNewEvents);
});

export const getEventById = functions.https.onRequest((req, res) => {
    const id = req.headers['id'] as string;

    return firestore.collection('events').doc(id).get().then(snap => {
        res.status(200).send(snap.data());
    })
});

export const addNewEvent = functions.https.onRequest((req, res) => {
    const body = req.headers;
    console.log(body);
    if ( body.title !== undefined && body.detail !== undefined && body.location !== undefined && body.timestamp !== undefined ) {
        const data = {
            timeStamp: new Date(body.timestamp as string), 
            title: body.title, 
            detail: body.detail, 
            location: body.location, 
            displayColor: body.displaycolor, 
            durationMinutes: body.durationminutes
        };
        return firestore.collection('events').add(data).then(() => {
            res.status(200).send();
        }).catch(() => {
            res.status(418).send();
        });
    } else {
        return res.status(400).send();
    }
});

function convertSnapshotTimeStampsToSecondsSince1970(dates: Array<Object>): Array<Object> {
    const returnValue = [];
    dates.forEach(date => {
        const tempObject = new Object();
        Object.assign(tempObject, date);

        if (date['timeStamp']) {
            const msDate = date['timeStamp'];
            tempObject['timeStamp'] = new Date(msDate).getTime() / 1000.0;
            returnValue.push(tempObject);
        }
    });

    return returnValue;
}

function findAllNewDates(snap: FirebaseFirestore.QuerySnapshot): Array<FirebaseFirestore.QueryDocumentSnapshot> {
    const returnObject = new Array<Object>();
    const currentDate = new Date().getTime();
    let oldData = new Object();

    let newdates = snap.docs.filter(doc => convertTimeStampToDateInMs(doc.data()['timeStamp']) > currentDate);

    return newdates;
}

function convertTimeStampToDateInMs(timeStamp: string): number {
    return new Date(timeStamp).getTime();
}

function removeOldDates(oldDates: Array<FirebaseFirestore.QueryDocumentSnapshot>, newDates: Array<FirebaseFirestore.QueryDocumentSnapshot>) {
    const batchWrite = firestore.batch()
    const onlyOldDates = oldDates.filter(doc => newDates.find(newDoc => newDoc.id == doc.id) == undefined);

    onlyOldDates.forEach(oldDoc => batchWrite.delete(oldDoc.ref));
    return batchWrite.commit().catch(result => {
        console.error("Failed to delete old events");
    });
}
