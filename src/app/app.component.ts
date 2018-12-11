import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';

export interface Metadata {
  barChartLabels: string[];
  barChartLabels2: string[];
  barChartLabels3: string[];
  barChartLabels4: string[];
  barChartData: { data: any[]; label: string; }[];
  barChartData2: { data: any[]; label: string; }[];
  barChartData3: { data: any[]; label: string; }[];
  barChartData4: { data: any[]; label: string; }[];
}

export interface User {
  creationDate: Date;
  email: string;
  id?: string;
  lastUpdated: Date;
  name: string;
  phone: string;
  circles?: Array<Circle>;
}
export interface Circle {
  name: string;
  objectID: string;
  ref: string;
  participants?: User[];
}
export interface CircleObj {
  leaderID: string;
  name: string;
  location: firebase.firestore.GeoPoint;
  imageUrl: string;
  addrress: string;
  objects: Array<HouseObject>;
  participants: Array<Participant>;
  history: Array<HouseHistory>;
}
export interface HouseObject {
  image: string;
  name: string;
  circleID: string;
  RFIDCode: string;
  state: number;
}

export interface Participant {
  name: string;
  phone: string;
  ref: string;
  objectID: string;
}

export interface HouseHistory {
  action: number;
  name: string;
  date: Date;
  objectType: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  mdRef: AngularFirestoreDocument<Metadata>;
  md$: Observable<Metadata>;
  usersCollectionRef: AngularFirestoreCollection<User>;
  user$: Observable<User[]>;
  circlesCollectionRef: AngularFirestoreCollection<Circle>;
  circle$: Observable<Circle[]>;
  userDoc: AngularFirestoreDocument<User>;
  cUser: Observable<User>;
  circleDoc: AngularFirestoreDocument<CircleObj>;
  cCircle: Observable<CircleObj>;
  circleHistoryDoc: AngularFirestoreCollection<HouseHistory>;
  cHistoryCircle: Observable<HouseHistory[]>;
  circleObjectsDoc: AngularFirestoreCollection<HouseObject>;
  cObjectsCircle: Observable<HouseObject[]>;
  modalUser = false;
  modalCircle = false;
  userList = 0;
  circleTab = 0;
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels: string[] = [];
  public barChartLabels2: string[] = [];
  public barChartLabels3: string[] = [];
  public barChartLabels4: string[] = [];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    { data: [], label: 'Círculos x Usuario' }
  ];
  public barChartData2 = [
    { data: [], label: 'Usuarios x Círculo' }
  ];
  public barChartData3 = [
    { data: [], label: 'Objetos x Círculo' }
  ];
  public barChartData4 = [
    { data: [], label: 'Historial x Círculo' }
  ];
  // events
  constructor(private afs: AngularFirestore) {
    this.usersCollectionRef = this.afs.collection<User>('users');
    this.user$ = this.usersCollectionRef.valueChanges();

    this.circlesCollectionRef = this.afs.collection<Circle>('circles');
    this.circle$ = this.circlesCollectionRef.valueChanges();

    this.mdRef = this.afs.doc<Metadata>('metadata/metadata');
    this.md$ = this.mdRef.valueChanges();
    this.md$.subscribe(data => {
      this.barChartData = data.barChartData;
      this.barChartData2 = data.barChartData2;
      this.barChartData3 = data.barChartData3;
      this.barChartData4 = data.barChartData4;
      this.barChartLabels = data.barChartLabels;
      this.barChartLabels2 = data.barChartLabels2;
      this.barChartLabels3 = data.barChartLabels3;
      this.barChartLabels4 = data.barChartLabels4;
    });

    // this.circlesXuser();
    // this.usersXcircle();
  }
  circlesXuser() {
    this.user$.subscribe(userList => {
      let currentUser;
      let currentLength;
      let flag;
      for (let i = 0; i < userList.length; i++) {
        currentUser = userList[i];
        if (currentUser.circles) {
          flag = false;
          currentLength = currentUser.circles.length;
          for (let j = 0; j < this.barChartLabels.length; j++) {
            if (currentLength === this.barChartLabels[j]) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            this.barChartLabels.push(currentLength);
            const filteredArray = userList.filter((v) => (v.circles ? v.circles.length === currentLength : [])).length;
            this.barChartData[0].data.push(filteredArray);
          }
        }
      }
    });
  }
  usersXcircle() {
    this.circle$.subscribe(userList => {
      let currentUser;
      let currentLength;
      let flag;
      for (let i = 0; i < userList.length; i++) {
        currentUser = userList[i];
        if (currentUser.participants) {
          flag = false;
          currentLength = currentUser.participants.length;
          for (let j = 0; j < this.barChartLabels2.length; j++) {
            if (currentLength === this.barChartLabels2[j]) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            this.barChartLabels2.push(currentLength);
            const filteredArray = userList.filter((v) => (v.participants ? v.participants.length === currentLength : [])).length;
            this.barChartData2[0].data.push(filteredArray);
          }
        }

        const cirObjRef = this.afs.collection<HouseObject>('circles/' + currentUser.id + '/objects');
        const circObjDoc = cirObjRef.valueChanges().subscribe(data => {
          if (data) {
            let flagData = false;
            const dataLength = data.length + '';
            for (let j = 0; j < this.barChartLabels3.length; j++) {
              if (dataLength === this.barChartLabels3[j]) {
                this.barChartData3[0].data[j] = this.barChartData3[0].data[j] + 1;
                flagData = true;
                break;
              }
            }
            if (!flagData) {
              this.barChartLabels3.push(dataLength);
              this.barChartData3[0].data.push(1);
            }
          }
        });
        const circHistRef = this.afs.collection<HouseHistory>('circles/' + currentUser.id + '/history');
        const circHistDoc = circHistRef.valueChanges().subscribe(data => {
          if (data) {
            let flagData = false;
            const dataLength = data.length + '';
            for (let j = 0; j < this.barChartLabels4.length; j++) {
              if (dataLength === this.barChartLabels4[j]) {
                this.barChartData4[0].data[j] = this.barChartData4[0].data[j] + 1;
                flagData = true;
                break;
              }
            }
            if (!flagData) {
              this.barChartLabels4.push(dataLength);
              this.barChartData4[0].data.push(1);
            }
          }
        });
      }
    });
  }
  openUser(id) {
    this.userDoc = this.afs.doc<User>('users/' + id);
    this.cUser = this.userDoc.valueChanges();
    this.modalUser = true;
    this.modalCircle = false;
  }
  saveData() {
    const metadataRef = this.afs.doc('metadata/metadata');
    const mdObject = {
      'barChartLabels' : this.barChartLabels,
      'barChartLabels2' : this.barChartLabels2,
      'barChartLabels3' : this.barChartLabels3,
      'barChartLabels4' : this.barChartLabels4,
      'barChartData' : this.barChartData,
      'barChartData2' : this.barChartData2,
      'barChartData3' : this.barChartData3,
      'barChartData4' : this.barChartData4,
    };
    metadataRef.set(mdObject, {merge: true});
  }
  openCircle(id) {
    this.circleTab = 0;
    this.circleDoc = this.afs.doc<CircleObj>('circles/' + id);
    this.cCircle = this.circleDoc.valueChanges();
    this.circleObjectsDoc = this.afs.collection<HouseObject>('circles/' + id + '/objects');
    this.cObjectsCircle = this.circleObjectsDoc.valueChanges();
    this.circleHistoryDoc = this.afs.collection<HouseHistory>('circles/' + id + '/history');
    this.cHistoryCircle = this.circleHistoryDoc.valueChanges();
    this.modalCircle = true;
    this.modalUser = false;
  }
  closeModal(a) {
    if (a === 'u') {
      this.modalUser = false;
    } else {
      this.circleTab = 0;
      this.modalCircle = false;
    }
  }
  toggleTab(a) {
    this.userList = a as number;
  }
  toggleCircleTab(a) {
    this.circleTab = a;
  }
}

