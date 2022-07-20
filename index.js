const { table } = require('console');
const { name } = require('ejs');
const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const path = require('path')
const PORT = process.env.PORT || 5000


const { Pool } = require("pg");
var pool;
pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    //  ssl:{
    //   rejectUnauthorized: false
    // }

  // for local host
  connectionString: 'postgres://postgres:123wzqshuai@localhost/amusepark' 
  //connectionString: 'postgres://nicoleli:12345@localhost/icloset'  
  // connectionString: 'postgres://postgres:root@localhost/try1'
  // connectionString: 'postgres://postgres:woaini10@localhost/users'  
})

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));


app.get('/database', (req,res) => {
  var getUsersQuery = `select * from area`;
  pool.query(getUsersQuery, (error, result) => {
    if(error)
      res.end(error);
    var results = {'rows':result.rows};
    res.render('pages/db', results);
  })
  
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));