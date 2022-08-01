// const { table } = require('console');
// const { name } = require('ejs');
const express = require('express');
// const req = require('express/lib/request');
// const res = require('express/lib/response');
const path = require('path')
var cors = require('cors') // cross-origin resource sharing
const PORT = process.env.PORT || 5000

var session = require('express-session');
var flush = require('connect-flash');

var app = express()
app.use("/", cors())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json({limit:'25mb'}))
app.use(express.urlencoded({limit:'25mb', extended: true}))
app.get('/', (req, res) => res.render('pages/index'))
app.use(session({
  secret:'secret',
  cookie: {maxAge:60000},
  resave: false,
  saveUninitialized: false
}));
app.use(flush());
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
  //connectionString: 'postgres://postgres:123wzqshuai@localhost/amusepark'
    connectionString: 'postgres://postgres:root@localhost/amuseparkdbapp'
})


// Get tourists' information from the database
app.get('/', (req, res) => res.render('pages/index'));
app.get('/allTourist', async (req, res) => {
  //invoke a query that selects all row from the tourist table
  try {
    const result = await pool.query('SELECT * FROM tourist ORDER BY touristID');
     var data = {results: result.rows, message:req.flash('message')};
    res.render('pages/tourist', data);
  }
  catch (error) {
    res.end(error);
  }
})

var DivisionQueryText = 
[
'SELECT * FROM entertainment WHERE facilityid IN (',
'SELECT DISTINCT facilityid FROM tourist_enter_entertainment as sx',
'WHERE NOT EXISTS (( SELECT p.touristid FROM tourist as p )',
'EXCEPT',
'(SELECT sp.touristid FROM tourist_enter_entertainment as sp WHERE sp.facilityid = sx.facilityid )))'
].join('\n')



// var query = [
//   'select * from entertainment',
//   'WHERE facilityid IN',
//             '(SELECT facilityid FROM tourist_enter_entertainment',
//             'GROUP BY facilityid',
//             'HAVING COUNT(*) < 3)'
// ].join('\n')
app.get('/facility', async (req, res) => {
  //invoke a query that selects all row from the tourist table
  try {
    const result = await pool.query('SELECT * FROM entertainment');
  // division: tourist_enter_entertainment(facilityid, touristid) as R, tourist(touristid) as S
  // find R(facilityid) cross product S(rouristid) as r1
  // subtract actual R(facilityid, touristid) from r1 as r2
  // R(touristid) - r2(touristid) is result
    const result1 = await pool.query(
        DivisionQueryText
      );
      const result2 = await pool.query('select * from entertainment where facilityid != (select facilityid from tourist_enter_entertainment group by facilityid having count(facilityid) > (select avg(count) from (select count(*) from tourist_enter_entertainment group by facilityid) as a))');
    var data = {results: result.rows, results1: result1.rows, results2: result2.rows};
    res.render('pages/facility', data);
  }
  catch (error) {
    res.end(error);
  }
})

// app.get('/facility', async(req, res) => {
//   try{
//     var query = [
//       'select * from entertainment',
//       'WHERE facilityid IN',
//                 'SELECT facilityid, COUNT(*) as tourist_number FROM tourist_enter_entertainment',
//                 'GROUP BY facilityid',
//                 'HAVING COUNT(*) < 3'
//     ];
//     const result2 = await pool.query(query);
//     var data = {results2: result2.rows};
//     res.render('pages/facility', data);

//   }
//   catch(error){
//     res.end(error);
//   }
// })


// var JoinQueryText = 
// [
// 'SELECT *',
// 'FROM entertainment, tourist_enter_entertainment',
// `WHERE entertainment.facilityid = tourist_enter_entertainment.facilityid, entertainment.facilityid = ${fid}`,
// ].join('\n')
app.get('/facility/:facilityid', async (req, res) => {
  var fid = req.params.facilityid;
  const  facilityinfo=await pool.query(`SELECT * FROM entertainment WHERE facilityid = ${fid}`);
  const result = await pool.query(`SELECT * FROM entertainment, tourist_enter_entertainment WHERE entertainment.facilityid = tourist_enter_entertainment.facilityid and entertainment.facilityid = ${fid}`);
  const totalvisit = await pool.query(`select count(a) from (SELECT * FROM entertainment, tourist_enter_entertainment WHERE entertainment.facilityid = tourist_enter_entertainment.facilityid and entertainment.facilityid = ${fid}) as a`);
  const totalmainten = await pool.query(`select count(maintenanceid) from tech_maintain_entertainment group by facilityid having facilityid = ${fid}`);
  var data = {results: result.rows, facilityinfos:facilityinfo.rows, totalvisits:totalvisit.rows, totalmaintens:totalmainten.rows};
  res.render('pages/facilityINFO', data);

})

app.get('/allEmployee', async(req, res) => {
  try{
    const result = await pool.query(`select * from employee_belongto as e join salesperson_belongto as s ON e.employeeid = s.employeeid;`);
    const result1 = await pool.query(`select * from employee_belongto as e join technician_belongto as t ON e.employeeid = t.employeeid;`);
    var data = {results: result.rows, results1: result1.rows};
    res.render('pages/employee', data);
  }
  catch(error){
    res.end(error);
  }

})

app.get('/salesperson/:eid', async(req, res) => {
  try{
    var eid = req.params.eid;
    const result = await pool.query(`select * from employee_belongto as e join salesperson_belongto as s ON e.employeeid = s.employeeid WHERE e.employeeid =${eid} `);
    var data = {results: result.rows};
    res.render('pages/salesperson', data);
  }
  catch(error){
    res.end(error);
  }
})


