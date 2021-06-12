require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose

const mongoUri = process.env.MONGO_URI;

mongoose.set('useFindAndModify', false); 
  // See https://mongoosejs.com/docs/deprecations.html#findandmodify

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const exerciseSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: String,  // use toDateString() to convert to string
    required: true
  }
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  log: [exerciseSchema]
})
const User = mongoose.model('User', userSchema)

function createAndSaveUser(username, done) {
  //console.log('[createAndSaveUser] ', username)
  if (!username) {
    console.error('[createAndSaveUser] No username provided.')
    done('[createAndSaveUser] Error: No username provided.')
  }
  const user = new User({
    username: username
  })
  user.save(function(err, data) {
    if (err) { 
      done(err)
    } else {
      done(null, data)
    }
  })
}

function getAllUsers(done) {
  User.find({}, (err, users) => {
    if (err) { done(err) }
    const arrOfUsers = users.map(user => {
      return {
        _id: user._id,
        username: user.username
      }
    })
    done(null, arrOfUsers)
  })
}

function findOneUserById(id, done) {
  User.findById(id, (err, user) => {
    if (err) { done(err) }
    done(null, user)
  })
}

function addOneExercise(id, exercise, done) {
  //console.log('[addOneExercise] exercise:', exercise)
  // validate exercise
  if (!exercise.description || !exercise.duration || !exercise.date) {
    done('[addOneExercise] Missing fields')
  } else if (exercise.date === 'Invalid Date') {
    done('[addOneExercise] Invalid Date')
  } else {
    findOneUserById(id, (err, user) => {
      if (err) { done(err) }
      user.log.push({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date
      })
      //console.log('Ready to save: ', user)
      user.save((err, doc) => {
        if (err) { done(err) }
        //console.log("[addOneExercise] Success!")
        done(null, {
          _id: user._id,
          username: user.username,
          ...exercise
        })
      })
    })
  }
}
/*
const findOneByShortUrl = (shortUrl, done) => {
  Url.findOne({ short_url: shortUrl }, (err, data) => {
    if (err) {
      console.error(err)
      done(err)
    } else if (!data) {
      console.log(`[findOneByShortUrl] No record found for ${shortUrl}`)
      done(null, null)
    } else {
      console.log(`[findOneByShortUrl] Record found: ${data}`)
      done(null, data)
    }
  })
};

const findOneByOriginalUrl = (originalUrl, done) => {
  Url.findOne({ original_url: originalUrl }, (err, data) => {
    if (err) {
      console.error(err)
      done(err)
    } else if (!data) {
      console.log(`[findOneByOriginalUrl] No record found for ${originalUrl}`)
      done(null, null)
    } else {
      console.log(`[findOneByOriginalUrl] Record found: ${data}`)
      done(null, data)
    }
  })
};


function createRandomShortUrl(next) {
  const shortUrl = Math.floor(Math.random()*9999)

  findOneByShortUrl(shortUrl, (err, data) => {
    if (err) {
      console.error(err)
      next(err)
    } else if (!data) {
      console.log('[createRandomShortUrl] No duplicates. Safe to proceed.', shortUrl)
      next(null, shortUrl)
    } else {
      console.log('[createRandomShortUrl] Duplicates found. Trying a new number.', shortUrl)
      createRandomShortUrl()
    }
  })
}
*/
exports.userModel = User;
exports.createAndSaveUser = createAndSaveUser;
exports.getAllUsers = getAllUsers;
exports.findOneUserById = findOneUserById;
exports.addOneExercise = addOneExercise;