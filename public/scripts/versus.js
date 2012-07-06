function voted(){
  changeContest();
}
function voteb(){
  changeContest();
}
function changeContest(){
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
}