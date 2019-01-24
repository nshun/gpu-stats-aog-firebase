import * as functions from 'firebase-functions';
import { dialogflow, Carousel, Table, Image, Button } from 'actions-on-google';
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
  conv.ask('調べたい GPU サーバーを選択してください')
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
      conv.ask(`${time} に取得した使用状況です`);
      resolve(conv.ask(new Table({
        title: `${name}`,
        subtitle: `${time}`,
        image: new Image({
          url: 'https://avatars0.githubusercontent.com/u/23533486',
          alt: 'Actions on Google'
        }),
        columns: [
          {
            header: 'header 1',
            align: 'CENTER',
          },
          {
            header: 'header 2',
            align: 'LEADING',
          },
          {
            header: 'header 3',
            align: 'TRAILING',
          },
        ],
        rows: [
          {
            cells: ['GPU使用率', `${util} %`, 'row 1 item 3'],
            dividerAfter: false,
          },
          {
            cells: ['row 2 item 1', 'row 2 item 2', 'row 2 item 3'],
            dividerAfter: true,
          },
          {
            cells: ['row 2 item 1', 'row 2 item 2', 'row 2 item 3'],
          },
        ],
        buttons: new Button({
          title: 'Button Title',
          url: 'https://github.com/actions-on-google'
        }),
      })));
      // resolve(conv.close(response));
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
