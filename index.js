// Scaffolding Express app

//https://abbreviations-expert.herokuapp.com/api/v1/

var express = require('express')
var app = express()
var server = require('http').createServer(app)

var bodyParser = require('body-parser')
app.use(bodyParser.json())

var unirest = require('unirest')

var memStorage = []

// Enabling CORS
var cors = require('cors')
app.use(cors())
app.options('*', cors())

// Setting up detailed logging
var winston = require('winston')
var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: true,
      level: 'info' // Set 'debug' for super-detailed output
    })
  ],
  exitOnError: false
})
logger.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}
app.use(require('morgan')('combined', {
  'stream': logger.stream
}))

// Default endpoint
app.get('/', function (req, res, next) {
  res.send('Abbreviations Expert API Works!')
})

// Exposing the API endpoint
app.post('/api/v1/', function (req, res, next) {
  logger.info('API call start')

  logger.info('Action', req.body.result.action)

  switch (req.body.result.action) {
    case 'abbreviation.search': {

      let abbreviation = req.body.result.parameters.Abbreviation

      let url = 'https://daxeel-abbreviations-v1.p.mashape.com/all/' + abbreviation

      logger.info('URL', url)

      unirest.get(url)
        .header('X-Mashape-Key', 'j9WEQ4Kn23mshj8qs54Xe0NaNPJcp1gt27VjsnzmBGdEAMHYZ5')
        .end(function (result) {
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

            logger.info('Abbreviation not found')
          } else {
            logger.info('defsNumber', defs.length)

            logger.info('defs', defs)

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
          logger.info('output', output)

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
      logger.info('output', output)

      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(output))

    }
  }
})

// Starting Express

server.listen(process.env.PORT || 3000, function () {
  logger.info('Listening on port ' + (process.env.PORT || 3000))
})