// export class AppComponent {
//   title = 'iVision';
//   usersCollectionRef: AngularFirestoreCollection<User>;
//   circlesCollectionRef: AngularFirestoreCollection<CircleObj>;
//   user$: Observable<User[]>;
//   userCollection: User[];
//   constructor(private afs: AngularFirestore) {
//     this.usersCollectionRef = this.afs.collection<User>('users');
//     this.circlesCollectionRef = this.afs.collection<CircleObj>('circles');
//     let id$;
//     let user;
//     let circle;
//     let participants = new Array();
//     this.userCollection = new Array();
//     const circlesCollection = new Array();
//     for (let i = 0; i < 15; i++) {
//       id$ = this.afs.createId();
//       // tslint:disable-next-line:max-line-length
// tslint:disable-next-line:max-line-length
//       user = { creationDate: this.randomDate(new Date(2018, 1, 1), new Date(2018, 12, 31)), email: this.makeID() + '@gmail.com', id: id$, lastUpdated: new Date(), name: this.makeName(), phone: '+57310' + this.makePhone() };
//       this.usersCollectionRef.doc(id$).set(user);
//       this.userCollection.push(user);
//     }
//     console.log('Users Done');
//     for (let i = 0; i < 500; i++) {
//       id$ = this.afs.createId();
//       const circleName = 'Circle' + (i + 150);
//       this.enterIDCircle(circleName, id$);
//       // tslint:disable-next-line:max-line-length
// tslint:disable-next-line:max-line-length
//       circle = {id: id$,  leaderID: 'MMCwqpLkR0dEMUoPP9ZZuMnlSnv1', name: circleName, location: new firebase.firestore.GeoPoint((Math.floor(Math.random() * 90) + 1) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1), (Math.floor(Math.random() * 180) + 1) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1)), imageUrl: this.randomImg(), addrress: this.makeID() };
//       for (let k = 0; k < 8; k++) {
//         participants.push(this.enterUserCircle(circleName, id$));
//       }
//       circle.participants = participants;
//       participants = [];
//       circlesCollection.push(id$);
//       this.circlesCollectionRef.doc(id$).set(circle).then(() => {
//         for (let h = 0; h < 20; h++) {
//           this.afs.collection('circles').doc(circlesCollection[0]).collection('objects').add(this.createNewObject(circlesCollection[0]));
//           this.afs.collection('circles').doc(circlesCollection[0]).collection('history').add(this.createNewHistory());
//         }
//         circlesCollection.shift();
//       });
//     }
//     console.log('circles done');

