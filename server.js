const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./App.js')
require('dotenv').config()

let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Database Functions
const User = db.userModel
const createAndSaveUser = db.createAndSaveUser
const getAllUsers = db.getAllUsers
const findOneUserById = db.findOneUserById
const addOneExercise = db.addOneExercise

function formatDateString(dateString) {
  const date = new Date(dateString)
  return date.toDateString()
}

// ROUTES
app.post('/api/users', (req, res) => {
  createAndSaveUser(req.body.username, (err, data) => {
    if (err) {
      res.json({ error: err })
    } else {
      res.json(data)
    }
  })
})

app.get('/api/users', (req, res) => {
  getAllUsers((err, data) => {
    if (err) { 
      res.json({ error: err }) 
    } else {
      res.json(data)
    }
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id
  const newExercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date ? formatDateString(req.body.date) : formatDateString(Date.now())
  }
  addOneExercise(id, newExercise, (err, data) => {
    if (err) { 
      console.error(err)
      res.json(err) 
    } else {
      //console.log('[Server] Exercise Added: ', data)
      res.json(data)
    }
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query
  const fromDate = new Date(from)
  const toDate = new Date(to)
  findOneUserById(req.params._id, (err, user) => {
    if (err) { 
      console.error(err)
      res.json({
        error: `User with ID ${req.params._id} not found`
      })
    } else {
      const log = user.log.map(exercise => {
        const date = new Date(exercise.date)
        if (date > fromDate) {
          if (date < toDate) {
            return {
              description: exercise.description,
              duration: exercise.duration,
              date: exercise.date
            }
          }
        }
        
      })
      const count = log.length
      res.json({
        _id: user._id,
        username: user.username,
        count: count,
        log: log.slice(0,limit)
      })
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
