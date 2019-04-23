"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();
exports.getAllEvents = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    const snap = yield firestore.collection('events').get();
    const onlyNewEvents = findAllNewDates(snap);
    res.status(200).send(convertSnapshotTimeStampsToSecondsSince1970(onlyNewEvents.map(doc => doc.data())));
    return removeOldDates(snap.docs, onlyNewEvents);
}));
exports.getEventById = functions.https.onRequest((req, res) => {
    const id = req.headers['id'];
    return firestore.collection('events').doc(id).get().then(snap => {
        res.status(200).send(snap.data());
    });
});
exports.addNewEvent = functions.https.onRequest((req, res) => {
    const body = req.headers;
    console.log(body);
    if (body.title !== undefined && body.detail !== undefined && body.location !== undefined && body.timestamp !== undefined) {
        const data = {
            timeStamp: new Date(body.timestamp),
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
    }
    else {
        return res.status(400).send();
    }
});
function convertSnapshotTimeStampsToSecondsSince1970(dates) {
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
function findAllNewDates(snap) {
    const returnObject = new Array();
    const currentDate = new Date().getTime();
    let oldData = new Object();
    let newdates = snap.docs.filter(doc => convertTimeStampToDateInMs(doc.data()['timeStamp']) > currentDate);
    return newdates;
}
function convertTimeStampToDateInMs(timeStamp) {
    return new Date(timeStamp).getTime();
}
function removeOldDates(oldDates, newDates) {
    const batchWrite = firestore.batch();
    const onlyOldDates = oldDates.filter(doc => newDates.find(newDoc => newDoc.id == doc.id) == undefined);
    onlyOldDates.forEach(oldDoc => batchWrite.delete(oldDoc.ref));
    return batchWrite.commit().catch(result => {
        console.error("Failed to delete old events");
    });
}
//# sourceMappingURL=index.js.map