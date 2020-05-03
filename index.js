require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

const Person = require('./models/person')

/**
 * Middleware
 */

app.use(express.json())
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      req.body ? JSON.stringify(req.body) : '{}',
    ].join(' ')
  })
)
app.use(cors())
app.use(express.static('build'))

/**
 * API
 */

app.get('/', (req, res) => {
  res.send('<h1>Part 3</h1><div><a href=\'/api/persons\'>/api/persons</a></div>')
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((result) => {
      res.json(result.map((person) => person.toJSON()))
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get('/info', (req, res, next) => {
  const time = new Date()

  Person.find({})
    .then((persons) => {
      res.send(
        `<div>Phonebook has info for ${persons.length} people</div><div>${time}</div>`
      )
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'missing data' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson.toJSON())
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if (!body.number) {
    return res.status(400).json({ error: 'missing data' })
  }

  const person = {
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson.toJSON())
    })
    .catch((error) => next(error))
})

/**
 * Error handling
 */

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

/**
 * Unknown endpoint
 */

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

/**
 * Port settings
 */

app.use(unknownEndpoint)

/*global process */
/*eslint no-undef: "error"*/
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
