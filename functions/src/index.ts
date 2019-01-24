import * as functions from 'firebase-functions';
import { dialogflow, Carousel, Table, Image, Button } from 'actions-on-google';
import * as admin from 'firebase-admin';
import format4store from './utils/format4store';
import Status from './entities/Status';

const app = dialogflow({ debug: true });

// set firestore as db
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

interface strStr {
  [key: string]: string;
}
const serverImages: strStr = {
  'neptune': 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg',
  'uranus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/220px-Uranus2.jpg',
  'mercury': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg/220px-Mercury_in_color_-_Prockter07-edit1.jpg',
}

app.intent('Default Welcome Intent', conv => {
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device or select the ' +
      'phone surface in the simulator.');
    return;
  }
  conv.ask('調べたい GPU サーバーを選択してください');
  conv.ask(new Carousel({
    items: {
      "neptune": {
        title: 'neptune',
        synonyms: ['ネプチューン'],
        description: 'JupyterLab Server',
        image: new Image({
          url: serverImages.neptune,
          alt: 'neptune',
        }),
      },
      "uranus": {
        title: 'uranus',
        synonyms: ['ウラヌス'],
        description: 'JupyterLab Server',
        image: new Image({
          url: serverImages.uranus,
          alt: 'uranus',
        }),
      },
      "mercury": {
        title: 'mercury',
        synonyms: ['マーキュリー'],
        description: 'JupyterLab Server',
        image: new Image({
          url: serverImages.mercury,
          alt: 'mercury',
        }),
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
          url: serverImages[name] || 'https://avatars0.githubusercontent.com/u/23533486',
          alt: 'Actions on Google'
        }),
        columns: [
          { align: 'CENTER', },
          { header: 'current', align: 'TRAILING', },
          { header: 'max', align: 'TRAILING', },
        ],
        rows: [
          { cells: ['CPU', `${data.cpuUtil} %`, ''], dividerAfter: false, },
          { cells: ['メインメモリ', `${data.memUtil} %`, `${data.memTotal} MB`], dividerAfter: true, },
          { cells: ['GPU', `${data.gpuUtil} %`, ''], dividerAfter: false, },
          { cells: ['GPUメモリ', `${Math.round(data.gpuMemUsed / data.gpuMemTotal * 1000) / 10} %`, `${data.gpuMemTotal} MB`], dividerAfter: true, },
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
