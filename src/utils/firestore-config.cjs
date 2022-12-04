const Firestore = require('@google-cloud/firestore');
// Use your project ID here
const PROJECTID = 'usmnt-tracker';
const COLLECTION_NAME = 'players';

const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true,
  // NOTE: Don't hardcode your project credentials here.
  // If you have to, export the following to your shell:
  //   GOOGLE_APPLICATION_CREDENTIALS=<path>
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const storeData = json => {
  const batch = firestore.batch();
  json.forEach((player, index) => {
    const ref = firestore.doc(`${COLLECTION_NAME}/${index}`);
    batch.set(ref, player);
  });
  return batch
    .commit()
    .then(doc => {
      console.info('set doc id#', doc.id);
    })
    .catch(err => {
      console.error(err);
    });
};

const getData = () => {
  return firestore
    .collection(COLLECTION_NAME)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        console.log(`${doc.id} => ${doc.data()}`);
      });
    })
    .catch(err => {
      console.error(err);
    });
};
module.exports = {storeData, getData};
