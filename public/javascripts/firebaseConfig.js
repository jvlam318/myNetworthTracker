// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCiugEL1RLNv3kFeFjdQiEzlip9PS8nL88",
  authDomain: "node-mynetworthtracker.firebaseapp.com",
  databaseURL: "https://node-mynetworthtracker.firebaseio.com",
  projectId: "node-mynetworthtracker",
  storageBucket: "node-mynetworthtracker.appspot.com",
  messagingSenderId: "54463872155",
  appId: "1:54463872155:web:bdef1e104ebbcfd1785a3e",
  measurementId: "G-93108QYVSN"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
firebase.analytics();
