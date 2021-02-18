const express = require('express')
const app = express()
const port = 3000
const bodyParser = require("body-parser");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './../videoclient/src/assets/uploads'
});


var mysql = require('mysql');
// create a connection variable with the required details
var con = mysql.createConnection({
  host: "localhost",    // ip address of server running mysql
  user: "root",    // user name to your mysql database
  password: "", // corresponding password
  database: "vonexpy" // use the specified database
});

con.connect(function(err) {
    if (err) throw err

});

// Express CORS setup
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json({ keepExtensions: true }));
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/upload', multipartMiddleware, (req, res) => {

  try {
    console.log(req.files.uploads.path);

    if (req.files.uploads.path == undefined) {
      return res.send(`You must select a file.`);
    }



 
  // if connection is successful

  let filePath = req.files.uploads.path;
  
  /*filePath = filePath.replace('./../videoclient/src/assets/uploads', '');
  filePath = filePath.replace(/\\/g, "")
  */
  filePath = filePath.replace(/^.*[\\\/]/, '');
  const fileName = req.body.fileName;

  var records = [
    [fileName, filePath]
  ];
  con.query("INSERT INTO videofiles (videoname,videopath) VALUES ?", [records], function (err, result, fields) {
    // if any error while executing above query, throw error
    if (err) throw err;
    // if there is no error, you have the result
    console.log(result);
    console.log("Number of rows affected : " + result.affectedRows);
    console.log("Number of records affected with warning : " + result.warningCount);
    console.log("Message from MySQL Server : " + result.message);
  });


    res.json({
        'message': 'File uploaded succesfully.'
    });

}
catch (error) {
    console.log(error);
    return res.send(`Error when trying upload images: ${error}`);
  }
});

app.get('/api/getvidoes', (req, res) => {

  con.query("SELECT * FROM videofiles ORDER BY created_at DESC", function (err, result, fields) {
    if (err) throw err;
    // console.log(result);
   return res.send(result);
  });

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))