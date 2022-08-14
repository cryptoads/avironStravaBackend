const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const app = express()
const parse = require('csv-parse').parse
const os = require('os')
const multer  = require('multer')
const upload = multer({ dest: os.tmpdir() })
const fs = require('fs')
const stringify = require('csv-stringify').stringify
const port = process.env.PORT || 3000
require('dotenv').config()
app.use(bodyParser.json())
app.use(express.static('public'))

const apiKey = process.env.MYAPIKEY;
const clientId = process.env.MYCLIENTID;
async function authToken(a,b){
    var config = {
        method: 'post',
        url: 'https://www.strava.com/oauth/token?client_id='+clientId+'&client_secret='+apiKey+'&code='+a+'&grant_type=authorization_code&scope=read,read_all',
      };
      
      axios(config)
      .then(function (response) {
       let data = (JSON.stringify(response.data));
       console.log(data)
       return(data)
      })
      .catch(function (error) {
        console.log(error);
      });
}

let accessToken = "nan"

app.get('/', (req, res) => {
  res.redirect('/read.html');
  console.log(accessToken)
})

app.get('/exchange_token', (req, res) => {
    let code = req.query.code
    let scope = req.query.scope  
    async function authToken(a,b){
        var config = {
            method: 'post',
            url: 'https://www.strava.com/oauth/token?client_id='+clientId+'&client_secret='+apiKey+'&code='+a+'&grant_type=authorization_code&scope=read,read_all',
          };      
          
          axios(config)
          .then(function (response) {
           let data = (JSON.stringify(response.data));
           accessToken= response.data.access_token;
           
           console.log(accessToken)
           res.redirect('/read.html');
           return(data)
          })
          .catch(function (error) {
            console.log(error);
          });
    }
    authToken(code,scope)
  })

  app.post('/read', upload.single('file'), (req, res) => {
    const file = req.file
  
    const data = fs.readFileSync(file.path)
    parse(data, (err, records) => {
      if (err) {
        console.error(err)
        return res.status(400).json({success: false, message: 'An error occurred'})
      }
      console.log(accessToken)
      console.log({data:records})
      return res.json({data: records, "accessToken": accessToken})
    })
  })

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})