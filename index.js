// const { table } = require('console');
// const { name } = require('ejs');
const express = require('express');
// const req = require('express/lib/request');
// const res = require('express/lib/response');
const path = require('path')
var cors = require('cors') // cross-origin resource sharing
const PORT = process.env.PORT || 5000

var app = express()
app.use("/", cors())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json({limit:'25mb'}))
app.use(express.urlencoded({limit:'25mb', extended: true}))
app.get('/', (req, res) => res.render('pages/index'))
// app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

const { Pool } = require("pg");
var pool;
pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    //  ssl:{
    //   rejectUnauthorized: false
    // }

  // for local host
  // connectionString: 'postgres://nicoleli:12345@localhost/amuseparkdbapp'
  connectionString: 'postgres://postgres:123wzqshuai@localhost/amusepark'
})

var DivisionQueryText = 
[
'SELECT * FROM tourist_enter_entertainment as sx',
'WHERE NOT EXISTS (( SELECT p.touristid FROM tourist as p )',
'EXCEPT',
'(SELECT sp.touristid FROM tourist_enter_entertainment as sp WHERE sp.facilityid = sx.facilityid ) )'
].join('\n')

// Get tourists' information from the database
app.get('/', (req, res) => res.render('pages/index'));
app.get('/allTourist', async (req, res) => {
  //invoke a query that selects all row from the tourist table
  try {
    const result = await pool.query('SELECT * FROM tourist');
  // division: tourist_enter_entertainment(facilityid, touristid) as R, tourist(touristid) as S
  // find R(facilityid) cross product S(rouristid) as r1
  // subtract actual R(facilityid, touristid) from r1 as r2
  // R(touristid) - r2(touristid) is result
    const result1 = await pool.query(
      // 'SELECT * FROM tourist_enter_entertainment WHERE facilityid not in ( SELECT facilityid FROM (SELECT facilityid, touristid FROM tourist) as p cross join (select distinct facilityid from tourist_enter_entertainment) as SP) EXCEPT (SELECT x, y from tourist_enter_entertainment) ) As r) '
      DivisionQueryText
      );
    var data = {results: result.rows, results1: result1.rows};
    res.render('pages/tourist', data);
  }
  catch (error) {
    res.end(error);
  }
})

// app.get('/allTourist', async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM tourist_enter_entertainment WHERE facilityid not in ( SELECT facilityid FROM (SELECT facilityid, touristid FROM tourist) as p cross join (select distinct facilityid from tourist_enter_entertainment) as SP) EXCEPT (SELECT x, y from tourist_enter_entertainment) ) As r) '
//       );
//     var data = {results1: result.rows};
//     res.render('pages/tourist', data);
//   }
//   catch (error) {
//     res.end(error);
//   }
// })



// Delete tourist by touristid
app.post('/tourist/:touristid', async (req, res) => {
  var TID = req.params.touristid;
  //search the database using id
  await pool.query(`DELETE FROM tourist WHERE touristid= '${TID}';`);
  //display current database
  const result = await pool.query("SELECT * FROM tourist");
  res.render('pages/tourist', result.rows);
})

// Display tourist information
app.get('/tourist/:touristid', async (req, res) => {
  var id = req.params.touristid;
  //search the database using id
  const result = await pool.query(`SELECT * FROM tourist WHERE touristid = '${id}';`);
  res.render('pages/touristInfo', result);
})


// Edit information of exisitng tourist
app.post('/editTouristInfo/:touristid', async (req, res) => {
  var id = req.params.touristid;
  // Define variables that allow for changing
  var name = req.body.name;
  var age = req.body.age;
  // Update the database using touristid
  await pool.query(`UPDATE tourist SET name = '${name}', age = '${age}' WHERE touristid = '${id}';`)
  // Display current database
  const result = await pool.query(`SELECT * FROM tourist;`);
  res.render('pages/touristInfo', result);
})

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
