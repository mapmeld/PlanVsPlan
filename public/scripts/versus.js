var firstVote = true;
function voted(){
  if(!firstVote){
    var d = new Date();
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "/voted?t=" + d.getTime() + "&i=" + $("ditem").innerHTML;
    document.body.appendChild(s);
  }
  firstVote = false;
  changeContest();
}
function voteb(){
  if(!firstVote){
    var d = new Date();
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "/voteb?t=" + d.getTime() + "&i=" + $("bitem").innerHTML;
    document.body.appendChild(s);
  }
  firstVote = false;
  changeContest();
}
function changeContest(){
  $("middle").src = "http://i.imgur.com/VU0Q4.gif";
  var d = new Date();
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "/contestants?t=" + d.getTime();
  document.body.appendChild(s);
}
function updateContestants(ditem, dpic, dvotes, dcredit, bitem, bpic, bvotes, bcredit){
  $("dcredit").innerHTML = dcredit;
  $("bcredit").innerHTML = bcredit;
  $("ditem").innerHTML = ditem;
  $("dpic").src = dpic;
  $("dvotes").innerHTML = dvotes;
  $("bitem").innerHTML = bitem;
  $("bpic").src = bpic;
  $("bvotes").innerHTML = bvotes;
  $("middle").src = "http://i.imgur.com/RY1V1.gif";
}
function $(id){
  return document.getElementById(id);
}