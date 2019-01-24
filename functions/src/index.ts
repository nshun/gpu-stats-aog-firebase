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
      },
      "mercury": {
        title: 'mercury',
        description: 'Description of number one',
        synonyms: ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'],
      },
    }
  }));
});

app.intent('actions.intent.OPTION', (conv, params, option) => {
  return new Promise(async (resolve, reject) => {
    const name = (option || '').toString();
    const docRef = db.collection('status').doc(name);
    const snapshot = await docRef.get();
    if (snapshot.exists) {
      const data = new Status(snapshot.data());
      conv.ask(`${data.updatedAt} に取得した使用状況です`);
      resolve(conv.ask(new Table({
        title: `${name}`,
        subtitle: `${data.gpuName} (${data.gpuTemp}℃) \n ${data.updatedAt}`,
        image: new Image({
          url: 'https://avatars0.githubusercontent.com/u/23533486',
          alt: 'Actions on Google'
        }),
        columns: [
          {
            align: 'CENTER',
          },
          {
            header: 'current',
            align: 'TRAILING',
          },
          {
            header: 'max',
            align: 'TRAILING',
          },
        ],
        rows: [
          {
            cells: ['CPU', `${data.cpuUtil} %`, ''],
            dividerAfter: false,
          },
          {
            cells: ['メインメモリ', `${data.memUtil} %`, `${data.memTotal} MB`],
            dividerAfter: true,
          },
          {
            cells: ['GPU', `${data.gpuUtil} %`, ''],
            dividerAfter: false,
          },
          {
            cells: ['GPUメモリ', `${Math.round(data.gpuMemUsed / data.gpuMemTotal * 1000) / 10} %`, `${data.gpuMemTotal} MB`],
            dividerAfter: true,
          },
        ],
        buttons: new Button({
          title: 'Kibana',
          url: 'http://kibana/'
        }),
      })));
    } else {
      const response = '調べられませんでした';
      resolve(conv.close(response));
    }
  });
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
