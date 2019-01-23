import * as functions from 'firebase-functions';
import { dialogflow, Carousel } from 'actions-on-google';
import * as admin from 'firebase-admin';
import format4store from './utils/format4store';
import Status from './entities/Status';

const app = dialogflow({ debug: true });

// set firestore as db
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

app.intent('Default Welcome Intent', conv => {
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device or select the ' +
      'phone surface in the simulator.');
    return;
  }
  conv.ask('Which of these looks good?')
  conv.ask(new Carousel({
    items: {
      "neptune": {
        title: 'neptune',
        description: 'Description of number one',
        synonyms: ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'],
      },
      "uranus": {
        title: 'uranus',
        description: 'Description of number one',
        synonyms: ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'],
      }
    }
  }));
});

app.intent('actions.intent.OPTION', (conv, params, option) => {
  return new Promise(async (resolve, reject) => {
    try {
      const name = (option || '').toString();
      const docRef = db.collection('status').doc(name);
      const snapshot = await docRef.get();
      const util = await snapshot.get('gpuUtil');
      const time = await snapshot.get('updatedAt');
      const response = `${name} の ${time} 時点の GPU 使用率は ${util} % です`;
      resolve(conv.close(response));
    } catch {
      const response = '調べられませんでした';
      resolve(conv.close(response));
    }
  })

});

function storeFirebase(req: functions.Request, res: functions.Response) {
  try {
    const reqBody = req.body;
    const status: Status = format4store(reqBody);
    const name = status.hasOwnProperty('name') ? status.name : '';
    if (name) {
      const docRef = db.collection('status').doc(name);
      docRef
        .set(status)
        .then(() => res.send('saved status'))
        .catch(() => res.send(`couldn't save in 67`));
    } else {
      res.send('name is undefined');
    }
  } catch (error) {
    console.error(error);
    res.send(`couldn't save in 72`);
  }
}


exports.dialogflowFirebaseFulfillment = functions
  .region('asia-northeast1')
  .https.onRequest(app);

exports.storeFirebase = functions
  .region('asia-northeast1')
  .https.onRequest(storeFirebase);
