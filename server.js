const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// cosmos db
const db = require("./db.js")
db.createDb(); // create if required

const userStore = [];
const exerciseStore = [];

app.use(cors());
app.use(express.static('public'));
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/exercise/new-user", urlencodedParser, ( req, res ) => {
  const username = req.body.username;
  // check if user exists
  const userFound = db.doesUserExist(username);
  userFound.then(data => {
    // if so return error
    if(data.length!==0) 
      return res.json({ error: "User already exists" })

    // else create user and return id and username
    const createdUser = db.createUser(username);
    createdUser.then(data => res.json(data))
  })
});

app.get("/api/exercise/users", ( _req, res )=> {
  // fetch all users from cosmos and return id and username
  const userList = db.fetchUsers();
  userList.then(data => res.json(data));
});

app.post("/api/exercise/add", urlencodedParser, ( req, res ) => {
  const userId = req.body.userId;
  const duration = req.body.duration;
  if(!Number(duration))
    return res.json({ error: "Duration is not a valid number" })

  // check if id exists
  const idFound = db.doesIdExist(userId)
  idFound.then(user => {
    if(user.length===0)
      return res.json({ error: "User does not exist" })
    
    // set fields
    const username = user[0].username
    const description = req.body.description;
    let date = req.body.date;

    // if date is blank set to today
    if(date==="")
    date = new Date();

    const exercise = db.createExercise(userId,username,description,duration,date)
    exercise.then( data => { res.json(data) })
  });
});

app.get("/api/exercise/log", ( req, res ) => {

  // return full log if no user parameter
  if(!req.query.userId)
    return res.json({ count: exerciseStore.length});
  
  const userId=req.query.userId;
  let username;

  if(!userStore.find( x => x._id==userId))
    res.json({error: "User ID does not exist"});
  else
    username = userStore.find( x => x._id==userId).username;

  const activity = [];

  exerciseStore.forEach(x=> {
    if(x._id==userId) {
      activity.push({
        description: x.description,
        duration: x.duration,
        date: x.date
      })
    }
  })

  res.json({
    _id: userId,
    username: username,
    log: activity
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});