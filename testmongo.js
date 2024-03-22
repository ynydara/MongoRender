const { MongoClient } = require("mongodb");
const fs = require('fs'); 

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://newUser:thisuser@alyssamajor.enfizge.mongodb.net/?retryWrites=true&w=majority&appName=alyssamajor";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
app.get('/', function(req, res) {
  fs.readFile("/workspaces/MongoRender/index.html", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Error reading HTML file");
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
});
});

 
  
app.get('/register', function(req,res){
  fs.readFile("/workspaces/MongoRender/userCreate.html", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Error reading HTML file");
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
});
});

app.get('/say/:name', function(req, res) {
  res.send('Hello ' + req.params.name + '!');
});

app.get('/goDo' , function(req,res){
  const myquery = req.query;
  var outstring = 'Starting... ';
  res.send(outstring);
});
app.get('/findUser' , function(req,res){
  fs.readFile("/workspaces/MongoRender/findUser.html", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Error reading HTML file");
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
});
});


app.get('/findUserRender' , function(req,res){
  const client = new MongoClient(uri);
  const { UserName, Password } = req.query;

  async function run() {
    try {
      const database = client.db('databaseforalyssa');
      // const parts = database.collection('collectionforalyssa');
      const parts = database.collection('loginCredentials');
      const query = { User_Id: UserName, Password: Password};
    const part = await parts.findOne(query);
    console.log(part);

    if (part == null) {
      res.send('User not found.');
  } else {
      res.send('Found this user: ' + JSON.stringify(part));
  }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
});


// Route to access database:
app.get('/api/mongo/:item', function(req, res) {
const client = new MongoClient(uri);
const searchKey = "{ name: '" + req.params.item + "' }";
console.log("Looking for: " + searchKey);

async function run() {
  try {
    const database = client.db('databaseforalyssa');
    const parts = database.collection('collectionforalyssa');

    // Hardwired Query for a part that has partID '12345'
    // const query = { partID: '12345' };
    // But we will use the parameter provided with the route
    const query = { name: req.params.item };

    const part = await parts.findOne(query);
    console.log(part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});
