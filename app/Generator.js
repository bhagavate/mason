var fs = window.require('fs');
var dialog = window.require('electron').remote.dialog;

export var generate = function(state){
  console.log('generating stubs with state', state);
  generatePackage(state);
  generateModels(state);
  generateApi(state);
  generateIndexJs(state);
  generateConfigs(state);
  generateApp(state);
  generatePublic(state);
};

function generatePackage(state){
  var db = '';
  if (state.dbExists){
    db += `\n\t\t"sequelize": "^3.24.1",`;
    switch(state.db){
      case 'PostgreSQL':
        db += `\n\t\t"pg": "^6.1.0",`;
        break;
      case 'SQLite':
        db += `\n\t\t"sqlite": "^2.2.0",`;
        break;
    }
  }

  writeFile(
    state.location+'/package.json',
    require('../templates/package.json.js')({
      db: db
    })
  );
}

function generateModels(state){
  if (state.dbExists){
    writeFile(
      state.location+'/models.js',
      require('../templates/models.js.js')()
    );
  }
}

function generateApi(state){
  mkDir(state.location+'/api', function(err){
    var models = state.dbExists ?
    `\n\t//This is the map of all of your sequelize models\n`+
    `\tlet models = options.models;` : '';
    writeFile(
      state.location+'/api/v1.js',
      require('../templates/v1.js.js')({
        models: models
      })
    );
  });
}

function generateIndexJs(state){
  var dbPath = state.dbUrlType === 'ENV' ?
  'process.env.'+state.dbPath : `"${state.dbPath}"`;
  var db = state.dbExists ?
    `\nconst Sequelize = require('sequelize');\n`+
    `const db = new Sequelize(${dbPath}, {\n`+
    `\tlogging: false\n});\n\n`+
    `//sync all sequelize models\ndb.sync();\n` : '';
  var port = state.portType === 'ENV' ?
    'process.env.'+state.port : `${state.port}`;
  var models = state.dbExists ?
    `\nconst models = db.import(__dirname + '/models');\n` : '';
  var modelsOption = state.dbExists ?
    `,\n\tmodels: models` : '';
  writeFile(
    state.location+'/index.js',
    require('../templates/index.js.js')({
      db: db,
      port: port,
      models: models,
      modelsOption: modelsOption
    })
  );
}

function generateConfigs(state){
  writeFile(
    state.location+'/webpack.config.js',
    require('../templates/webpack.config.js.js')()
  );
  writeFile(
    state.location+'/.babelrc',
    require('../templates/babelrc.js')()
  );
  writeFile(
    state.location+'/.gitignore',
    require('../templates/gitignore.js')()
  );
}

function generateApp(state){
  mkDir(state.location+'/app', function(err){
    writeFile(
      state.location+'/app/index.jsx',
      require('../templates/index.jsx.js')()
    );
  });
}

function generatePublic(state){
  mkDir(state.location+'/public', function(err){

    mkDir(state.location+'/public/html', function(err){
      writeFile(
        state.location+'/public/html/index.html',
        require('../templates/index.html.js')()
      );
    });

    mkDir(state.location+'/public/css', function(err){

      writeFile(
        state.location+'/public/css/stylesheet.css',
        require('../templates/stylesheet.css.js')()
      );
    });

    mkDir(state.location+'/public/js');
  });
}

function mkDir(path, callback){
  fs.mkdir(path, function(err){
    if (err){
      dialog.showErrorBox('Error', `Error creating ${path}
Folder probably already exists
${JSON.stringify(err)}`);
    }
    if (callback){
      callback(err);
    }
  });
}

function writeFile(path, file, callback){
  fs.writeFile(path, file, function(err){
    if (err){
      dialog.showErrorBox('Error', `Error creating ${path}
${JSON.stringify(err)}`);
    }
    if (callback){
      callback(err);
    }
  });
}
