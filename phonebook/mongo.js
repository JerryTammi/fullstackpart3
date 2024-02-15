const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://tammijerry:${password}@cluster0.obdqbmf.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('Phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
  process.exit(1)
}

if (process.argv.length<4) {
  console.log('give name as argument')
  process.exit(1)
}
if (process.argv.length<5) {
  console.log('give phonenumber as argument')
  process.exit(1)
}

const name = process.argv[3]
const number = process.argv[4]

const person = new Person({
  name: name,
  number: number,
})

person.save().then(result => {
  console.log(`added ${result.name} number ${result.number} to phonebook`)
  mongoose.connection.close()
})
