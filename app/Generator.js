var fs = window.require('fs');
var dialog = window.require('electron').remote.dialog;

export var generate = function(state){
  console.log('generating stubs with state', state);
  generatePackage(state);
  generateModels(state);
  generateApi(state);
  generateIndexJs(state);
};

function generatePackage(state){
  var db = '';
  switch(state.db){
    case 'PostgreSQL':
      db = `"pg": "^6.1.0",`;
      break;
    case 'SQLite':
      db = `"sqlite": "^2.2.0",`;
      break;
  }

  var packageJson = `{
  "dependencies": {
    "babel-loader": "^6.2.5",
    "babel-polyfill": "^6.13.0",
    "babel-preset-es2015": "^6.13.2",
    "babel-preset-react": "^6.11.1",
    "body-parser": "^1.15.2",
    "express": "^4.14.0",
    "react": "^15.3.1",
    "react-dom": "^15.3.1",
    "react-router": "^2.7.0",
    "sequelize": "^3.24.1",
    "webpack": "^1.13.2",
    ${db}
  }
}`;
  fs.writeFile(state.location+'/package.json', packageJson, function(err){
    if (err){
      dialog.showErrorBox('Error', `Error creating package.json
${JSON.stringify(err)}`);
    }
  });
}

function generateModels(state){
  var modelsJs = `module.exports = function(sequelize, DataTypes) {

  /**
   * All of your model definitions go here.
   * Return an object where each key is a model
   * name and the value is the result of sequelize.define
   * Don't forget to use the provided DataTypes object to define
   * your column data types
   */

};`;
  fs.writeFile(state.location+'/models.js', modelsJs, function(err){
    if (err){
      dialog.showErrorBox('Error', `Error creating models.js
${JSON.stringify(err)}`);
    }
  });
}

function generateApi(state){
  //TODO api folder and v1
  fs.mkdir(state.location+'/api', function(err){
    if (err){
      dialog.showErrorBox('Error', `Error creating /api
api folder probably already exists
${JSON.stringify(err)}`);
    }

    var v1 = `'use strict';
const prefix = '/api/v1/';

module.exports = function(options){

  //This is your express app object
  let app = options.app;
  //This is the map of all of your sequelize models
  let models = options.models;

  /**
   * All of your api routes go here.
   * Format them in the following way:
   * app.post(prefix+'endpoint', callback);
   * app.get(prefix+'endpoint', callback);
   */

};`;
    fs.writeFile(state.location+'/api/v1.js', v1, function(err){
      if (err){
        dialog.showErrorBox('Error', `Error creating /api/v1.js
api folder probably doesn't exist
${JSON.stringify(err)}`);
      }
    });
  });
}

function generateIndexJs(state){
  //TODO index.js
  var dbPath = state.dbUrlType === 'ENV' ?
  'process.env.'+state.dbPath : `"${state.dbPath}"`;
  var port = state.portType === 'ENV' ?
  'process.env.'+state.port : `${state.port}`;
  var indexJs = `'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const Sequelize = require('sequelize');
const db = new Sequelize(${dbPath}, {
  logging: false
});

//sync all sequelize models
db.sync();

const models = db.import(__dirname + '/models');

//parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Deliver the public folder statically
app.use(express.static('public'));

//This tells the server to listen
http.listen(${port}, function(){
  console.log('Example app listening on port', credentials.PORT, '!');
});

//This is the options object that will be passed to the api files
let apiOptions = {
  app: app,
  models: models
};

//Load the api versions
require('./api/v1')(apiOptions);

/*
 * This tells the server to always serve index.html no matter what,
 * excluding the previously defined api routes. This is so we can use
 * react-router's browserHistory feature.
 */
app.get('*', function(req, res){
  res.sendFile(__dirname+'/public/html/index.html');
});
`;
  fs.writeFile(state.location+'/index.js', indexJs, function(err){
    if (err){
      dialog.showErrorBox('Error', `Error creating index.js
${JSON.stringify(err)}`);
    }
  });
}

function generateConfigs(state){
  //TODO webpack.config.js .babelrc
}

function generateApp(state){
  //TODO everything in app
}

function generatePublic(state){
  //TODO everything in public
}