//   }
//   createNewObject(id$) {
//     return {image: this.randomImg(), name: this.makeID(), circleID: id$, RFIDCode: this.makeID(), state: Math.round(Math.random())};
//   }
//   createNewHistory() {
//     const action = Math.round(Math.random());
//     const type = Math.round(Math.random());
//     let name;
//     if (action === 0) {
//       if (type === 0) {
//         name = 'El objeto salió';
//       } else {
//         name = 'El usuario salió';
//       }
//     } else {
//       if (type === 0) {
//         name = 'El objeto entró';
//       } else {
//         name = 'El usuario entró';
//       }
//     }
//     return {action: action, name: name, date: this.randomDate(new Date(2018, 1, 1), new Date(2018, 12, 31)), objectType: type};
//   }
//   randomDate(start, end) {
//     return new Date(+start + Math.random() * (end - start));
//   }
//   randomUser() {
//     return this.userCollection[Math.floor(Math.random() * this.userCollection.length)];
//   }
//   enterIDCircle(name$, objectID$) {
//     const currentCircle = { name: name$, objectID: objectID$, ref: 'circles/' + objectID$ };
// tslint:disable-next-line:max-line-length
//     this.usersCollectionRef.doc('MMCwqpLkR0dEMUoPP9ZZuMnlSnv1').update({circles: firebase.firestore.FieldValue.arrayUnion(currentCircle)});
//   }
//   enterUserCircle(name$, objectID$) {
//     const currentCircle = { name: name$, objectID: objectID$, ref: 'circles/' + objectID$ };
//     const user = this.userCollection[Math.floor(Math.random() * this.userCollection.length)];
//     this.usersCollectionRef.doc(user.id).update({circles: firebase.firestore.FieldValue.arrayUnion(currentCircle)});
//     return { name: user.name, phone: user.phone, ref: 'users/' + user.id, objectID: user.id };
//   }
//   makeID() {
//     let text = '';
//     const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     for (let i = 0; i < 5; i++) {
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
//   }
//   makePhone() {
//     let text = '';
//     const possible = '0123456789';
//     for (let i = 0; i < 6; i++) {
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
//   }
//   randomImg() {
//     // tslint:disable-next-line:max-line-length
// tslint:disable-next-line:max-line-length
//     const names = ['https://images.pexels.com/photos/1050310/pexels-photo-1050310.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/908284/pexels-photo-908284.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/734543/pexels-photo-734543.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/825262/pexels-photo-825262.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/1011334/pexels-photo-1011334.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/187334/pexels-photo-187334.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/404168/pexels-photo-404168.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/267596/pexels-photo-267596.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/814822/pexels-photo-814822.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/1393307/pexels-photo-1393307.jpeg?auto=compress&cs=tinysrgb&h=350'];
//     return names[Math.floor(Math.random() * names.length)];
//   }
//   makeName() {
//     const names = [
//       'Aaberg'
//       ,
//       'Aalst'
//       ,
//       'Aara'
//       ,
//       'Aaren'
//       ,
//       'Aarika'
//       ,
//       'Aaron'
//       ,
//       'Aaronson'
//       ,
//       'Ab'
//       ,
//       'Aba'
//       ,
//       'Abad'
//       ,
//       'Abagael'
//       ,
//       'Abagail'
//       ,
//       'Abana'
//       ,
//       'Abate'
//       ,
//       'Abba'
//       ,
//       'Abbate'
//       ,
//       'Abbe'
//       ,
//       'Abbey'
//       ,
//       'Abbi'
//       ,
//       'Abbie'
//       ,
//       'Abbot'
//       ,
//       'Abbotsen'
//       ,
//       'Abbotson'
//       ,
//       'Abbotsun'
//       ,
//       'Abbott'
//       ,
//       'Abbottson'
//       ,
//       'Abby'
//       ,
//       'Baal'
//       ,
//       'Baalbeer'
//       ,
//       'Baalman'
//       ,
//       'Bab'
//       ,
//       'Babara'
//       ,
//       'Babb'
//       ,
//       'Babbette'
//       ,
//       'Babbie'
//       ,
//       'Babby'
//       ,
//       'Babcock'
//       ,
//       'Babette'
//       ,
//       'Babita'
//       ,
//       'Babs'
//       ,
//       'Bac'
//       ,
//       'Bacchus'
//       ,
//       'Bach'
//       ,
//       'Bachman'
//       ,
//       'Backer'
//       ,
//       'Backler'
//       ,
//       'Bacon'
//       ,
//       'Badger'
//       ,
//       'Badr'
//       ,
//       'Baecher'
//       ,
//       'Bael'
//       ,
//       'Baelbeer'
//       ,
//       'Baer'
//       ,
//       'Baerl'
//       ,
//       'Baerman'
//       ,
//       'Baese'
//       ,
//       'Bagger'
//       ,
//       'Baggett'
//       ,
//       'Baggott'
//       ,
//       'Baggs'
//       ,
//       'Bagley'
//       ,
//       'Bahner'
//       ,
//       'Bahr'
//       ,
//       'Baiel'
//       ,
//       'Bail'
//       ,
//       'Bailar'
//       ,
//       'Bailey'
//       ,
//       'Bailie'
//       ,
//       'Bywaters'
//       ,
//       'Bywoods'
//       ,
//       'Cacia'
//       ,
//       'Cacie'
//       ,
//       'Cacilia'
//       ,
//       'Cacilie'
//       ,
//       'Cacka'
//       ,
//       'Cad'
//       ,
//       'Cadal'
//       ,
//       'Caddaric'
//       ,
//       'Caddric'
//       ,
//       'Cade'
//       ,
//       'Cadel'
//       ,
//       'Cadell'
//       ,
//       'Cadman'
//       ,
//       'Cadmann'
//       ,
//       'Cadmar'
//       ,
//       'Cadmarr'
//       ,
//       'Caesar'
//       ,
//       'Caesaria'
//       ,
//       'Caffrey'
//       ,
//       'Cagle'
//       ,
//       'Cahan'
//       ,
//       'Cahilly'
//       ,
//       'Cahn'
//       ,
//       'Cahra'
//       ,
//       'Cai'
//       ,
//       'Caia'
//       ,
//       'Caiaphas'
//       ,
//       'Cailean'
//       ,
//       'Cailly'
//       ,
//       'Cain'
//       ,
//       'Caine'
//       ,
//       'Caines'
//       ,
//       'Cairistiona'
//       ,
//       'Cairns'
//       ,
//       'Caitlin'
//       ,
//       'Caitrin'
//       ,
//       'Cal'
//       ,
//       'Calabrese'
//       ,
//       'Calabresi'
//       ,
//       'Calan'
//       ,
//       'Calandra'
//       ,
//       'Calandria'
//       ,
//       'Calbert'
//       ,
//       'Caldeira'
//       ,
//       'Calder'
//       ,
//       'Caldera'
//       ,
//       'Cordova'
//       ,
//       'Cordula'
//       ,
//       'Cordy'
//       ,
//       'Coreen'
//       ,
//       'Corel'
//       ,
//       'Corell'
//       ,
//       'Corella'
//       ,
//       'Corena'
//       ,
//       'Corenda'
//       ,
//       'Corene'
//       ,
//       'Coretta'
//       ,
//       'Corette'
//       ,
//       'Corey'
//       ,
//       'Cori'
//       ,
//       'Coridon'
//       ,
//       'Corie'
//       ,
//       'Corilla'
//       ,
//       'Corin'
//       ,
//       'Corina'
//     ];
//     let name = '';
//     for (let i = 0; i < 3; i++) {
//       name = name + ' ' + names[Math.floor(Math.random() * names.length)];
//     }
//     return name;
//   }

// }


