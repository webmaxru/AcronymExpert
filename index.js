// Scaffolding Express app
var express = require('express')
var app = express()
var server = require('http').createServer(app)

var bodyParser = require('body-parser')
app.use(bodyParser.json())

var unirest = require('unirest')

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

  unirest.get('https://daxeel-abbreviations-v1.p.mashape.com/all/' + req.body.result.body.parameters.Abbreviation)
    .header('X-Mashape-Key', 'j9WEQ4Kn23mshj8qs54Xe0NaNPJcp1gt27VjsnzmBGdEAMHYZ5')
    .end(function (result) {
      console.log(result.status, result.headers, result.body)
    })

  logger.info('API call', req.body.result)
  res.send(req.body.result)
})

// Starting Express

server.listen(process.env.PORT || 3000, function () {
  logger.info('Listening on port ' + (process.env.PORT || 3000))
})
