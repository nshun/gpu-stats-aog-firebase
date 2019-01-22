import * as functions from 'firebase-functions';
import { Carousel } from 'actions-on-google';
import { WebhookClient, Card, Suggestion } from 'dialogflow-fulfillment';

// Set debug status
process.env.DEBUG = 'actions-on-google:*';

// URLs for images used in card rich responses
const homepage = 'http://www.inoue.eb.waseda.ac.jp/';
const imageUrl = 'http://www.inoue.eb.waseda.ac.jp/css/images/1.jpg';
const imageUrl2 = 'http://www.inoue.eb.waseda.ac.jp/css/images/2.jpg';

function googleAssistantOther(agent: WebhookClient): void {
  const conv = agent.conv();
  conv.ask('Please choose an item:');
  conv.ask(new Carousel({
    // title: 'Google Assistant',
    items: {
      'WorksWithGoogleAssistantItemKey': {
        title: 'Works With the Google Assistant',
        description: 'If you see this logo, you know it will work with the Google Assistant.',
        image: {
          url: imageUrl,
          accessibilityText: 'Works With the Google Assistant logo',
        },
      },
      'GoogleHomeItemKey': {
        title: 'Google Home',
        description: 'Google Home is a powerful speaker and voice Assistant.',
        image: {
          url: imageUrl2,
          accessibilityText: 'Google Home'
        },
      },
    },
  }));
  // Add Actions on Google library responses to your agent's response
  agent.add(conv);
}

function welcome(agent: WebhookClient): void {
  agent.add(`Welcome to my agent!`);
}

function fallback(agent: WebhookClient): void {
  agent.add(`I didn't understand`);
  agent.add(`I'm sorry, can you try again?`);
}

function other(agent: WebhookClient): void {
  agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  agent.add(new Card({
    title: `Title: this is a card title`,
    imageUrl: imageUrl,
    text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    buttonText: 'This is a button',
    buttonUrl: homepage
  })
  );
  agent.add(new Suggestion(`Quick Reply`));
  agent.add(new Suggestion(`Suggestion`));
  agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' } });
}

exports.dialogflowFirebaseFulfillment = functions
  .region('asia-northeast1')
  .https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log(`Dialogflow Request headers: ${JSON.stringify(request.headers)}`);
    console.log(`Dialogflow Request body: ${JSON.stringify(request.body)}`);

    const intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    if (agent.requestSource === 'ACTIONS_ON_GOOGLE') {
      intentMap.set(null, googleAssistantOther);
    } else {
      intentMap.set(null, other);
    }
    agent
      .handleRequest(intentMap)
      .catch(err => {
        console.error(`Dialogflow Handled error: ${err}`);
      });
  });
