const express = require('express')
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
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

  const { Pool } = require("pg");
  var pool;
  pool = new Pool({
      // connectionString: process.env.DATABASE_URL,
      //  ssl:{
      //   rejectUnauthorized: false
      // }
  
    // for local host
    connectionString: 'postgres://nicoleli:12345@localhost/amuseparkdbapp'  
  })

// Get tourists' information from the database
app.get('/', (req, res) => res.render('pages/index'));
app.get('/allTourist', async (req, res) => {
  //invoke a query that selects all row from the tourist table
  try {
    const result = await pool.query('SELECT * FROM tourist');
    res.render('pages/tourist', result);
  }
  catch (error) {
    res.end(error);
  }
})

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
