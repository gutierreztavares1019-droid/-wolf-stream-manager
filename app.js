const KEY="wolf_stream_manager_v1";
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{
 accounts:[
  {id:1,name:"Netflix #01",platform:"Netflix",email:"netflix@correo.com",profiles:5,renew:"2026-09-27"},
  {id:2,name:"Disney+ #02",platform:"Disney+",email:"disney@correo.com",profiles:7,renew:"2026-09-14"},
  {id:3,name:"Spotify #01",platform:"Spotify",email:"spotify@correo.com",profiles:6,renew:"2026-10-02"}
 ],
 clients:[
  {id:1,name:"Juan Martínez",platform:"Netflix",accountId:1,profile:"Perfil 1",start:"2026-08-27",renew:"2026-09-27",price:220},
  {id:2,name:"Ana López",platform:"Disney+",accountId:2,profile:"Perfil 2",start:"2026-08-14",renew:"2026-09-14",price:180}
 ]
};
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function days(date){return Math.ceil((new Date(date+"T23:59:59")-new Date())/86400000)}
function used(a){return db.clients.filter(c=>c.accountId==a.id && days(c.renew)>=0).length}
function available(a){return Math.max(0,a.profiles-used(a))}
function money(n){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n||0)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function render(page="inicio"){
 const v=document.getElementById("view");
 document.querySelectorAll(".bottom button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 if(page==="inicio") return home(v);
 if(page==="cuentas") return accounts(v);
 if(page==="clientes") return clients(v);
 if(page==="renovaciones") return renewals(v);
 return more(v);
}
function shell(title,body,add=""){return `<div class="content"><div class="title"><h1>${title}</h1>${add}</div>${body}</div>`}
function home(v){
 const total=db.accounts.length, avail=db.accounts.reduce((n,a)=>n+available(a),0), occ=db.accounts.reduce((n,a)=>n+used(a),0), active=db.clients.filter(c=>days(c.renew)>=0).length;
 const next=[...db.clients].filter(c=>days(c.renew)>=0).sort((a,b)=>days(a.renew)-days(b.renew)).slice(0,5);
 v.innerHTML=shell("Inicio",`
 <div class="hero"><img src="assets/wolf-stream-logo.jpg"><h2>WOLF STREAM</h2><p>Administrador de cuentas y clientes</p></div>
 <div class="grid">
  <div class="card metric"><strong>${total}</strong><small>Cuentas totales</small></div>
  <div class="card metric"><strong class="green">${avail}</strong><small>Perfiles disponibles</small></div>
  <div class="card metric"><strong class="red">${occ}</strong><small>Perfiles ocupados</small></div>
  <div class="card metric"><strong class="purple">${active}</strong><small>Clientes activos</small></div>
 </div>
 <div class="section">Próximos vencimientos</div>
 <div class="list">${next.length?next.map(c=>`<div class="item row"><div><b>${esc(c.name)}</b><span class="muted">${esc(c.platform)}</span></div><span class="pill ${days(c.renew)<=3?'redbg':'greenbg'}">${days(c.renew)} días</span></div>`).join(""):`<div class="empty">No hay vencimientos próximos.</div>`}</div>
 `);
}
function accounts(v){
 const cards=db.accounts.map(a=>{let av=available(a);return `<div class="item"><div class="row"><div><b>${esc(a.name)}</b><span class="muted">${esc(a.platform)} · ${esc(a.email)}</span></div><span class="pill ${av?'greenbg':'redbg'}">${av} libres</span></div><div class="muted" style="margin-top:8px">${used(a)} ocupados de ${a.profiles} perfiles · renovación ${days(a.renew)} días</div><div class="progress"><i style="width:${Math.min(100,used(a)/a.profiles*100)}%"></i></div></div>`}).join("");
 v.innerHTML=shell("Cuentas",`<input class="search" placeholder="Buscar cuenta..." oninput="filterItems(this.value,'accountsList')"><div id="accountsList" class="list">${cards||'<div class="empty">Agrega tu primera cuenta.</div>'}</div>`,`<button class="add" onclick="openAccount()">+ Cuenta</button>`);
}
function clients(v){
 const cards=db.clients.map(c=>`<div class="item"><div class="row"><div><b>${esc(c.name)}</b><span class="muted">${esc(c.platform)} · ${esc(c.profile)}</span></div><span class="pill ${days(c.renew)<=3?'redbg':'greenbg'}">${days(c.renew)<0?'Vencido':days(c.renew)+' días'}</span></div><div class="muted" style="margin-top:7px">${money(c.price)} · renovación ${esc(c.renew)}</div></div>`).join("");
 v.innerHTML=shell("Clientes",`<input class="search" placeholder="Buscar cliente..." oninput="filterItems(this.value,'clientsList')"><div id="clientsList" class="list">${cards||'<div class="empty">Agrega tu primer cliente.</div>'}</div>`,`<button class="add" onclick="openClient()">+ Cliente</button>`);
}
function renewals(v){
 const list=[...db.clients].sort((a,b)=>days(a.renew)-days(b.renew)).map(c=>`<div class="item row"><div><b>${esc(c.name)}</b><span class="muted">${esc(c.platform)} · ${esc(c.profile)}</span></div><div style="text-align:right"><b class="${days(c.renew)<=3?'danger':'green'}">${days(c.renew)<0?'Vencido':days(c.renew)+' días'}</b><span class="muted"> ${esc(c.renew)}</span></div></div>`).join("");
 v.innerHTML=shell("Renovaciones",`<div class="tabs"><button class="sel">Próximas</button><button onclick="alert('El historial se añadirá en la siguiente versión.')">Historial</button></div><div class="list">${list||'<div class="empty">Sin renovaciones.</div>'}</div>`);
}
function more(v){
 v.innerHTML=shell("Más",`<div class="list">
 <div class="item"><b>📊 Reportes</b><span class="muted">Consulta ingresos y rendimiento.</span></div>
 <div class="item"><b>⚙️ Configuración</b><span class="muted">Los datos de esta versión se guardan en este dispositivo.</span></div>
 <div class="item"><b>💾 Respaldo</b><span class="muted">Exporta tus datos para no perderlos.</span><br><button class="add" style="margin-top:10px" onclick="backup()">Exportar JSON</button></div>
 <div class="item"><b>📥 Restaurar</b><span class="muted">Importa un respaldo JSON.</span><br><input type="file" accept=".json" onchange="restore(event)" style="margin-top:10px"></div>
 </div>`);
}
function filterItems(q,id){document.querySelectorAll("#"+id+" .item").forEach(x=>x.style.display=x.innerText.toLowerCase().includes(q.toLowerCase())?"":"none")}
function openAccount(){
 modal("Nueva cuenta",[
  ["name","Nombre de la cuenta","Netflix #01","text"],
  ["platform","Plataforma","Netflix","text"],
  ["email","Correo","correo@ejemplo.com","email"],
  ["profiles","Número de perfiles","5","number"],
  ["renew","Próxima renovación","","date"]
 ],data=>{db.accounts.push({...data,id:Date.now(),profiles:+data.profiles});save();closeModal();render("cuentas")});
}
function openClient(){
 const opts=db.accounts.map(a=>`<option value="${a.id}">${esc(a.name)} (${available(a)} libres)</option>`).join("");
 modal("Nuevo cliente",[
  ["name","Nombre del cliente","Nombre","text"],
  ["platform","Plataforma","Netflix","text"],
  ["accountId","Cuenta asignada",opts,"select"],
  ["profile","Perfil asignado","Perfil 1","text"],
  ["start","Inicio","","date"],
  ["renew","Próxima renovación","","date"],
  ["price","Precio mensual","220","number"]
 ],data=>{db.clients.push({...data,id:Date.now(),accountId:+data.accountId,price:+data.price});save();closeModal();render("clientes")});
}
function modal(title,fields,submit){
 document.getElementById("modalTitle").textContent=title;
 document.getElementById("entityForm").innerHTML=fields.map(([n,l,p,t])=>t==="select"?`<div class="field"><label>${l}</label><select name="${n}">${p}</select></div>`:`<div class="field"><label>${l}</label><input required name="${n}" type="${t}" placeholder="${p}"></div>`).join("")+`<button class="submit">Guardar</button>`;
 document.getElementById("entityForm").onsubmit=e=>{e.preventDefault();let d=Object.fromEntries(new FormData(e.target));submit(d)};
 document.getElementById("modal").classList.remove("hidden");
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function backup(){const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="wolf-stream-respaldo.json";a.click()}
function restore(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();render("mas");alert("Respaldo restaurado.");}catch{alert("Archivo no válido.")}};r.readAsText(f)}
document.querySelectorAll(".bottom button").forEach(b=>b.onclick=()=>render(b.dataset.page));
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("notifyBtn").onclick=()=>render("renovaciones");
render();
