function filebuttonclick(value) {
  //value: /public/ or /public/music/

  var audioPlayer = document.getElementById('audio');
  audioPlayer.src = value.replace('/public','');
  audioPlayer.setAttribute('muted', false);
  audioPlayer.removeAttribute('hidden');
}

function playallbuttonclick(files, path) {
  //files:  "file1.mp3,file2.mp3"
  //path: "public" or "public/music/"
  if (files === "") {
    return;
  }

  var musicQueue = [];
  var queueCounter = 0;
  var relativePath = path.replace('public','');
  console.log(relativePath);
  var fileArray = files.split(",");
  var audioPlayer = document.getElementById('audio');

  for(var i = 0; i < fileArray.length; i++) {
    musicQueue[i] = relativePath + fileArray[i];
    console.log(musicQueue[i]);
  }
  audioPlayer.src = musicQueue[0];
  audioPlayer.setAttribute('muted', false);
  audioPlayer.removeAttribute('hidden');
  audioPlayer.addEventListener('ended',
    function(ended) {
      queueCounter += 1;
      if (queueCounter >= musicQueue.length) {
        queueCounter = 0;
      }
      audioPlayer.src = musicQueue[queueCounter];
    });
}
