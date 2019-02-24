"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();
exports.getAllEvents = functions.https.onRequest((req, res) => {
    return firestore.collection('events').get().then(snap => {
        res.status(200).send(snap.docs.map(doc => doc.data()));
    });
});
//# sourceMappingURL=index.js.map