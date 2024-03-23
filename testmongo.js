const { MongoClient } = require("mongodb");
const fs = require('fs'); 
var cookieParser = require('cookie-parser')
// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://newUser:thisuser@alyssamajor.enfizge.mongodb.net/?retryWrites=true&w=majority&appName=alyssamajor";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
app.use(cookieParser());
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
app.get('/', function (req, res){
  if (Object.keys(req.cookies).length > 0){
    res.redirect('/report');
  }
  else{
    res.redirect('/index');
  }

});
app.get('/index', function(req, res) {
  fs.readFile("/workspaces/MongoRender/index.html", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Error reading HTML file");
        return;
    }
    // res.setHeader('Content-Type', 'text/html');
    var dataShown = data;
    fs.readFile("/workspaces/MongoRender/cookieOnDuty.html", (err, data2) => {
      if(err){
        console.error("Error reading file:", err);
        res.status(500).send("Error reading HTML file");
        return;
      }
      res.setHeader('Content-Type', 'text/html');
      dataShown += data2;
      res.send(dataShown);
    });
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
app.get('/clearCookies', function (req,res){
    const cookies = Object.keys(req.cookies);
    cookies.forEach(cookie => {
        res.clearCookie(cookie); 
    });
    res.send('All cookies deleted');
});

app.get('/showcookie', function (req, res) {
  mycookies=req.cookies;
  res.send(mycookies); 
});

app.get('/report', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);

  //Send the cookies report to the browser
  mycookies=req.cookies;
  fs.readFile("/workspaces/MongoRender/cookieOnDuty.html", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Error reading HTML file");
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    // res.send(data);
    res.send(JSON.stringify(mycookies)+data);
});
  // res.send(JSON.stringify(mycookies) + " --Done reporting");
});


app.post('/createUser', async function(req, res){
  const client = new MongoClient(uri);
  const { UserId, Password } = req.body;
  console.log(UserId + Password);
  try {
    const database = client.db('databaseforalyssa');
    const collection = database.collection('loginCredentials');

    const newUser = {UserId: UserId, Password: Password};
    const doit = await collection.insertOne(newUser);
    console.log(doit);
    res.send('Got this:' + JSON.stringify(doit));
} catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error creating user");
}
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
      const collection = database.collection('loginCredentials');
      const query = { UserId: UserName, Password: Password};
    const output = await collection.findOne(query);
    console.log(output);

    if (output== null) {
      res.send('User not found.');
  } else {
    res.cookie('cook2', 'xyz', {maxAge : 20000});
    // res.send('Found this user: ' + JSON.stringify(output));
    fs.readFile("/workspaces/MongoRender/cookieOnDuty.html", (err, data) => {
      if (err) {
          console.error("Error reading file:", err);
          res.status(500).send("Error reading HTML file");
          return;
      }
      res.setHeader('Content-Type', 'text/html');
      // res.send(data);
      res.send('Found this user: ' + JSON.stringify(output) + '<br><br>' + data);
  });
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
    const collection = database.collection('collectionforalyssa');

    // Hardwired Query for a part that has partID '12345'
    // const query = { partID: '12345' };
    // But we will use the parameter provided with the route
    const query = { name: req.params.item };

    const part = await collection.findOne(query);
    console.log(part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});
