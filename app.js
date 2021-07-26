const config = require('./config/app')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const ejs = require('ejs')
const path = require('path')
const indexRoute = require('./routes/indexRoute')
const authAdminRoute = require('./routes/authAdminRoute')
const sportRoute = require('./routes/sportRoute')
const teamRoute = require('./routes/teamRoute')
const eventRoute = require('./routes/eventRoute')
var session = require('express-session');
var response = require('./helpers/response')
var schedule = require('node-schedule');
const eventTable = require('./model/event')
//database coonection with mongodb
mongoose.Promise = global.Promise;
mongoose.connect(
  config.MONGODB_URL , { useNewUrlParser: true, useUnifiedTopology: true }) 
         .then(() => console.log("connection successful"))
          .catch((err) => console.error(err));
        //   const connectDb = async () => {
        //     try {
        //         await mongoose.connect( config.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        
        //         // console.info(`Connected to database on Worker process: ${process.pid}`)
        //         console.log("connected")
        //     } catch (error) {
        //         // console.error(`Connection error: ${error.stack} on Worker process: ${process.pid}`)
        //         // process.exit(1)
        //         console.log(error)
        //     }
        // }
 app.set('view engine','ejs')
 app.use('/',express.static(path.join(__dirname, 'public')));
 app.use('/auth',express.static(path.join(__dirname, 'public')));
 app.use('/sport',express.static(path.join(__dirname, 'public')));
 app.use('/team',express.static(path.join(__dirname, 'public')));
 app.use('/team/getUpdateTeam',express.static(path.join(__dirname, 'public')));
 app.use('/event',express.static(path.join(__dirname, 'public')));
 app.use('/event/getUpdateEvent',express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json({extended:true}))
app.use(bodyparser.urlencoded({extended:true}))

app.use(express.static('public/images')); 

app.use(session({
  secret: 'newScan@@#@@@#$@@*&$%$@B!@A&*@@R',
  resave: false,
  saveUninitialized: true,
  cookie: {} //{ secure: true }
}))

app.use('/',indexRoute)
app.use('/auth',authAdminRoute)
app.use('/sport',sportRoute)
app.use('/team',teamRoute);
app.use('/event',eventRoute)

// throw 404 if URL not found
// app.all("*", function(req, res) {
// 	return response.not_found(res, "Page not found");
// });


// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page0 */24 * * *
//   res.status(err.status || 500);
//   res.render('error');
// });

schedule.scheduleJob("0 */24 * * *",async function() { 
    console.log(Date.now() + "running a task daily at 12:00 AM");
      let test = await eventTable.updateMany({"eventDate":{$lt:Date.now()}},
         {
          $set:{
            status:1
          }
         }
        ) 
});

app.listen(config.PORT,()=>{
    console.log("listening port");
})