### Music Player

This application is a web server for uploading and playing music.

Currently runs the application on localhost:3000

Is expecting a folder named zips in the root directory to save the uploads to.

see [docker-commands.txt](https://github.com/jtaft/music-player/blob/master/docker-commands.txt) to start, or use `npm start`

example POST:
```json
{
"Header": "multipart/form-data",
"URL": "localhost:3000/album",
"Body":{
  "file": "1999.zip",
  "Artist": "Prince",
  "Title": "1999"
  }
}
```

It will take a zip and try to create a folder for the album in the form of "Artist > Title" so this album would be found at "/public/Prince/1999/" if Artist and Title are undefined it will save to /public

viewing the webplayer is at localhost:3000 or localhost:3000/public

zip files are saved to ./zips and then extracted to the directory created.
