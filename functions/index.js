'use strict'

const functions = require('firebase-functions')
const cors = require('cors')({origin: true})
const unirest = require('unirest')

exports.acronymexpert = functions.https.onRequest((req, res) => {

  console.log('API call start')

  if (req.method === 'PUT') {
    res.status(403).send('Forbidden!')
  }

  cors(req, res, () => {

    if (!req.body.result) {
      res.status(403).send('No required parameter!')
    }

    console.log('Action', req.body.result.action)

    switch (req.body.result.action) {
      case 'abbreviation.search': {

        let abbreviation = req.body.result.parameters.Abbreviation

        let url = 'https://daxeel-abbreviations-v1.p.mashape.com/all/' + abbreviation

        console.log('URL', url)

        unirest.get(url)
          .header('X-Mashape-Key', 'j9WEQ4Kn23mshj8qs54Xe0NaNPJcp1gt27VjsnzmBGdEAMHYZ5')
          .end(function (result) {

            console.log('mashape result', result)

            let voiceData = null
            let followupEvent = null
            let defs = JSON.parse(result.body)

            if (defs[0]['fullform'] == 'Not found') {
              followupEvent = {
                name: 'ACRONYM_NOT_FOUND',
                data: {
                  abbreviation: abbreviation
                }
             }

              console.log('Abbreviation not found')
            } else {
              console.log('defsNumber', defs.length)

              console.log('defs', defs)

              voiceData = 'It stands for ' + defs[0]['fullform'] + '. '
              voiceData += 'Do you want to know what it is?'

              if (defs.length > 1) {
                // voiceData += 'There are ' + (defs.length - 1) + ' more definitions'
              }
            }

            let output = {
              speech: voiceData,
              displayText: voiceData,
              data: defs,
              contextOut: [{
                name: 'def-context',
                lifespan: 2,
                parameters: {
                  abbreviation: abbreviation,
                  meaning: defs[0]['meaning'],
                  defsNumber: defs.length
                }

              }],
              source: 'Acronym Expert',
              followupEvent: followupEvent
            }
            console.log('output', output)

            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(output))
          })

        break
      }
      default: {

        let output = {
          speech: 'Action not supported',
          displayText: 'Action not supported',
          data: defs,
          contextOut: [{
            action: req.body.result.action
          }],
          source: 'Acronym Expert'
        }
        console.log('output', output)

        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(output))

      }
    }
  })
})
