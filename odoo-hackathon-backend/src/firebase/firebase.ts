import admin from 'firebase-admin';
import * as path from 'path';


const setupFirebase = () => {

const serviceAccount = require(path.join(__dirname, '..', '..', 'src/firebase/demoapp-ca97d-firebase-adminsdk-lttsw-448b17d40a.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
}

const getFirestore = () => {
  const db = admin.firestore();
  return db;
}

const getStorageBucket = () => {
  const bucket = admin.storage().bucket();
  return bucket;
}

export default {setupFirebase, getFirestore , getStorageBucket};