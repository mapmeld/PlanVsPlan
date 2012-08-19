var firstVote = true;
function voter(side){
  if(!firstVote){
    var u, support;
    if(side == 0){
      support = "centralpark";
      u = $("dpic").src;
    }
    else{
      support = "goldengatepark";
      u = $("bpic").src;
    }
    var d = new Date();
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "/standardvote?t=" + d.getTime() + "&u=" + encodeURIComponent(u) + "&support=" + encodeURIComponent(support);
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
  $("middle").src = "http://i.imgur.com/P8VmU.png";
}
function $(id){
  return document.getElementById(id);
}