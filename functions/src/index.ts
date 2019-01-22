import * as functions from 'firebase-functions';
import { dialogflow, Carousel } from 'actions-on-google';
// import * as admin from 'firebase-admin';

const app = dialogflow({ debug: true });

// set database
// admin.initializeApp(functions.config().firebase);
// const db = admin.database();

interface StrStrDictionary {
  [key: string]: string;
}

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

const SELECTED_ITEM_RESPONSES: StrStrDictionary = {
  'neptune': 'You selected the neptune',
  'uranus': 'You selected the uranus',
};

app.intent('actions.intent.OPTION', (conv, params, option) => {
  let response = 'You did not select any item';
  if (option && SELECTED_ITEM_RESPONSES.hasOwnProperty(option.toString())) {
    response = SELECTED_ITEM_RESPONSES[option.toString()];
  }
  conv.ask(response);
});

exports.dialogflowFirebaseFulfillment = functions
  .region('asia-northeast1')
  .https.onRequest(app);
