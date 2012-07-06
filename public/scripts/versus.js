function voted(){
  var d = new Date();
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "/voted?t=" + d.getTime() + "&i=" + document.getElementById("ditem").innerHTML;
  document.body.appendChild(s);
  changeContest();
}
function voteb(){
  var d = new Date();
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "/voteb?t=" + d.getTime() + "&i=" + document.getElementById("bitem").innerHTML;
  document.body.appendChild(s);
  changeContest();
}
function changeContest(){
  document.getElementById("middle").src = "http://logd.tw.rpi.edu/files/loading.gif";
  var d = new Date();
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "/contestants?t=" + d.getTime();
  document.body.appendChild(s);
}
function updateContestants(ditem, dpic, bitem, bpic){
  document.getElementById("ditem").innerHTML = ditem;
  document.getElementById("dpic").src = dpic;
  document.getElementById("bitem").innerHTML = bitem;
  document.getElementById("bpic").src = bpic;
  document.getElementById("middle").src = "http://usrbin.info/wikipediavspredator/media//img/vs.gif";
}