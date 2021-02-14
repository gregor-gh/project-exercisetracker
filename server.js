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
  // return error if user is empty
  if(userId==="")
    return res.json({ error: "No user id specified" })

  const description = req.body.description;
  // return error if desc is blank
  if(description==="")
    return res.json({ error: "No description given" })

  // return error if duration isn';t a number
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
    
    let date = req.body.date;

    // if date is blank set to today
    if(date==="")
    date = new Date();

    const exercise = db.createExercise(userId,username,description,duration,date);
    exercise.then( data => { res.json(data) });
  });
});

app.get("/api/exercise/log", ( req, res ) => {
  
  const userId=req.query.userId;

  const idFound = db.doesIdExist(userId)
  idFound.then(user => {
    if(user.length===0)
      return res.json({ error: "User does not exist" })
  })

  const log = db.fetchExercises(userId);
  log.then( data => { res.json(data) });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});