const cors = require('cors')({ origin: true });
const unirest = require('unirest');

module.exports = function (context, req) {
  context.log('API call start');

  if (req.method === 'PUT') {
    context.res = { status: 401, body: 'Forbidden!' };
    context.done();
  }

  cors(req, context.res, () => {
    if (!req.body.result) {
      context.res = { status: 404, body: 'No required parameter!' };
      context.done();
    }

    context.log('Action', req.body.result.action);

    switch (req.body.result.action) {
      case 'abbreviation.search': {
        let abbreviation = req.body.result.parameters.Abbreviation;

        let url =
          'https://od-api.oxforddictionaries.com/api/v2/entries/en-us/' +
          abbreviation;

        context.log('URL', url);

        unirest
          .get(url)
          .header('app_id', process.env["app_id"])
          .header('app_key', process.env["app_key"])
          .then((result) => {
            context.log('result', result.body);

            let voiceData = null;
            let followupEvent = null;
            let defs = result.body;

            if (!defs['results']) {
              followupEvent = {
                name: 'ACRONYM_NOT_FOUND',
                data: {
                  abbreviation: abbreviation,
                },
              };

              context.log('Abbreviation not found');
            } else {
              context.log('defs', defs);

              voiceData =
                'It stands for ' +
                defs['results'][0]['lexicalEntries'][0]['entries'][0][
                  'senses'
                ][0]['shortDefinitions'][0] +
                '. ';
              voiceData += 'Do you want to know what it is?';

              if (defs.length > 1) {
                // voiceData += 'There are ' + (defs.length - 1) + ' more definitions'
              }
            }

            let output = {
              speech: voiceData,
              displayText: voiceData,
              data: defs,
              contextOut: [
                {
                  name: 'def-context',
                  lifespan: 2,
                  parameters: {
                    abbreviation: abbreviation,
                    meaning:
                      defs['results'][0]['lexicalEntries'][0]['entries'][0][
                        'senses'
                      ][0]['definitions'][0],
                    defsNumber: defs.length,
                  },
                },
              ],
              source: 'Acronym Expert',
              followupEvent: followupEvent,
            };
            context.log('output', output);

            context.res = { body: output };
            context.done();
          })
          .catch((err) => {
            context.log(err);
          });

        break;
      }
      default: {
        let output = {
          speech: 'Action not supported',
          displayText: 'Action not supported',
          data: defs,
          contextOut: [
            {
              action: req.body.result.action,
            },
          ],
          source: 'Acronym Expert',
        };
        context.log('output', output);

        context.res = { body: output };
        context.done();
      }
    }
  });
};
