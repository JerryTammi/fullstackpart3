require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
app.use(express.json())

app.use(express.static('dist'))

var time = require('express-timestamp')
app.use(time.init)

var morgan = require('morgan')
morgan = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms', '-',
    JSON.stringify(req.body)
  ].join(' ')
})
app.use(morgan)

const cors = require('cors')
app.use(cors())

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
      .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
      name: body.name,
      number: body.number,
    })
    
    person.save().then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      response.json(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const { name, number } = request.body

    Person.findByIdAndUpdate(
      id,
      { name, number },
      { new: true, runValidators:true, context: 'query'})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.get('/info', (request, response) => {
  const date = request.timestamp
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>`
        + `<p>${date}</p>`)
  })
})

//const generateId = (max) =>{
//    const randomId = Math.floor(Math.random() * max)
//    return randomId
//}

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})