app.get('/technician/:eid', async(req, res) => {
  try{
    var eid = req.params.eid;
    const result = await pool.query(`select * from employee_belongto as e join technician_belongto as t ON e.employeeid = t.employeeid WHERE e.employeeid = ${eid} `);
    var data = {results: result.rows};
    res.render('pages/technician', data);
  }
  catch(error){
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

// Add a tourist
app.post('/addTourist', async (req, res) => {
  var id = req.body.id;
  var name = req.body.name;
  var age = req.body.age;
  try{
    await pool.query(`INSERT INTO tourist VALUES (${id},'${name}','${age}');`);
    req.flash('message',"New tourist added successfully.");
  }
  catch(error){
    req.flash('message',"Error: Make sure you enter the right id, name and age.");
  }
  
  res.redirect('/allTourist');
})

// Delete tourist by touristid
app.post('/tourist/delete/:touristid', async (req, res) => {
  var TID = req.params.touristid;
  //search the database using id
  await pool.query(`DELETE FROM tourist WHERE touristid= '${TID}';`);
  req.flash('message',"Tourist have being removed.");
  res.redirect('/allTourist');
})

// Display tourist information
app.get('/tourist/:touristid', async (req, res) => {
  var id = req.params.touristid;
  //search the database using id
  const touristinfo = await pool.query(`SELECT * FROM tourist WHERE touristid = '${id}';`);
  const touristvisited = await pool.query(`SELECT * FROM tourist_enter_entertainment WHERE touristid = '${id}' order by facilityid,date, time ;`);
  var data = {results: touristinfo.rows, visits:touristvisited.rows, message:req.flash('message')};
  res.render('pages/touristInfo', data);
})

// Edit information of exisitng tourist
app.post('/editTouristInfo/:touristid', async (req, res) => {
  var id = req.params.touristid;
  // Define variables that allow for changing
  var name = req.body.name;
  var age = req.body.age;
  // Update the database using touristid
  try{
    await pool.query(`UPDATE tourist SET name = '${name}', age = '${age}' WHERE touristid = '${id}';`);
    req.flash('message',"Info Updated.");
  }
  catch(error){
    req.flash('message',"Error: Make sure you enter the right id, name and age.");
  }

  res.redirect(`/tourist/${id}`);
})

// Maintenance Management

app.get('/maintenance', async (req, res) => {
  try {
    //const result = await pool.query('SELECT * FROM maintenance;');
    const result = await pool.query('select * from maintenance as a join Tech_Maintain_Entertainment as b ON a.maintenanceid = b.maintenanceid;');
    const result2 = await pool.query('select * from maintenance as a join tech_maintain_otherbuilding as b ON a.maintenanceid = b.maintenanceid;');
    var i = 0;
    while(result.rows[i] !== undefined){
      result.rows[i].date = String(result.rows[i].date).slice(0,16);
      i++;
    }
    i = 0;
    while(result2.rows[i] !== undefined){
      result2.rows[i].date = String(result2.rows[i].date).slice(0,16);
      i++;
    }
    var data = {Entertainment: result.rows, Others: result2.rows, message:req.flash('message')};
    res.render('pages/maintenance', data);
  }
  catch (error) {
    res.end(error);
  }
})

app.post('/maintenance/add', async (req, res) => {
  
  var mid = req.body.mid;
  var eid = req.body.eid;
  var fid = req.body.fid;
  var time = req.body.time;
  var date = req.body.date;
  var btype = req.body.btype;
  
  try {
    await pool.query(`insert into maintenance values (${mid},'${time}','${date}');`);
    res.redirect(`/maintenance/:${mid}/:${eid}/:${fid}/:${time}/:${date}/:${btype}`);
  }
  catch (error) {
    //console.log(error);
    //console.log(mid,eid,fid,time,date,btype);
    
    req.flash('message','Make sure to enter the right MaintenanceID, time, and date!');
    //console.log(error); 
    res.redirect('/maintenance');
  }
  
})

app.get('/maintenance/:mid/:eid/:fid/:time/:date/:btype', async (req, res) => {
  try {   
   var mid = req.params.mid.substring(1);
   var eid = req.params.eid.substring(1);
   var fid = req.params.fid.substring(1);
   var time = req.params.time.substring(1);
   var date = req.params.date.substring(1);
   var btype = req.params.btype.substring(1);
   console.log(mid,eid,fid,time,date,btype);
   console.log(btype=='e');
   console.log(btype=='o');
     if(btype=='e'){
       await pool.query(`insert into tech_maintain_entertainment values ('${eid}','${mid}','${fid}');`);
     }
     else if(btype=='o'){
       await pool.query(`insert into tech_maintain_otherbuilding values ('${eid}','${mid}','${fid}');`);
     }
    req.flash('message','Maintenance added successfully');  
   }
  catch (error) {
    await pool.query(`delete from maintenance where maintenanceid = '${mid}';`);
    req.flash('message','Make sure to enter the correct EmployeeID, and FacilityID!');
    //console.log(error);    
  }
  
  res.redirect('/maintenance');
})

app.get('/allTickets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM TicketPrice, TicketSales WHERE TicketPrice.Type = TicketSales.Type ORDER BY TicketID');
    res.render('pages/admission', result);
  }
  catch (error) {
    res.end(error);
  }
})


app.get('/ticketType', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM TicketPrice ORDER BY Type');
    res.render('pages/ticketprice', result);
  }
  catch (error) {
    res.end(error);
  }
})

app.get('/homepage', async (req, res) => {
  res.render('pages/index');
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

