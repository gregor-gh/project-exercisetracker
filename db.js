require('dotenv').config();

// @ts-check
//  <ImportConfiguration>
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const dbContext = require("./databaseContext");
//  </ImportConfiguration>

//  <DefineNewItem>
const newItem = {
  id: "3",
  category: "fun",
  name: "Cosmos DB",
  description: "Complete Cosmos DB Node.js Quickstart ⚡",
  isComplete: false
};

// <CreateClientObjectDatabaseContainer>
const { endpoint, key, databaseId, containerId } = config;

const client = new CosmosClient({ endpoint, key });

const database = client.database(databaseId);
const container = database.container(containerId);

async function createDb() {
    // Make sure Tasks database is already setup. If not, create it.
    await dbContext.create(client, databaseId, containerId);
}
/*
async function getNextId() {
  const querySpec = {
    query: "select max(c.id) as lastId from c"
  }

  //select last id 
  try {
    const { resources: lastId } = await container.items
    .query(querySpec)
    .fetchNext();

    if(Number(lastId[0].lastId)===null)

  // return lastid+1
    return Number(lastId[0].lastId)+1
  }
  catch(e) { console.log(e) }
}
*/


async function createUser(username) {
  try {
    const { resource: createdItem } = await container.items.create({ username: username, type: "user" });
    return { _id: createdItem.id, username: createdItem.username }
  }
  catch(e) { console.log(e) }
}

async function fetchUsers() {
  const query = { query: "SELECT c.id as _id, c.username FROM c where c.type='user'" }
  try {
    const { resources: userList } = await container.items
      .query(query)
      .fetchAll();

      return userList;
  }
  catch(e) { console.log(e) }
}

async function doesUserExist(username) {
  try {
    const query = { query: `SELECT c.id as _id, c.username FROM c where c.username='${username}' and c.type='user'`}
    const { resources: userFound } = await container.items
      .query(query)
      .fetchAll()
    
    return userFound;
  }
  catch(e) { console.log(e) }
}

async function doesIdExist(id) {
  try {
    const query = { query: `SELECT c.id, c.username FROM c where c.id='${id}' and c.type='user'`}
    const { resources: idFound } = await container.items
      .query(query)
      .fetchAll()
    
    return idFound;
  }
  catch(e) { console.log(e) }
}

async function createExercise(id, username, description, duration, date) {
  try {
    const { resource : createdItem } = await container.items.create({ 
      userId: id, 
      username: username,
      description: description,
      duration: Number(duration),
      date: date,
      type: "exercise"
    });
    return {
      _id: createdItem.userId,
      username: createdItem.username,
      date: createdItem.date,
      duration: createdItem.duration,
      description: createdItem.description
    };
  }
  catch(e) { console.log(e) }
}


/*
async function main() {
  



  try {
    // <QueryItems>
    console.log(`Querying container: Items`);

    // query to return all items
    const querySpec = {
      query: "SELECT * from c"
    };
    
    // read all items in the Items container
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    items.forEach(item => {
      console.log(`${item.id} - ${item.description}`);
    });
    // </QueryItems>
    
    // <CreateItem>
    /** Create new item
     * newItem is defined at the top of this file
     *//*
    const { resource: createdItem } = await container.items.create(newItem);
    
    console.log(`\r\nCreated new item: ${createdItem.id} - ${createdItem.description}\r\n`);
    // </CreateItem>
    
    // <UpdateItem>
    /** Update item
     * Pull the id and partition key value from the newly created item.
     * Update the isComplete field to true.
     *//*
    const { id, category } = createdItem;

    createdItem.isComplete = true;

    const { resource: updatedItem } = await container
      .item(id, category)
      .replace(createdItem);

    console.log(`Updated item: ${updatedItem.id} - ${updatedItem.description}`); 
    console.log(`Updated isComplete to ${updatedItem.isComplete}\r\n`);
    // </UpdateItem>
    
    // <DeleteItem>    
    /**
     * Delete item
     * Pass the id and partition key value to delete the item
     *//*
    const { resource: result } = await container.item(id, category).delete();
    console.log(`Deleted item with id: ${id}`);
    // </DeleteItem>  
    
  } catch (err) {
    console.log(err.message);
  }
}

//createUser("Bob");
*/

module.exports = { createUser, createDb, fetchUsers, doesUserExist, doesIdExist, createExercise };