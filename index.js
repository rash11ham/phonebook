require('dotenv').config()
const express = require('express')
const app = express()
//exercise 3.9
const cors = require('cors')
app.use(cors())


//exercise 3.13
const Person = require('./models/person')


//exercise 3.10
app.use(express.static('dist'))

//exercise 3.7
var morgan = require('morgan')
morgan.token('req-body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :req-body')
)
//excersie 3.5 post
app.use(express.json())



app.get('/', (req,res) => {
  res.send('<h1>Hello</h1>')
})
//exercise 3.1
app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    if (persons) {
      res.json(persons)
    } else {
      res.status(404).end()
    }
  }).catch (error => next(error))

})

//exercise 3.2
app.get('/info', (req, res) => {
  res.send(`<h3>Phonebook has info for ${Person.length} people</h3>
        <br/>
        ${Date()}`)
})

//exercise 3.3
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    res.json(person)
  }).catch(error => next(error))


})

//exercise 3.4
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then(result => {
    res.status(204).end()
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    phone: body.phone
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatePerson => {
      res.json(updatePerson)
    }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (body.name === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }

  // Person.find({}).then(persons => {
  //     persons.forEach(person => {
  //         if (body.name === person.name) {
  //             console.log(body.name)
  //         }
  //     })
  // })

  const person = new Person({
    name: body.name,
    phone: body.phone
  })

  person.save().then(newPerson => {
    res.json(newPerson)
  }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error:error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

app.listen(process.env.PORT, () => {
  console.log('app is connected')
})

