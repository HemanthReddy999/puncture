const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const keyM="puncture_mechanics", keyR="puncture_requests";
const get=(k,d)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d));
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let mechanics=get(keyM,[
 {id:1,name:"Ravi Tyre Works",phone:"9876543210",area:"Main Road",services:["Puncture repair"],online:true,distance:"1.2 km"},
 {id:2,name:"Kumar Puncture Point",phone:"9123456780",area:"Market Road",services:["Puncture repair","Tyre replacement"],online:true,distance:"2.4 km"},
 {id:3,name:"Sai Tyres",phone:"9988776655",area:"Bypass Road",services:["Puncture repair"],online:false,distance:"3.1 km"}
]);
let requests=get(keyR,[]);
let vehicle="Bike", locationText="";

function show(id){$$(".screen").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active"); if(id==="mechanic")renderMechanic(); if(id==="customer")renderCustomer();}
$$("[data-screen]").forEach(b=>b.onclick=()=>show(b.dataset.screen));
$$(".vehicle").forEach(b=>b.onclick=()=>{$$(".vehicle").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");vehicle=b.dataset.vehicle;});

$("#locationBtn").onclick=()=>{
 if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(p=>{locationText=`GPS location captured (${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)})`;$("#locationStatus").textContent="📍 "+locationText;},
  ()=>{locationText="Demo location";$("#locationStatus").textContent="📍 Location permission not available — using demo location.";});
 }else{locationText="Demo location";$("#locationStatus").textContent="📍 Using demo location."}
};

$("#findBtn").onclick=()=>{
 const available=mechanics.filter(m=>m.online);
 $("#mechanicResults").innerHTML=available.length?`<h3 style="margin-top:24px">Nearby available mechanics</h3>`+available.map(m=>`
 <div class="mechanic-card">
  <div class="mechanic-top"><div><div class="mechanic-name">🔧 ${m.name}</div><div class="meta">${m.area} · ${m.phone}</div></div><span class="pill">ONLINE</span></div>
  <div class="distance">📍 Approx. ${m.distance} away</div>
  <div class="meta">${m.services.join(" · ")}</div>
  <div class="actions"><button onclick="callMe('${m.phone}')">📞 Call</button><button class="accept" onclick="requestService(${m.id})">Request Service</button></div>
 </div>`).join(""):`<div class="empty">No mechanics are online right now.</div>`;
};
window.callMe=p=>{location.href="tel:"+p};
window.requestService=id=>{
 const m=mechanics.find(x=>x.id===id);
 const r={id:Date.now(),mechanicId:id,mechanicName:m.name,vehicle,problem:$("#problem").value,location:locationText||"Demo location",status:"Pending",time:new Date().toLocaleString()};
 requests.push(r);set(keyR,requests);
 $("#customerRequest").innerHTML=`<div class="success">✅ Request sent to ${m.name}.<br><small>Waiting for the mechanic to accept.</small></div>`;
 renderMechanic();
};
function renderCustomer(){ if(!$("#mechanicResults").innerHTML) $("#customerRequest").innerHTML=""; }

function renderMechanic(){
 const own=mechanics[mechanics.length-1];
 const hasRegistered=mechanics.some(m=>m.id>3);
 $("#registerBox").style.display=hasRegistered?"none":"block";
 $("#mechanicDashboard").innerHTML=hasRegistered?`
 <div class="card"><h3>🔧 ${own.name}</h3>
 <div class="meta">${own.area} · ${own.phone}</div>
 <div class="toggle"><span>Status: <b>${own.online?"Online":"Offline"}</b></span>
 <button class="${own.online?"online":"offline"}" onclick="toggleOnline(${own.id})">${own.online?"🟢 Online":"⚪ Offline"}</button></div>
 <div class="meta">Services: ${own.services.join(", ")}</div></div>`:"";
 const mine=requests.filter(r=>r.mechanicId===own.id);
 $("#requests").innerHTML=hasRegistered?`<h3 style="margin:24px 0 8px">Service Requests</h3>`+(mine.length?mine.map(r=>`
 <div class="request"><h4>🛞 ${r.problem}</h4><div class="meta">${r.vehicle} · ${r.location}</div><div class="meta">${r.time}</div>
 ${r.status==="Pending"?`<div class="actions"><button class="accept" onclick="acceptRequest(${r.id})">Accept Request</button></div>`:`<div class="success">Status: ${r.status}</div>`}</div>`).join(""):`<div class="empty">No requests yet. Keep your status Online.</div>`):"";
}
window.toggleOnline=id=>{mechanics=mechanics.map(m=>m.id===id?{...m,online:!m.online}:m);set(keyM,mechanics);renderMechanic();};
window.acceptRequest=id=>{requests=requests.map(r=>r.id===id?{...r,status:"Accepted — mechanic is coming"}:r);set(keyR,requests);renderMechanic();alert("Request accepted. Customer can now be informed.");};

$("#registerBtn").onclick=()=>{
 const name=$("#mName").value.trim(),phone=$("#mPhone").value.trim(),area=$("#mArea").value.trim();
 if(!name||!phone||!area){alert("Please fill in name, mobile number and service area.");return}
 const services=[...document.querySelectorAll("#registerBox input[type=checkbox]:checked")].map(x=>x.value);
 const m={id:Date.now(),name,phone,area,services:services.length?services:["Puncture repair"],online:true,distance:"Nearby"};
 mechanics.push(m);set(keyM,mechanics);renderMechanic();
 alert("Mechanic registered successfully!");
};

$("#resetBtn").onclick=()=>{if(confirm("Reset the prototype data?")){localStorage.removeItem(keyM);localStorage.removeItem(keyR);location.reload();}};
renderMechanic();
