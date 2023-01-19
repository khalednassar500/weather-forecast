const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

app.use(express.static('appUI'));

const port = 8080;
const server = app.listen(port, () => {
  console.log('server work at \nlocalhost:'+port);
})

/*----------------------------------------------------*/
let projectData = {};

app.get('/all', (req, res) => {
  res.send(projectData);
})

app.post('/add', (req, res) => {
  projectData = {};

  projectData = req.body;
  res.send({'done': '1'})
})