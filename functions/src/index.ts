import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp()
const firestore = admin.firestore()

export const getAllEvents = functions.https.onRequest( async (req, res) => {
        const snap = await firestore.collection('events').get();
        const onlyNewEvents = findAllNewDates(snap);
        const batchWrite = firestore.batch()
        
        res.status(200).send(convertSnapshotTimeStampsToSecondsSince1970(onlyNewEvents));

        // Basically here we are pushing only the new events back to the api
        snap.docs.forEach(doc => {
            const docId = doc.id;
            const docData = doc.data();
            
            if (docData['timeStamp'] && new Date(docData['timeStamp']).getTime() < new Date().getTime()) {
                const docRef = firestore.collection('events').doc(docId);
                batchWrite.delete(docRef);
            }
        });

        return batchWrite.commit();
});

export const getEventById = functions.https.onRequest((req, res) => {
    const id = req.headers['id'] as string;

    return firestore.collection('events').doc(id).get().then(snap => {
        res.status(200).send(snap.data());
    })
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

function findAllNewDates(snap: FirebaseFirestore.QuerySnapshot): Array<Object> {
    const returnObject = new Array<Object>();
    const currentDate = new Date().getTime();
    let oldData = new Object();

    snap.docs.forEach(doc => {
        oldData = doc.data();

        if (oldData['timeStamp'] && new Date(oldData['timeStamp']).getTime() > currentDate) {
            returnObject.push(oldData);
        }
    });

    return returnObject;
}
