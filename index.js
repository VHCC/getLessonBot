// index.js

const serverless = require('serverless-http');
const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};


// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc

// webhook callback
app.post('/callback', line.middleware(config), (req, res) => {
    // req.body.events should be an array of events
        if (!Array.isArray(req.body.events)) {
      return res.status(500).end();
    }

    // handle events separately
    Promise.all(req.body.events.map(handleEvent))
      .then(() => res.end())
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  });

// simple reply function
const replyText = (token, texts) => {
    texts = Array.isArray(texts) ? texts : [texts];
    return client.replyMessage(
      token,
      texts.map((text) => ({ type: 'text', text }))
    );
};

const textTemp = (text) => {
    return { type: 'text', text };
};

// create a default echo  text message
const defaultEcho = {
    type: 'template',
    altText: 'altText',
    template: {
        type: 'buttons',
        title: 'Get a Lesson',
        text: '請點擊 [get] 來拿一句好話',
        defaultAction: {
            type: 'message',
            label: '[get]',
            text: '[get]'
        },
        actions: [
            {
                type: 'message',
                label: '[get]',
                text: '[get]'
            }
        ]
    }
};

const getNextLesson = () => {
    return {
        type: 'template',
        altText: 'altText',
        template: {
            type: 'buttons',
            title: 'Get a Lesson',
            text: '請點擊 [get] 來拿一句好話',
            actions: [
                {
                    label: '[get]',
                    type: 'postback',
                    data: `{"action":"get"}`,
                    displayText:'[get]'
                },

            ],
        },
    }
}

// event handler
function handleEvent(event) {

    switch (event.type) {
        case 'message':
          var message = event.message;
          switch (message.type) {
            case 'text':
              return handleText(message, event.replyToken, event.source);
            default:
              throw new Error(`Unknown message: ${JSON.stringify(message)}`);
          }
        case 'postback':
          return handlePostback(event);
        default:
          throw new Error(`Unknown event: ${JSON.stringify(event)}`);
      }
}

function handleText(message, replyToken, source) {

    switch (message.text) {
        case '[get]':
            // receiveMap[source.userId] = undefined;
            const rawdata = fs.readFileSync('lesson.json');
            const jsonData = JSON.parse(rawdata);

            var i = getRandomInt(36);

            var ly = jsonData[i];
            var msg = textTemp(i +': \n' + ly);
            var askBoard = getNextLesson();

            return client.replyMessage(replyToken, [msg, defaultEcho]);
        default:
            return client.replyMessage(replyToken, defaultEcho);
    }
  }

//postback handler
function handlePostback(event, jsonData) {

    var postBackData = JSON.parse(event.postback.data);
    var action = postBackData.action;

    if (action == 'get') {
        const rawdata = fs.readFileSync('lesson.json');
        const jsonData = JSON.parse(rawdata);

        var i = getRandomInt(36);

        var ly = jsonData[i];
        var msg = textTemp(i +': \n' + ly);
        var askBoard = getNextLesson();

        return client.replyMessage(replyToken, [msg, defaultEcho]);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports.handler = serverless(app);