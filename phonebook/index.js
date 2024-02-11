const express = require('express')
const app = express()
app.use(express.json())

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


let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456"
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "040-654896"
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "040-2341891"
    },
    {
      id: 4,
      name: "Mary Poppendick",
      number: "040-987116"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id != id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'A person must have a name and a number!'
        })
    }
    const personExists = persons.find(person => person.name === body.name)

    if (personExists) {
        return response.status(400).json({
            error: 'This name is already in the phonebook!'
        })
    }


    const person = {
        name: body.name,
        number: body.number,
        id: generateId(1000000)
    }

    persons = persons.concat(person)
    response.json(person)
})

app.get('/info', (request, response) => {
    const size = persons.length
    const date = request.timestamp
    response.send(`<p>Phonebook has info for ${size}</p>`
        + `<p>${date}</p>`)
})

const generateId = (max) =>{
    const randomId = Math.floor(Math.random() * max)
    return randomId
}

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})