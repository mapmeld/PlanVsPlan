var firstVote = true;
function voter(){
  if(!firstVote){
    var d = new Date();
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "/voter?t=" + d.getTime() + "&i=" + $("ditem").innerHTML;
    document.body.appendChild(s);
  }
  firstVote = false;
  changeContest();
}
function changeContest(){
  $("middle").src = "http://logd.tw.rpi.edu/files/loading.gif";
  var d = new Date();
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "/contestants?topic=101&t=" + d.getTime();
  document.body.appendChild(s);
}
function updateContestants(ditem, dpic, dvotes, dcredit, bitem, bpic, bvotes, bcredit){
  $("dcredit").innerHTML = dcredit;
  $("ditem").innerHTML = ditem;
  $("dpic").src = dpic;
  $("dvotes").innerHTML = dvotes;
  $("bcredit").innerHTML = bcredit;
  $("bitem").innerHTML = bitem;
  $("bpic").src = bpic;
  $("bvotes").innerHTML = bvotes;
  $("middle").src = "http://usrbin.info/wikipediavspredator/media//img/vs.gif";
}
function $(id){
  return document.getElementById(id);
}