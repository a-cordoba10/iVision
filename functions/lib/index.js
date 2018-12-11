"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Configure SDK
admin.initializeApp(functions.config().firebase);
const messaging = admin.messaging();
class FCMNotification {
    constructor(title, body) {
        this.notification = { title: title, body: body };
    }
}
exports.FCMNotification = FCMNotification;
/**
 * iOS-Specific notification payload
*/
class APSDictionary {
}
exports.modifyCircleObject = functions.firestore
    .document('circles/{circleID}/objects/{objectID}')
    .onWrite((change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    const oldDocument = change.before.data();
    console.log('doc 1 :', document);
    console.log('llega a object.');
    if (document.state != oldDocument.state && document.state == 1) {
        const fcm = new FCMNotification('El objeto ' + document.name + ' ha salido', 'Hemos encontrado que uno de tus objetos valiosos salió de tu casa');
        fcm.apns = { payload: { aps: { badge: 1 } } };
        fcm.topic = context.params.circleID;
        messaging.send(fcm).then(_ => {
            console.log('Notification sent successfuly.');
        }).catch(error => {
            console.log('Error sending notification.');
            console.log(error);
        });
    }
    else if (document.state != oldDocument.state && document.state == 0) {
        const fcm = new FCMNotification('El objeto ' + document.name + ' ha entrado', 'Hemos encontrado que uno de tus objetos valiosos entró a tu casa');
        fcm.apns = { payload: { aps: { badge: 1 } } };
        fcm.topic = context.params.circleID;
        messaging.send(fcm).then(_ => {
            console.log('Notification sent successfuly.');
        }).catch(error => {
            console.log('Error sending notification.');
            console.log(error);
        });
    }
});
exports.modifyCircle = functions.firestore
    .document('circles/{circleID}')
    .onWrite((change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    const oldDocument = change.before.data();
    if (document.open != oldDocument.open && document.open) {
        const fcm = new FCMNotification('Abierto! Tu ' + document.name + ' esta abierto', 'Uno de los integrantes de tu circulo ha abierto tu circulo');
        fcm.apns = { payload: { aps: { badge: 1 } } };
        fcm.topic = document.id;
        messaging.send(fcm).then(_ => {
            console.log('Notification sent successfuly.');
        }).catch(error => {
            console.log('Error sending notification.');
            console.log(error);
        });
    }
    else if (document.open != oldDocument.open && !document.open) {
        const fcm = new FCMNotification('Cerrado! Tu ' + document.name + ' ha sido cerrado', 'Tu ciruclo ha sido cerrado');
        fcm.apns = { payload: { aps: { badge: 1 } } };
        fcm.topic = context.params.circleID;
        messaging.send(fcm).then(_ => {
            console.log('Notification sent successfuly.');
        }).catch(error => {
            console.log('Error sending notification.');
            console.log(error);
        });
    }
    if (document.hasOwnProperty('emergency') && oldDocument.hasOwnProperty('emergency') && document.emergency && document.emergency != oldDocument.emergency) {
        const fcm = new FCMNotification('Emergencia! Tu ' + document.name + ' esta en emegencia', 'Uno de los integrantes de tu circulo ha activado el modo emergencia');
        fcm.apns = { payload: { aps: { badge: 1 } } };
        fcm.topic = document.id;
        messaging.send(fcm).then(_ => {
            console.log('Notification sent successfuly.');
        }).catch(error => {
            console.log('Error sending notification.');
            console.log(error);
        });
    }
    else if (document.hasOwnProperty('emergency') && oldDocument.hasOwnProperty('emergency') && !document.emergency && document.emergency != oldDocument.emergency) {
        const fcm = new FCMNotification('No más Emergencía! Tu ' + document.name + ' ya no se encuentra en emegencia', 'Uno de los integrantes de tu circulo ha desactivado el modo emergencia');
        fcm.apns = { payload: { aps: { badge: 1 } } };
        fcm.topic = context.params.circleID;
        messaging.send(fcm).then(_ => {
            console.log('Notification sent successfuly.');
        }).catch(error => {
            console.log('Error sending notification.');
            console.log(error);
        });
    }
});
//# sourceMappingURL=index.js.map