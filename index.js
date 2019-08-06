require('dotenv');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID || 'simplelegal-df8d8',
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get custom module
const { getData, saveData } = require('./general');

// Get database values
const templates = require('./database-structure/templates.json');
const contentTypes = require('./database-structure/contentType.json');
const forms = require('./database-structure/forms.json');

const mainQuery = firebase
  .firestore()
  .collection('Documents')
  .doc('colombia');

function uploadForm(id, index, Forms) {
  const form = Forms[index];
  if (form) {
    mainQuery
      .collection('Forms')
      .doc(id)
      .set(form)
      .then(() => {
        // Save data
        const formsData = getData('firebase-backup/forms.json');
        formsData.push(form);
        saveData('firebase-backup/forms.json', formsData);
        // Print message
        console.log('Document successfully written!');
      })
      .catch((error) => {
        console.log('Error writing document: ', error);
      });
  }
}

function uploadTemplateInfo(Templates = [], Forms = []) {
  Templates.forEach((template, index) => {
    const add = {
      ...template,
      created: firebase.firestore.Timestamp.now(),
      updated: firebase.firestore.Timestamp.now(),
    };
    mainQuery
      .collection('Templates')
      .add(add)
      .then(async (docRef) => {
        // Save data
        const templatesData = getData('firebase-backup/templates.json');
        templatesData.push(add);
        saveData('firebase-backup/templates.json', templatesData);
        // Print current id and message
        console.log('Document successfully written!');
        console.log(docRef.id);
        await uploadForm(docRef.id, index, Forms);
      })
      .catch((error) => {
        console.log('Error writing document: ', error);
      });
  });
}

function uploadContentTypes(typeFields = {}) {
  Object.keys(typeFields).forEach((key) => {
    const nestedContent = typeFields[key];
    firebase
      .firestore()
      .collection('ContentTypes')
      .doc(key)
      .set(nestedContent)
      .then(() => {
        // Print message
        console.log('Document successfully written!');
      })
      .catch((error) => {
        console.log('Error writing document: ', error);
      });
  });
}

uploadTemplateInfo(templates, forms);
uploadContentTypes(contentTypes);

saveData('firebase-backup/contentType.json', contentTypes);
