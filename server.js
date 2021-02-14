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

  //const id = userStore.length+1;
  //const username = req.body.username

  /* return error if user already exists
  if(userStore.find(x=> x.username==username))
    return res.json({error: "Username already taken"})
*/
  const createdUser = db.createUser(req.body.username);

  /*
  // add user to database
  userStore.push({
    _id: id.toString(),
    username: username
  })
*/
  createdUser
    .then(data => res.json(data))

  // return new user
  //res.json(userStore[id-1]);
});

app.get("/api/exercise/users", ( _req, res )=> {
  if(userStore.length===0) 
    res.json({error: "No users exist"})
  else
    res.json(userStore);
});

app.post("/api/exercise/add", urlencodedParser, ( req, res ) => {

  const userId = req.body.userId;
  let username;
  
  //look up username
  if(!userStore.find( x => x._id==userId))
    return res.json({error: "User ID does not exist"});
  else
    username = userStore.find( x => x._id==userId).username;

  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date;

  if(date==="")
    date = new Date();
  
  exerciseStore.push({
    username: username,
    _id: userId,
    description: description,
    duration: duration,
    date: date
  })

  res.json(exerciseStore[exerciseStore.length-1])
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