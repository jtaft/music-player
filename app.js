const os = require('os');
const Sqrl = require('squirrelly')
const createError = require('http-errors');
const express = require('express');
const path = require('path')
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const busboy = require('busboy');
const logger = require('morgan');
const unzipper = require('unzipper');

var app = express();
var CURRENT_CONTENTS = {};
var CURRENTDIR = "public";
var MP3_DICT = {};

function ls(startPath){
  var startPath = decodeURI(startPath);
  console.log('Starting from dir '+startPath+'/');
  directoryContents = {
    files: [],
    folders: []
  }
  if (!fs.existsSync(startPath)) {
    return directoryContents;
  }

  var files=fs.readdirSync(startPath);
  for(var i=0;i<files.length;i++) {
    var filename=path.join(startPath,files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      directoryContents.folders.push(files[i]);
    } else if (filename.indexOf(".mp3") >= 0) {
      directoryContents.files.push(files[i]);
    }
  };
  return directoryContents;
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', Sqrl);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/javascripts', express.static(path.join(__dirname, 'javascripts')));


app.post('/album', function(req,res){
  var writePath = '';
  var field = {};
  var createDir = function(path) {
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
        console.log('Folder Created Successfully.');
    }
  }
  console.log(req.body);
  const bb = busboy({ headers: req.headers });
  bb.on('file', (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(info);
    console.log(
          `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
          filename,
          encoding,
          mimeType
        );
    writePath = path.join('./zips', filename);
    file.pipe(fs.createWriteStream(writePath));
    /*file.on('data', (data) => {
        console.log(`File [${filename}] got ${data.length} bytes`);
      }).on('close', () => {
        console.log(`File [${filename}] done`);
      });*/
    });
  bb.on('field', (name, val, info) => {
    console.log(`Field [${name}]: value: %j`, val);
    field[name] = val;
  });
  bb.on('close', () => {
    console.log('Done parsing form!');
    fs.createReadStream(writePath)
      .pipe(unzipper.Parse())
      .on('entry', function (entry) {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize; // There is also compressedSize;
        if (type === "File") {
          var filename = fileName.split("/").slice(-1)[0];
          console.log(filename);
          if (field["Artist"] !== undefined && field["Title"] !== undefined){
            var writeFolder = path.join('./public', field["Artist"], field["Title"]);
            var artistFolder = path.join('./public', field["Artist"]);
            createDir(artistFolder);
            createDir(writeFolder);
            entry.pipe(fs.createWriteStream(path.join(writeFolder, filename)));
          } else {
            entry.pipe(fs.createWriteStream(path.join('./public', filename)));
          }
        } else {
          entry.autodrain();
        }
      });
    //res.writeHead(303, { Connection: 'close', Location: '/' });
    res.send('Success');
    //res.end();
  });
  req.pipe(bb);
});

app.use('/', function (req, res) {
  console.log(req.url);
  if(req.url === "/") {
    res.redirect("public");
    return
  } else {
    CURRENTDIR = decodeURI(req.url.replace("/", ""));
    CURRENT_CONTENTS = ls(CURRENTDIR);
  }
  var files = [];
  var folders = [];
  console.log(CURRENT_CONTENTS.files);
  console.log(CURRENT_CONTENTS.folders);
  for(var i = 0; i < CURRENT_CONTENTS.files.length; i++) {
    files[i] = Sqrl.renderFile('views/file.squirrelly',
      {
        path: "\/" + decodeURI(CURRENTDIR) + "\/" + CURRENT_CONTENTS.files[i],
        filename: CURRENT_CONTENTS.files[i]
      }
    )
  }
  for(var i = 0; i < CURRENT_CONTENTS.folders.length; i++) {
    if(CURRENT_CONTENTS.folders[i] !== 'javascripts') {

      folders[i] = Sqrl.renderFile('views/folder.squirrelly',
        {
          path: "/" + decodeURI(CURRENTDIR) + "/" + CURRENT_CONTENTS.folders[i] + "/",
          foldername: CURRENT_CONTENTS.folders[i]
        }
      )
    }
  }
  Promise.all(files).then(function(filesResult) {
    Promise.all(folders).then(function(foldersResult) {
      var filesHtml = filesResult.join("");
      var foldersHtml = foldersResult.join("");
      Sqrl.renderFile('views/index.squirrelly', {
        name: 'Title',
        fav: 'Squirrelly',
        currentdir: decodeURI(CURRENTDIR),
        filesHtml: filesHtml,
        files: CURRENT_CONTENTS.files,
        foldersHtml: foldersHtml
      }).then(function(index) {
        res.send(index);
      });
    })
  })
});

console.log("try localhost:3000");

module.exports = app;
