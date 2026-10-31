/* =====================================================================
   AgriGO – front-end prototype (HTML + CSS + vanilla JS + LocalStorage)
   Sections: 1 Data · 2 Helpers · 3 Store · 4 Router · 5 Home · 6 Detail
   7 Delivery · 8 Checkout · 9 Tracking · 10 Create · 11 Chat · 12 Settings
   ===================================================================== */
'use strict';

/* ---------- 1. DATA ---------- */
const CATS = ['All','Vegetables','Fruits','Rice and Grains','Root Crops','Livestock','Poultry','Agricultural Supplies','Other Products'];

// Philippine regions → provinces (used by the Home "sort by location")
const PH_REGIONS=[
 ['NCR – National Capital Region',['Metro Manila']],
 ['CAR – Cordillera Administrative Region',['Abra','Apayao','Benguet','Ifugao','Kalinga','Mountain Province']],
 ['Region I – Ilocos Region',['Ilocos Norte','Ilocos Sur','La Union','Pangasinan']],
 ['Region II – Cagayan Valley',['Batanes','Cagayan','Isabela','Nueva Vizcaya','Quirino']],
 ['Region III – Central Luzon',['Aurora','Bataan','Bulacan','Nueva Ecija','Pampanga','Tarlac','Zambales']],
 ['Region IV-A – CALABARZON',['Batangas','Cavite','Laguna','Quezon','Rizal']],
 ['MIMAROPA – Region IV-B',['Marinduque','Occidental Mindoro','Oriental Mindoro','Palawan','Romblon']],
 ['Region V – Bicol Region',['Albay','Camarines Norte','Camarines Sur','Catanduanes','Masbate','Sorsogon']],
 ['Region VI – Western Visayas',['Aklan','Antique','Capiz','Guimaras','Iloilo','Negros Occidental']],
 ['Region VII – Central Visayas',['Bohol','Cebu','Negros Oriental','Siquijor']],
 ['Region VIII – Eastern Visayas',['Biliran','Eastern Samar','Leyte','Northern Samar','Samar','Southern Leyte']],
 ['Region IX – Zamboanga Peninsula',['Zamboanga del Norte','Zamboanga del Sur','Zamboanga Sibugay']],
 ['Region X – Northern Mindanao',['Bukidnon','Camiguin','Lanao del Norte','Misamis Occidental','Misamis Oriental']],
 ['Region XI – Davao Region',['Davao de Oro','Davao del Norte','Davao del Sur','Davao Occidental','Davao Oriental']],
 ['Region XII – SOCCSKSARGEN',['Cotabato','Sarangani','South Cotabato','Sultan Kudarat']],
 ['Region XIII – Caraga',['Agusan del Norte','Agusan del Sur','Dinagat Islands','Surigao del Norte','Surigao del Sur']],
 ['BARMM – Bangsamoro Region',['Basilan','Lanao del Sur','Maguindanao del Norte','Maguindanao del Sur','Sulu','Tawi-Tawi']]];
const NCR_WORDS=['metro manila','manila','quezon city','makati','pasig','taguig','caloocan','pasay','marikina','mandaluyong','valenzuela','las piñas','las pinas','muntinlupa','parañaque','paranaque','malabon','navotas'];
const CITY_PROV={'davao city':'Davao del Sur','cebu city':'Cebu','baguio':'Benguet','olongapo':'Zambales','cagayan de oro':'Misamis Oriental','iloilo city':'Iloilo','zamboanga city':'Zamboanga del Sur','general santos':'South Cotabato','bacolod':'Negros Occidental'};
const PROV_LIST=PH_REGIONS.flatMap(([r,ps])=>ps.map(pv=>({pv,r}))).sort((a,b)=>b.pv.length-a.pv.length); // longest name first (South Cotabato before Cotabato)
// Work out the province/region of a listing from its free-text location
function locOf(p){
  const l=(p.loc||'').toLowerCase();
  if(NCR_WORDS.some(w=>l.includes(w))) return {pv:'Metro Manila',r:PH_REGIONS[0][0]};
  const hit=PROV_LIST.find(x=>l.includes(x.pv.toLowerCase())); if(hit) return hit;
  const c=Object.keys(CITY_PROV).find(k=>l.includes(k)); if(c){ const pv=CITY_PROV[c]; return PROV_LIST.find(x=>x.pv===pv); }
  return {pv:'',r:''};
}

// [name, category, emoji, photo keyword, price, unit, market ref price, qty, seller, location, lat, lng, description]
const SEED = [
 ['Fresh Tomatoes','Vegetables','🍅','tomato',18,'kg',20,300,'Mang Berting Farm','Tarlac City, Tarlac',15.4755,120.5963,'Firm, vine-ripened tomatoes harvested this morning. Ideal for sauces, salads and wholesale.'],
 ['Red Onions','Vegetables','🧅','red,onion',28,'kg',31,500,'Nueva Ecija Growers Coop','Bongabon, Nueva Ecija',15.6403,121.1322,'Pungent Bongabon red onions, properly cured and sorted.'],
 ['White Onions','Vegetables','🧅','white,onion',30,'kg',34,400,'Aling Cora Gulayan','Cabanatuan, Nueva Ecija',15.4859,120.9672,'Mild white onions, good for cooking and salsa.'],
 ['Fresh Eggplant','Vegetables','🍆','eggplant',15,'kg',17,180,'Kuya Dado Farm','Magalang, Pampanga',15.2156,120.6597,'Long, glossy native eggplants. Picked daily.'],
 ['Bitter Gourd (Ampalaya)','Vegetables','🥒','bitter,melon',14,'kg',16,120,'Hardin ni Lola Nena','Candaba, Pampanga',15.0926,120.8261,'Fresh ampalaya with a good size and firm skin.'],
 ['Fresh Okra','Vegetables','🌿','okra',14,'kg',16,90,'Sitio Maligaya Farm','Mabalacat, Pampanga',15.2217,120.5726,'Tender okra pods, harvested at peak freshness.'],
 ['Cabbage','Vegetables','🥬','cabbage',16,'kg',18,600,'Benguet Highland Farmers','La Trinidad, Benguet',16.4609,120.5887,'Crisp highland cabbage with tight, heavy heads.'],
 ['Carrots','Root Crops','🥕','carrot',14,'kg',16,450,'Benguet Highland Farmers','Atok, Benguet',16.6000,120.7700,'Sweet, crunchy carrots, washed and graded.'],
 ['Fresh Pechay','Vegetables','🥬','bok,choy',4,'bundle',5,200,'Mabini Urban Garden','Angeles City, Pampanga',15.1450,120.5887,'Leafy pechay bundles grown without synthetic pesticides.'],
 ['Sweet Potatoes','Root Crops','🍠','sweet,potato',15,'kg',17,350,'Camote Hills Farm','Camiling, Tarlac',15.6867,120.4167,'Orange-fleshed camote, naturally sweet.'],
 ['White Rice','Rice and Grains','🍚','rice,grains',820,'sack',900,120,'Central Luzon Rice Mill','San Jose City, Nueva Ecija',15.7900,120.9900,'Premium well-milled white rice, 50 kg per sack.'],
 ['Brown Rice','Rice and Grains','🌾','brown,rice',800,'sack',880,60,'Central Luzon Rice Mill','Guimba, Nueva Ecija',15.6600,120.7700,'Whole-grain brown rice, rich in fiber. 50 kg per sack.'],
 ['Fresh Corn','Vegetables','🌽','corn,cob',2,'piece',3,800,'Mang Tonyo Farm','Bamban, Tarlac',15.2800,120.5700,'Sweet white corn on the cob, boiled-ready.'],
 ['Ripe Mangoes','Fruits','🥭','mango',35,'kg',39,250,'Zambales Mango Growers','Botolan, Zambales',15.2894,120.0239,'Sweet Carabao mangoes, ripe and ready to eat.'],
 ['Lakatan Bananas','Fruits','🍌','banana',25,'kg',28,300,'Davao Banana Farm','Mabalacat, Pampanga',15.2300,120.5800,'Golden Lakatan bananas with a rich, sweet aroma.'],
 ['Watermelon','Fruits','🍉','watermelon',40,'kg',45,500,'Pampanga Fruit Farm','Arayat, Pampanga',15.1500,120.7700,'Juicy red watermelon, averaging 4–6 kg each.'],
 ['Fresh Pineapple','Fruits','🍍','pineapple',45,'piece',50,400,'Pinya Plantation Co.','Magalang, Pampanga',15.2200,120.6600,'Sweet, low-acid pineapple, picked fully ripe.'],
 ['Native Chicken','Poultry','🐓','free,range,chicken',145,'piece',160,60,'Aling Tess Poultry','Capas, Tarlac',15.3300,120.5900,'Free-range native chicken (Tinola/Inasal grade), about 1.2 kg each.'],
 ['Fresh Eggs','Poultry','🥚','eggs',6,'piece',7,3000,'San Rafael Egg Farm','San Rafael, Bulacan',14.9800,120.9500,'Medium-sized fresh chicken eggs, tray of 30 available.'],
 ['Organic Fertilizer','Agricultural Supplies','🌱','compost,fertilizer',450,'sack',480,200,'Bio-Gro Supplies','Mexico, Pampanga',15.0700,120.7200,'Composted organic fertilizer, 25 kg per sack. For vegetables and rice.']
];

// Vehicles: img file, capacity (kg), base fare, per km, eta factor
const VEHICLES = [
 {id:'sedan',name:'AgriGO Sedan',desc:'Small packages & lightweight produce',cap:200,base:94,km:15,eta:1.0},
 {id:'truck',name:'AgriGO L300',desc:'Medium-sized agricultural deliveries',cap:1000,base:260,km:20,eta:1.15},
 {id:'large-truck',name:'AgriGO Large Delivery Truck',desc:'Larger agricultural shipments',cap:3000,base:670,km:25,eta:1.3},
 {id:'cargo-van',name:'AgriGO Cargo Van',desc:'Enclosed transport for delicate produce',cap:900,base:220,km:20,eta:1.1},
 {id:'scooter',name:'AgriGO Motorcycle',desc:'Small, lightweight, fast deliveries',cap:20,base:45,km:5,eta:.8},
 {id:'pickup',name:'AgriGO Pickup',desc:'Supplies & medium-sized cargo',cap:800,base:180,km:18,eta:1.05},
 {id:'mpv',name:'AgriGO Small Crossover SUV',desc:'Smaller cargo & multi-item deliveries',cap:500,base:110,km:18,eta:1.0},
 {id:'box-truck',name:'AgriGO Aluminum Van',desc:'Large products & bulk deliveries',cap:2000,base:450,km:30,eta:1.25},
 {id:'tricycle',name:'AgriGO Tricycle',desc:'Short-distance, smaller farm loads',cap:300,base:85,km:8,eta:1.4,maxKm:15}
];
// Service multipliers (sample pricing only)
const SERVICES = [
 {id:'priority',name:'Priority Delivery',ic:'⚡',desc:'Faster service, prioritized booking',mult:1.35,eta:.85,wait:'Driver in ~5 min'},
 {id:'regular',name:'Regular Delivery',ic:'🚚',desc:'Standard delivery schedule',mult:1,eta:1,wait:'Driver in ~15 min'},
 {id:'pooling',name:'Pooling Delivery',ic:'👥',desc:'Shares a route with compatible deliveries – cheaper, slower',mult:.75,eta:1.5,wait:'Driver in ~45 min'},
 {id:'later',name:'Book for Later',ic:'🗓️',desc:'Schedule a pickup for a future date & time',mult:1,eta:1,wait:'Scheduled'}
];
const STOP_FEE = 40;
VEHICLES.sort((a,b)=>a.cap-b.cap);
const STATUS_DEL = ['Booking Confirmed','Waiting for Driver','Driver Assigned','Driver Going to Pickup','Product Picked Up','In Transit','Arriving at Destination','Successfully Delivered'];
const STATUS_PICK = ['Booking Confirmed','Seller Preparing Order','Ready for Pickup','Picked Up – Order Completed'];
const DRIVERS = [{name:'Ramon Dela Cruz',plate:'NBC 4821',phone:'0917 555 0142',rating:4.9},{name:'Joel Mendoza',plate:'ABX 1976',phone:'0918 555 0177',rating:4.8},{name:'Carlo Santos',plate:'DAK 3304',phone:'0920 555 0119',rating:4.9}];
// Home = Angeles University Foundation campus, MacArthur Highway, Angeles City (15°08′42″N 120°35′46″E)
const HOME_ADDR = {addr:'AUF, EYA Building, Angeles City, Pampanga, Philippines',lat:15.1450,lng:120.5960};

/* ---------- 2. HELPERS ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const peso = n => '₱'+Number(n).toLocaleString('en-PH',{maximumFractionDigits:2});
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago = t => { const d=(Date.now()-t)/864e5; return d<1?'Today':d<2?'Yesterday':Math.floor(d)+' days ago'; };
const clock = t => new Date(t).toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'});
const dateStr = t => new Date(t).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
const dur = m => m<60?Math.round(m)+' min':Math.floor(m/60)+' hr '+Math.round(m%60)+' min';
const ICONS = {
 home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 truck:'<path d="M1 6h13v10H1zM14 10h4l4 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',chat:'<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
 pin:'<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',back:'<path d="M15 18l-6-6 6-6"/>',
 chev:'<path d="M9 18l6-6-6-6"/>',swap:'<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',
 send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',img:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
 check:'<path d="M20 6L9 17l-5-5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 gps:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',map:'<path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3zM8 3v15M16 6v15"/>',
 box:'<path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 gift:'<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
 doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',star:'<path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.500l1.600-7.200L2 9.600 9 9z"/>',
 edit:'<path d="M12 20h9M16.500 3.500a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z"/>',trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',plus2:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
 wallet:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4z"/>',
 leaf:'<path d="M11 20A7 7 0 0 1 9.800 6.100C15.500 5 17 4.500 19 2c1 2 2 4.200 2 8 0 5.500-4.800 10-10 10zM2 21c0-3 1.900-5.400 5.100-6C9.500 14.500 12 13 13 12"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',bag:'<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
 phone:'<path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.300 1.800.6 2.800.7a2 2 0 0 1 1.700 2z"/>'
};
const ic = (n,c='') => `<svg class="i ${c}" viewBox="0 0 24 24">${ICONS[n]||''}</svg>`;
let toastT;
function toast(msg,err){ const t=$('#toast'); t.textContent=msg; t.className='show'+(err?' err':''); clearTimeout(toastT); toastT=setTimeout(()=>t.className='',2600); }
function dropModalMap(){ if(mapModal&&map){ map.remove(); map=null; } mapModal=false; mapSheet=null; }
function openSheet(title,html,onOpen,onBack){
  dropModalMap(); const s=$('#sheet'); s.hidden=false;
  s.innerHTML=`<div class="box"><div class="hd">${onBack?`<button class="x" aria-label="Back" data-sback style="margin-right:10px">${ic('back','sm')}</button>`:''}<h2>${esc(title)}</h2><button class="x" aria-label="Close" data-close>${ic('x','sm')}</button></div>${html}</div>`;
  s.onclick=e=>{ if(e.target===s||e.target.closest('[data-close]')) closeSheet(); else if(e.target.closest('[data-sback]')) onBack(); };
  onOpen&&onOpen(s);
}
function closeSheet(){ bookingBusy=false; clearInterval(bookTimer); dropModalMap(); const s=$('#sheet'); s.hidden=true; s.innerHTML=''; }
const haversine=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dn=r(b.lng-a.lng);const h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h));};
// Validation: marks .fld with error and returns validity
function check(id,test,msg){ const el=$('#'+id); const f=el.closest('.fld'); const ok=test(el.value.trim()); f.classList.toggle('err',!ok); if(!ok){ let e=$('.em',f); if(!e){e=document.createElement('span');e.className='em';f.appendChild(e);} e.textContent=msg;} return ok; }
const fld=(id,label,val='',o={})=>`<div class="fld"><label for="${id}">${label}</label>${o.area?`<textarea id="${id}" placeholder="${o.ph||''}">${esc(val)}</textarea>`:`<input id="${id}" type="${o.type||'text'}" value="${esc(val)}" placeholder="${o.ph||''}" ${o.attr||''}>`}</div>`;

/* ---------- 3. STORE (LocalStorage) ---------- */
const KEY='agrigo_v1';
let DB;
function seedDB(){
  const now=Date.now();
  const products=SEED.map((s,i)=>({id:'p'+(i+1),name:s[0],cat:s[1],emoji:s[2],kw:s[3],price:s[4],unit:s[5],market:s[6],qty:s[7],seller:s[8],loc:s[9],lat:s[10],lng:s[11],desc:s[12],posted:now-(i%9)*864e5-i*36e5,status:s[7]<80?'Limited stock':'Available',cond:'Fresh',delivery:'both',phone:'0917 000 '+String(1000+i*37).slice(0,4),owner:'seed',images:[]}));
  return {products,
    chats:[
     {id:'c1',name:'Mang Berting Farm',pid:'p1',online:true,unread:1,msgs:[{f:'them',t:'Good day! Fresh na fresh po ang tomatoes namin today.',at:now-36e5}]},
     {id:'c2',name:'Benguet Highland Farmers',pid:'p7',online:false,unread:0,msgs:[{f:'me',t:'Hi, how much for 100 kg cabbage?',at:now-864e5},{f:'them',t:'₱48/kg po for 100 kg and above.',at:now-864e5+6e5}]}],
    bookings:[],notifs:[{id:1,t:'Welcome to AgriGO! 🌿',s:'Browse fresh produce and book delivery in minutes.',at:now,read:false},{id:2,t:'Promo: Free ₱50 off your first delivery',s:'Use code AGRI50 at checkout (sample promo).',at:now-36e5,read:false}],
    profile:{name:'John Harold',phone:'09123456789',email:'',avatar:'JH'},
    addresses:[{label:'Home',...HOME_ADDR}],points:120,ptsLog:[{t:'Welcome bonus',p:120,at:now}],
    wallet:{balance:0,tx:[]},prefs:{push:true,promo:true,order:true,loc:true,ads:false,twofa:false},lang:'English',code:'AGRI-JHN50',seq:100};
}
function load(){ try{DB=JSON.parse(localStorage.getItem(KEY)); }catch(e){DB=null;} if(!DB||!DB.products) DB=seedDB();
  DB.products.forEach(p=>{ if(p.owner==='seed'){ const z=SEED.find(x=>x[0]===p.name); if(z){ p.price=z[4]; p.market=z[6]; } } });
  if(DB.profile&&DB.profile.phone==='09617032973') DB.profile.phone='09123456789';
  DB.addresses=DB.addresses||[]; DB.addresses.forEach(a=>{ if(/^Mabalacat City, Pampanga/.test(a.addr||'')) Object.assign(a,HOME_ADDR); }); if(!DB.addresses.length) DB.addresses.push({label:'Home',...HOME_ADDR});
  DB.wallet=DB.wallet||{balance:0,tx:[]}; DB.pending=DB.pending||[]; DB.products.forEach(p=>{ if(p.initQty==null) p.initQty=p.qty; if(p.sold==null) p.sold=0; }); }
function save(){ try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){toast('Storage full – try smaller images',true);} }
const prod=id=>DB.products.find(p=>p.id===id);
// --- stock: "Low stock" when stock <= alert level (default 20% of initial stock); hidden from Home at 0 ---
const lowAt=p=>p.lowAt>0?p.lowAt:Math.max(1,Math.ceil((p.initQty||p.qty||1)*.2));
const stockState=p=>p.qty<=0?['out','Sold out']:p.qty<=lowAt(p)?['low',`Low stock · ${p.qty} left`]:['','Available'];
const listed=()=>DB.products.filter(p=>p.qty>0);
const initials=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const photo=(p,i=0)=> (p.images&&p.images[i]) || (i===0&&p.photo) || '';
function pushNotif(t,s){ DB.notifs.unshift({id:Date.now(),t,s,at:Date.now(),read:false}); save(); updNav(); }
// Product image with emoji fallback when the photo fails to load
const pimg=(p,i=0)=>!photo(p,i)?'':`<img src="${esc(photo(p,i))}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">`;

// Real product photos: Wikipedia lead images (CORS-enabled API), cached in LocalStorage on each product
const WIKI=[['Tomato'],['Red onion','Onion','Shallot'],['Onion','Allium cepa','Spring onion'],['Eggplant'],['Momordica charantia','Bitter melon'],['Okra','Abelmoschus esculentus'],['Cabbage'],['Carrot'],['Bok choy','Pak choi','Chinese cabbage'],['Sweet potato'],['White rice','Rice'],['Brown rice','Whole grain'],['Maize','Sweet corn','Corn on the cob'],['Mango'],['Banana','Cavendish banana'],['Watermelon'],['Pineapple'],['Chicken','Junglefowl'],['Egg as food','Chicken egg','Egg'],['Fertilizer','Compost','Manure']];
async function loadPhotos(){
  const todo=DB.products.filter(p=>/^p\d+$/.test(p.id)&&!p.photo); if(!todo.length) return;
  const titles=[...new Set(todo.flatMap(p=>WIKI[+p.id.slice(1)-1]||[]))], url={};
  for(let i=0;i<titles.length;i+=40){
    const part=titles.slice(i,i+40);
    try{
      const r=await fetch('https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=520&format=json&origin=*&titles='+encodeURIComponent(part.join('|')));
      const q=(await r.json()).query||{}, alias={};
      [...(q.normalized||[]),...(q.redirects||[])].forEach(x=>alias[x.from]=x.to);
      const byTitle={}; Object.values(q.pages||{}).forEach(pg=>{ if(pg.thumbnail) byTitle[pg.title]=pg.thumbnail.source; });
      part.forEach(t=>{ let c=t; for(let k=0;k<3&&alias[c];k++) c=alias[c]; if(byTitle[c]) url[t]=byTitle[c]; });
    }catch(e){ return; } // offline: leaf placeholder stays
  }
  const used=new Set();
  todo.forEach(p=>{ const c=(WIKI[+p.id.slice(1)-1]||[]).map(t=>url[t]).filter(Boolean); p.photo=c.find(u=>!used.has(u))||c[0]||''; if(p.photo) used.add(p.photo); });
  save(); if(cur.v==='home') drawGrid(); else if(cur.v==='detail') viewDetail();
}

/* ---------- 4. ROUTER & NAV ---------- */
const TAB = {home:'home',detail:'home',delivery:'delivery',track:'delivery',create:'create',chat:'chat',conv:'chat',settings:'settings',wallet:'settings',myprods:'settings',myprod:'settings'};
const NOTAB = ['conv']; // full-screen views without bottom nav
let layers=null, mapModal=false, mapSheet=null, routeTok=0;
let cur={v:'home',a:null}, hist=[], map=null, simT=null, B=null;
const S={q:'',cat:'All',region:'All',prov:'All'}; // home search state

function go(v,a=null,push=true){
  $('#view').onscroll=null;
  closeSheet(); clearInterval(simT); routeTok++; if(map){map.remove();map=null;}
  if(push) hist.push(cur);
  cur={v,a}; render(); $('#view').scrollTop=0; updNav();
}
function back(){ const p=hist.pop(); if(p) go(p.v,p.a,false); else go('home',null,false); }
function render(){
  const view=$('#view'); view.classList.toggle('nonav',NOTAB.includes(cur.v)); view.classList.toggle('homev',cur.v==='home'); $('#nav').classList.toggle('hide',NOTAB.includes(cur.v));
  ({home:viewHome,detail:viewDetail,delivery:viewDelivery,track:viewTrack,create:viewCreate,chat:viewChat,conv:viewConv,settings:viewSettings,wallet:viewWallet,myprods:viewMyProds,myprod:viewMyProd})[cur.v]();
}
const lastOf=b=>(b.mode==='pickup'?STATUS_PICK:STATUS_DEL).length-1;
const isActive=b=>!b.cancelled&&b.status<lastOf(b);
const waitText=r=>(r.mode==='pickup'?'Still waiting for the seller…':'Still waiting for the rider…')+' '+Math.floor((Date.now()-r.reqAt)/1000)+'s';
function updMini(){
  const pend=DB.pending, act=DB.bookings.filter(isActive), m=$('#mini'), showP=pend.length&&cur.v!=='conv', show=showP||(act.length&&!['conv','track'].includes(cur.v));
  $('#app').classList.toggle('hasmini',!!show); if(!show){ m.innerHTML=''; return; }
  if(showP){ const r=pend[0];
    m.innerHTML=`<span class="mi"><span class="ring"></span></span><div class="mt"><b>${r.mode==='pickup'?'Confirming with seller…':'Finding a rider…'}${pend.length>1?` +${pend.length-1} more`:''}</b><small>${waitText(r)}</small><div class="bar ind"><i></i></div></div>${ic('chev','sm')}`;
    m.onclick=openPendingSheet; return; }
  const b=act[0], st=(b.mode==='pickup'?STATUS_PICK:STATUS_DEL)[b.status];
  m.innerHTML=`<span class="mi">${ic(b.mode==='pickup'?'bag':'truck')}</span><div class="mt"><b>${esc(b.product.name)}${act.length>1?` +${act.length-1} more`:''}</b><small>${st}</small><div class="bar"><i style="width:${Math.max(8,(b.status+1)/(lastOf(b)+1)*100)}%"></i></div></div>${ic('chev','sm')}`;
  m.onclick=()=>{ if(act.length===1) return go('track',b.ref); openSheet('Active deliveries',act.map(bkRow).join(''),sh=>$$('[data-bk]',sh).forEach(r=>r.onclick=()=>go('track',r.dataset.bk))); };
}
function updNav(){ updMini();
  const unread=DB.chats.reduce((n,c)=>n+c.unread,0), tab=TAB[cur.v];
  const b=(id,icn,lbl)=>`<button class="${tab===id?'on':''}" data-go="${id}" aria-label="${lbl}"><span class="nb">${ic(icn)}${id==='chat'&&unread?`<span class="badge">${unread}</span>`:''}</span>${lbl}</button>`;
  $('#nav').innerHTML=b('home','home','Home')+b('delivery','truck','Delivery')+
   `<button class="plus ${tab==='create'?'on':''}" data-go="create" aria-label="Create post"><span class="fab">${ic('plus')}</span>Post</button>`+b('chat','chat','Chat')+b('settings','gear','Settings');
}
$('#nav').addEventListener('click',e=>{ const b=e.target.closest('[data-go]'); if(!b) return; const t=b.dataset.go; hist=[]; if(t==='create') cur.edit=null; if(t==='delivery'&&TAB[cur.v]!=='delivery') B=null; go(t); });
const backBtn=`<button class="back" data-back aria-label="Back">${ic('back')}</button>`;
document.addEventListener('click',e=>{ if(e.target.closest('[data-back]')) back(); });
const pageHead=(t,extra='')=>`<div class="pgtitle">${backBtn}<h1>${t}</h1>${extra}</div>`;

/* ---------- 5. HOME ---------- */
function viewHome(){
  const unread=DB.notifs.some(n=>!n.read);
  $('#view').innerHTML=`<div class="page home">
   <header class="hdr"><div class="pill"><svg class="wave" viewBox="0 0 200 60" preserveAspectRatio="none"><defs><linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="#a6d94a"/><stop offset="1" stop-color="#1f9d3a"/></linearGradient></defs><path d="M0 60C45 56 75 30 120 34S180 38 200 14V60Z" fill="url(#wg)"/></svg>
     <svg class="wleaf" viewBox="0 0 24 24">${ICONS.leaf}</svg><img class="hlogo" src="assets/logo.jpg" alt="AgriGO"><button class="bellc" id="bell" aria-label="Notifications">${ic('bell')}${unread?'<span class="dot"></span>':''}</button></div></header>
   <div class="hbod">
    <div class="stk" id="stk"><label class="search">${ic('search','sm')}<input id="q" type="search" placeholder="Search product, category or seller" value="${esc(S.q)}"></label><button class="ib sbell" id="bell2" aria-label="Notifications">${ic('bell')}${unread?'<span class="dot"></span>':''}</button></div>
    <div class="loc">${ic('pin','sm')}Delivering to <b>${esc(DB.addresses[0]?.addr.split(',').slice(0,2).join(','))}</b></div>
    <div class="locf"><div class="lc"><label for="rg"><span style="color:#e8456b">📍</span> Region</label><select id="rg"></select></div><div class="lc"><label for="pv">Province</label><select id="pv"></select></div></div>
    <div class="chips" id="cats">${CATS.map(c=>`<button class="chip ${S.cat===c?'on':''}" data-cat="${c}">${c}</button>`).join('')}</div>
    <div class="sec"><h3>${S.cat==='All'?'Fresh Listings':esc(S.cat)}</h3><small id="cnt"></small></div>
    <div class="grid" id="grid"></div></div></div>`;
  $('#bell').onclick=showNotifs; $('#bell2').onclick=showNotifs;
  $('#view').onscroll=()=>$('#stk')&&$('#stk').classList.toggle('stuck',$('#view').scrollTop>70); // pinned search bar gets a shadow when stuck
  $('#q').oninput=e=>{S.q=e.target.value;drawGrid();};
  $('#cats').onclick=e=>{const c=e.target.closest('[data-cat]'); if(!c)return; S.cat=c.dataset.cat; $$('#cats .chip').forEach(x=>x.classList.toggle('on',x===c)); $('.sec h3').textContent=S.cat==='All'?'Fresh Listings':S.cat; drawGrid();};
  $('#grid').onclick=e=>{const c=e.target.closest('[data-pid]'); if(c) go('detail',c.dataset.pid);};
  drawLocFilter(); drawGrid();
}
// Region → Province sort: choosing a region fills the province list with that region's provinces
function drawLocFilter(){
  const loc=listed().map(locOf);
  const rg=$('#rg'), pv=$('#pv');
  rg.innerHTML=`<option value="All">All Philippines (${listed().length})</option>`+PH_REGIONS.map(([r])=>`<option value="${esc(r)}" ${S.region===r?'selected':''}>${esc(r)} (${loc.filter(x=>x.r===r).length})</option>`).join('');
  const fillProv=()=>{ const provs=(PH_REGIONS.find(x=>x[0]===S.region)||[0,[]])[1];
    pv.disabled=S.region==='All';
    pv.innerHTML=S.region==='All'?'<option value="All">Select a region first</option>':`<option value="All">All provinces (${loc.filter(x=>x.r===S.region).length})</option>`+provs.map(n=>`<option value="${esc(n)}" ${S.prov===n?'selected':''}>${esc(n)} (${loc.filter(x=>x.pv===n).length})</option>`).join(''); };
  fillProv();
  rg.onchange=()=>{ S.region=rg.value; S.prov='All'; fillProv(); drawGrid(); };
  pv.onchange=()=>{ S.prov=pv.value; drawGrid(); };
}
function drawGrid(){
  const q=S.q.toLowerCase().trim();
  const list=listed().filter(p=>(S.cat==='All'||p.cat===S.cat)&&(S.region==='All'||(locOf(p).r===S.region&&(S.prov==='All'||locOf(p).pv===S.prov)))&&(!q||[p.name,p.cat,p.seller].some(x=>x.toLowerCase().includes(q)))).sort((a,b)=>{ const da=a.lat!=null?haversine(HOME_ADDR,a):Infinity, db=b.lat!=null?haversine(HOME_ADDR,b):Infinity; return da-db||b.posted-a.posted; });
  $('#cnt').textContent=`${list.length} of ${listed().length} listings`;
  $('#grid').innerHTML=list.length?list.map(p=>{
    const st=stockState(p);
    return `<button class="pc" data-pid="${p.id}"><div class="im">${ic('leaf','ph')}${pimg(p)}<span class="tag ${st[0]}">${st[1]}</span></div>
     <div class="bd"><h4>${esc(p.name)}</h4><div class="ds">${esc(p.desc)}</div><div class="price">${peso(p.price)} <small>/ ${esc(p.unit)}</small></div>
     <div class="meta">${ic('pin','sm')}<span>${esc(p.loc)}${p.lat!=null?` · ${haversine(HOME_ADDR,p).toFixed(0)} km`:''}</span></div></div></button>`;}).join('')
   :`<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div>No products match your search or selected location.</div>`;
}
function showNotifs(){
  const draw=()=>{ const box=$('#nlist'); if(!box) return;
    box.innerHTML=DB.notifs.length?DB.notifs.map(n=>`<div class="card nrow" style="${n.read?'opacity:.75':''}"><div style="flex:1;min-width:0"><b>${esc(n.t)}</b><div class="note" style="font-size:12.5px">${esc(n.s)}</div><div class="note">${ago(n.at)} · ${clock(n.at)}</div></div><button class="ndel" data-n="${n.id}" aria-label="Delete notification">${ic('trash','sm')}</button></div>`).join(''):'<div class="empty"><div class="big">🔔</div>No notifications</div>';
    $$('.ndel',box).forEach(b=>b.onclick=()=>{ DB.notifs=DB.notifs.filter(x=>String(x.id)!==b.dataset.n); save(); draw(); });
    const da=$('#ndall'); if(da) da.style.visibility=DB.notifs.length?'visible':'hidden'; };
  openSheet('Notifications',`<div style="display:flex;justify-content:flex-end;margin:-4px 0 8px"><button class="chip" id="ndall" type="button">${ic('trash','sm')} Delete all</button></div><div id="nlist"></div>`,()=>{
    draw(); $('#ndall').onclick=()=>{ if(!DB.notifs.length) return; if(confirm('Delete all notifications?')){ DB.notifs=[]; save(); draw(); toast('All notifications deleted'); } }; });
  DB.notifs.forEach(n=>n.read=true); save(); $$('.bellc .dot,.sbell .dot').forEach(x=>x.remove());
}

/* ---------- 6. PRODUCT DETAILS ---------- */
function viewDetail(){
  const p=prod(cur.a); if(!p) return go('home');
  const diff=p.price-p.market, pct=diff/p.market*100;
  const [cls,txt]=pct<=-3?['good','Below market price']:pct>=3?['high','Above market price']:['near','Near market price'];
  const mine=p.owner==='me', imgs=Math.max(1,p.images.length);
  $('#view').innerHTML=`<div class="page">${pageHead('Product Details')}
   <div class="pimg">${ic('leaf','ph')}${pimg(p)}${imgs>1?`<div class="gal">${p.images.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>`:''}</div>
   <div class="card" style="margin-top:-18px;position:relative;border-radius:20px 20px var(--r) var(--r)">
    <h2 style="font-size:20px">${esc(p.name)}</h2><div class="price" style="font-size:22px">${peso(p.price)} <small>per ${esc(p.unit)}</small></div>
    <p style="margin:8px 0;color:#37483d">${esc(p.desc)}</p><span class="badge ${p.qty<=0?'high':stockState(p)[0]==='low'?'near':'good'}">${stockState(p)[1]}</span></div>
   ${p.images.length>1?`<div class="imgs" style="margin-bottom:12px">${p.images.map((s,i)=>`<div class="th"><img src="${s}" alt=""></div>`).join('')}</div>`:''}
   <div class="card"><h3>Seller</h3><div class="seller"><div class="av on">${initials(p.seller)}</div><div><b>${esc(p.seller)}</b><div class="meta">${ic('pin','sm')}<span>${esc(p.loc)}</span></div><div class="meta">${ic('phone','sm')}<span>${esc(p.phone)}</span></div></div></div></div>
   <div class="card"><h3>Specifications</h3><dl class="spec"><dt>Category</dt><dd>${esc(p.cat)}</dd><dt>Available quantity</dt><dd>${p.qty} ${esc(p.unit)}</dd><dt>Condition</dt><dd>${esc(p.cond||'Fresh')}</dd><dt>Date posted</dt><dd>${dateStr(p.posted)}</dd><dt>Fulfilment</dt><dd>${{both:'Delivery & Pickup',delivery:'Delivery only',pickup:'Pickup only'}[p.delivery]}</dd>${p.minOrder?`<dt>Minimum order</dt><dd>${p.minOrder} ${esc(p.unit)}</dd>`:''}${p.bulk?`<dt>Bulk pricing</dt><dd>${esc(p.bulk)}</dd>`:''}</dl></div>
   <div class="card"><h3>Market Price Comparison</h3>
    <div class="cmp"><span>Seller's price</span><b>${peso(p.price)}/${esc(p.unit)}</b></div><div class="cmp"><span>Sample market reference</span><b>${peso(p.market)}/${esc(p.unit)}</b></div>
    <div class="cmp"><span>Difference</span><b>${diff>0?'+':''}${peso(diff)} (${pct>0?'+':''}${pct.toFixed(1)}%)</b></div><span class="badge ${cls}">${txt}</span>
    <p class="note">Reference prices are sample estimates for this prototype, not verified live market prices.</p></div>
   ${mine?`<div class="acts"><button class="btn out" id="ed">${ic('edit','sm')}Edit</button><button class="btn bad" id="del">${ic('trash','sm')}Delete</button></div>`:
   `<div class="sticky"><div class="acts"><button class="btn out" id="msg">${ic('chat','sm')}Message Seller</button><button class="btn" id="buy" ${p.qty<=0||p.delivery==='x'?'disabled':''}>${ic('truck','sm')}Buy / Arrange</button></div></div>`}</div>`;
  if(mine){ $('#ed').onclick=()=>{cur.edit=p.id;go('create',p.id);}; $('#del').onclick=()=>{ if(confirm('Delete this listing?')){DB.products=DB.products.filter(x=>x.id!==p.id);save();toast('Listing deleted');go('home');}}; return; }
  $('#msg').onclick=()=>{ openChatWith(p); };
  $('#buy').onclick=()=>chooseMethod(p);
}
// Delivery method selection page (sheet) after Buy / Arrange Delivery
function chooseMethod(p){
  const canD=p.delivery!=='pickup', canP=p.delivery!=='delivery';
  openSheet('How would you like to receive it?',`
   <div class="card"><div class="fld"><label for="bq">Quantity (${esc(p.unit)})</label><input id="bq" type="number" min="1" max="${p.qty}" value="${Math.min(p.minOrder||1,p.qty)}" inputmode="decimal"><span class="em"></span></div></div>
   <button class="svc" id="m1" ${canD?'':'disabled style="opacity:.4"'}><span class="ic">🚚</span><div class="t"><b>Delivery</b><small>${canD?'Book an AgriGO vehicle to your address':'Seller does not offer delivery'}</small></div>${ic('chev')}</button>
   <button class="svc" id="m2" ${canP?'':'disabled style="opacity:.4"'}><span class="ic">🧺</span><div class="t"><b>Pickup</b><small>${canP?'Collect from the seller yourself':'Seller does not offer pickup'}</small></div>${ic('chev')}</button>`,()=>{
   const start=mode=>{ const q=parseFloat($('#bq').value);
     if(!check('bq',v=>q>0&&q<=p.qty&&q>=(p.minOrder||0),`Enter between ${p.minOrder||1} and ${p.qty} ${p.unit}`)) return;
     newBooking(p,q,mode); go('delivery'); };
   $('#m1').onclick=()=>start('delivery'); $('#m2').onclick=()=>start('pickup');
  });
}
function newBooking(p,q,mode){
  B={product:p?{id:p.id,name:p.name,unit:p.unit,price:p.price,seller:p.seller,phone:p.phone}:{id:null,name:'Custom parcel',unit:'kg',price:0,seller:'—',phone:''},qty:q||1,mode,
   pickup:p?{addr:p.loc,lat:p.lat,lng:p.lng}:null,dest:{...HOME_ADDR},stops:[],vehicle:null,service:'regular',when:'',dist:null,mins:null,coords:null,routeOk:null};
}
// Rough weight estimate (kg) used only to flag vehicles that are too small
function weightKg(){ const u=B.product.unit,q=B.qty; return u==='kg'?q:u==='sack'?q*50:u==='bundle'?q*.5:u==='piece'?q*(/Chicken|Pineapple/.test(B.product.name)?1.2:.3):q; }

/* ---------- 7. DELIVERY BOOKING (Lalamove-inspired workflow, AgriGO branding) ---------- */
// CARTO tiles (based on OpenStreetMap data) – OSM's own tile server blocks pages opened from file://
// Esri World Street Map tiles: free, no API key, and they load when the page is opened from a file (OSM's own server blocks that)
const tiles=()=>L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri — Source: Esri, HERE, Garmin, OpenStreetMap contributors'});
const pinIcon=(col,lbl)=>L.divIcon({className:'',html:`<div class="pk" style="background:${col}"><b>${lbl}</b></div>`,iconSize:[30,30],iconAnchor:[15,30]});

const ptKeys=()=>['pickup',...B.stops.map((_,i)=>'s'+i),'dest'];
const getPt=k=>k==='pickup'?B.pickup:k==='dest'?B.dest:B.stops[+k.slice(1)];
function setPt(k,pt){ if(k==='pickup')B.pickup=pt; else if(k==='dest')B.dest=pt; else B.stops[+k.slice(1)]=pt; }
const keyName=k=>k==='pickup'?'Pickup location':k==='dest'?'Destination':'Extra stop';

// Geocoding: Photon (CORS-friendly, works from file://) with Nominatim as fallback
const fmtAddr=p=>[...new Set([p.name,[p.housenumber,p.street].filter(Boolean).join(' '),p.district||p.suburb,p.city||p.county,p.state].filter(Boolean))].join(', ');
async function geocode(q){
  try{ const j=await (await fetch('https://photon.komoot.io/api/?limit=6&lang=en&lat=15.2&lon=120.6&bbox=116.9,4.5,126.7,21.2&q='+encodeURIComponent(q))).json();
    const r=(j.features||[]).filter(f=>!f.properties.countrycode||f.properties.countrycode==='PH').map(f=>({addr:fmtAddr(f.properties),lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0]}));
    if(r.length) return r; }catch(e){}
  const j=await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ph&q='+encodeURIComponent(q))).json();
  return j.map(x=>({addr:x.display_name,lat:+x.lat,lng:+x.lon}));
}
async function reverse(lat,lng){
  try{ const j=await (await fetch(`https://photon.komoot.io/reverse?lang=en&lat=${lat}&lon=${lng}`)).json(); const f=j.features&&j.features[0]; if(f){ const a=fmtAddr(f.properties); if(a) return a; } }catch(e){}
  try{ const j=await (await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)).json(); if(j.display_name) return j.display_name; }catch(e){}
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/* Pickup: ways to collect a listed product (no delivery fee, no fare calculation) */
const PK_METHODS=[['self','🧍','Self pickup','Come to the seller and collect it yourself'],['vehicle','🚐','Own vehicle','Bring your own tricycle, van or truck'],['rep','🪪','Authorized representative','Someone you trust collects it for you'],['meetup','🤝','Meet-up point','Meet the seller at a nearby market or drop point']];
const pkMethod=()=>PK_METHODS.find(m=>m[0]===(B.pkm||'self'));
// Real road distance from my location (AUF) to the seller, via OSRM; falls back to a clearly-labelled straight-line figure
async function pkDistance(){
  const el=$('#pkdist'); if(!el||B.pickup?.lat==null) return; const a=HOME_ADDR, b=B.pickup, tok=B.product.id;
  el.textContent='Calculating distance from AUF…';
  try{ const ctl=new AbortController(), to=setTimeout(()=>ctl.abort(),9000);
    const j=await (await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`,{signal:ctl.signal})).json(); clearTimeout(to);
    if(j.code!=='Ok') throw 0; if(B?.product.id!==tok||!$('#pkdist')) return;
    el.innerHTML=`🚗 <b>${(j.routes[0].distance/1000).toFixed(1)} km</b> by road from AUF · about ${dur(Math.max(5,j.routes[0].duration/60))}`;
  }catch(e){ if(B?.product.id!==tok||!$('#pkdist')) return; el.innerHTML=`📏 About <b>${haversine(a,b).toFixed(1)} km</b> straight-line from AUF (road distance unavailable offline)`; }
}
const pickable=()=>DB.products.filter(p=>p.qty>0&&p.delivery!=='delivery'&&p.owner!=='me'); // your own listings are never offered for pickup
function drawPkTotal(){ const el=$('#pktot'); if(!el) return; el.innerHTML=`<div><span>Product Costing</span><span>${peso(B.product.price*(B.qty||0))}</span></div><div class="sv-tot"><span>Total</span><b>${peso(B.product.price*(B.qty||0))}</b></div><p class="note" style="margin:8px 0 0">Pickup is free – no delivery fee is added.</p>`; }
function drawPkItems(){
  const q=($('#pkq')?.value||'').toLowerCase().trim(), list=pickable().filter(p=>!q||[p.name,p.cat,p.seller,p.loc].some(x=>(x||'').toLowerCase().includes(q)));
  $('#pklist').innerHTML=list.length?list.map(p=>{ const st=stockState(p);
   return `<button class="pki" data-id="${p.id}"><div class="th">${ic('leaf','ph')}${pimg(p)}</div><div class="in"><b>${esc(p.name)}</b><span class="pr">${peso(p.price)} <small>/ ${esc(p.unit)}</small></span><span class="mt">${p.qty} ${esc(p.unit)} available${st[0]==='low'?' · low stock':''}</span><span class="mt">${ic('pin','sm')} ${esc(p.loc)}${p.lat!=null?` · ${haversine(HOME_ADDR,p).toFixed(1)} km away`:''}</span></div>${ic('chev','sm')}</button>`; }).join(''):'<div class="empty"><div class="big">🔍</div>No products available for pickup.</div>';
  $$('#pklist .pki').forEach(b=>b.onclick=()=>{ const p=prod(b.dataset.id); newBooking(p,Math.min(p.minOrder||1,p.qty),'pickup'); viewDelivery(); });
}
function drawPkMethods(){
  $('#pkms').innerHTML=PK_METHODS.map(m=>`<button class="svc ${(B.pkm||'self')===m[0]?'on':''}" data-m="${m[0]}"><span class="ic">${m[1]}</span><div class="t"><b>${m[2]}</b><small>${m[3]}</small></div><span class="radio"></span></button>`).join('');
  $$('#pkms .svc').forEach(b=>b.onclick=()=>{ B.pkm=b.dataset.m; drawPkMethods(); });
  const rep=B.pkm==='rep'; $('#pkrep').innerHTML=rep?`<div class="card" style="margin:8px 0 0">${fld('rn','Representative name *',B.rep?.name||'')}${fld('rp','Representative phone *',B.rep?.phone||'',{type:'tel',ph:'09XX XXX XXXX'})}</div>`:'';
  if(rep){ $('#rn').oninput=e=>{B.rep={...B.rep,name:e.target.value};}; $('#rp').oninput=e=>{B.rep={...B.rep,phone:e.target.value};}; }
}
function viewDelivery(){
  if(!B) newBooking(null,1,'delivery');
  const pk=B.mode==='pickup';
  if(pk&&B.product.id&&(prod(B.product.id)?.delivery==='delivery'||prod(B.product.id)?.owner==='me')) newBooking(null,1,'pickup');
  if(!pk&&B.product.id&&prod(B.product.id)?.delivery==='pickup') newBooking(null,1,'delivery');
  const custom=!B.product.id, P=B.product.id&&prod(B.product.id);
  const seg=B.product.id?'':`<div class="seg"><button data-m="delivery" class="${pk?'':'on'}">${ic('truck','sm')}Delivery</button><button data-m="pickup" class="${pk?'on':''}">${ic('bag','sm')}Pickup</button></div>`;
  const wire=()=>$$('.seg button').forEach(b=>b.onclick=()=>{ const m=b.dataset.m; if(m===B.mode) return; if(m==='pickup'&&B.product.id&&(prod(B.product.id)?.delivery==='delivery'||prod(B.product.id)?.owner==='me')) newBooking(null,1,'pickup'); B.mode=m; viewDelivery(); });
  if(pk){
    if(custom){
      $('#view').innerHTML=`<div class="page">${pageHead('Arrange Pickup')}${seg}
       <div class="card"><h3>Choose a product to pick up</h3><p class="note" style="margin:-4px 0 10px">Products on the listing that the seller allows you to collect.</p><label class="search" style="margin:0 0 10px">${ic('search','sm')}<input id="pkq" type="search" placeholder="Search product, seller or place"></label><div id="pklist" class="pklist"></div></div></div>`;
      wire(); $('#pkq').oninput=drawPkItems; drawPkItems(); return;
    }
    if(!B.pkm) B.pkm='self';
    $('#view').innerHTML=`<div class="page">${pageHead('Arrange Pickup')}${seg}
     <div class="card"><div class="seller"><div class="av">${P&&photo(P)?`<img src="${esc(photo(P))}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`:ic('box')}</div><div style="flex:1;min-width:0"><b>${esc(B.product.name)}</b><div class="meta"><span>${peso(B.product.price)} / ${esc(B.product.unit)}${stockOf()!=null?' · '+stockOf()+' available':''}</span></div></div><button class="chip" id="chg">Change</button></div>
      <div class="fld" style="margin:12px 0 0"><label for="qin">Quantity (${esc(B.product.unit)})</label><div class="stp"><button type="button" id="qm" aria-label="Decrease">−</button><input id="qin" type="number" inputmode="decimal" min="${minQty()}" ${stockOf()!=null?`max="${stockOf()}"`:''} value="${B.qty}"><button type="button" id="qp" aria-label="Increase">+</button></div><span class="em"></span></div>
      <div class="note" id="qsub"></div></div>
     <div class="card"><h3>Pickup location</h3><div class="pkloc"><span class="pin"></span><div style="flex:1;min-width:0"><b>${esc(B.product.seller)}</b><div class="note" style="margin:2px 0 0">${esc(B.pickup.addr)}</div>${B.product.phone?`<div class="note" style="margin:2px 0 0">📞 ${esc(B.product.phone)}</div>`:''}<div class="note" id="pkdist" style="margin:6px 0 0"></div></div>${B.pickup.lat!=null?`<a class="chip" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${B.pickup.lat},${B.pickup.lng}">${ic('map','sm')}Directions</a>`:''}</div></div>
     <div class="card"><h3>How will you pick it up?</h3><div id="pkms"></div><div id="pkrep"></div></div>
     <div class="card sv-rcpt" id="pktot" style="margin-bottom:12px"></div>
     <div class="sticky"><button class="btn" id="pkgo">Continue ${ic('chev','sm')}</button></div></div>`;
    wire(); setupQty(); drawPkMethods(); drawPkTotal(); pkDistance();
    $('#chg').onclick=()=>{ newBooking(null,1,'pickup'); viewDelivery(); };
    $('#pkgo').onclick=()=>{ if(!(B.qty>0)) return toast('Enter a valid quantity',true);
      if(B.pkm==='rep'){ const n=(B.rep?.name||'').trim(), ph=(B.rep?.phone||'').replace(/[\s-]/g,''); if(n.length<2) return toast("Enter your representative's name",true); if(!/^(\+?63|0)9\d{9}$/.test(ph)) return toast("Enter a valid representative mobile number",true); }
      openPaySheet(); };
    return;
  }
  $('#view').innerHTML=`<div class="page">${pageHead('Book a Delivery')}${seg}
   <div class="card"><div class="addr" id="addrs"></div><div id="sugg"></div>
     <div class="tools"><button class="chip" id="gps">${ic('gps','sm')}Current location</button><button class="chip" id="addstop">${ic('plus2','sm')}Add stop</button></div></div>
   ${custom?`<div class="card"><h3>What are you sending?</h3><div class="two">${fld('cn','Item',B.product.name==='Custom parcel'?'Farm produce':B.product.name)}${fld('cw','Weight (kg)',B.qty||50,{type:'number',attr:'min="1" inputmode="decimal"'})}</div></div>`:
    `<div class="card"><div class="seller"><div class="av">${ic('box')}</div><div style="flex:1"><b>${esc(B.product.name)}</b><div class="meta"><span>${peso(B.product.price)} / ${esc(B.product.unit)}${stockOf()!=null?' · '+stockOf()+' in stock':''}</span></div></div></div>
      <div class="fld" style="margin:12px 0 0"><label for="qin">Quantity (${esc(B.product.unit)})</label><div class="stp"><button type="button" id="qm" aria-label="Decrease">−</button><input id="qin" type="number" inputmode="decimal" min="${minQty()}" ${stockOf()!=null?`max="${stockOf()}"`:''} value="${B.qty}"><button type="button" id="qp" aria-label="Increase">+</button></div><span class="em"></span></div>
      <div class="note" id="qsub"></div></div>`}
   <div id="rinfo"></div>
   <div class="sec"><h3>Available vehicles</h3><small>Smallest → largest</small></div><div class="vgrid" id="vehs"></div><p class="note" style="margin-top:10px">Tap a vehicle to choose a delivery service. Fares use sample prototype rates, not actual operating rates.</p></div>`;
  wire();
  if(custom){ if(!B.ci){B.qty=50;B.ci=1;} $('#cw').oninput=()=>{B.qty=parseFloat($('#cw').value)||0;drawVehicles();}; $('#cn').oninput=e=>B.product.name=e.target.value||'Custom parcel'; B.product.name=$('#cn').value||'Custom parcel'; }
  if(!custom) setupQty();
  drawAddrs(); $('#gps').onclick=useGps;
  $('#addstop').onclick=()=>{ if(B.stops.length>=3) return toast('Maximum of 3 extra stops',true); B.stops.push({addr:'',lat:null,lng:null}); drawAddrs(); };
  drawVehicles(); drawRInfo(); if(B.dist==null) calcRoute();
}
// --- editable product quantity on the booking page ---
const stockOf=()=>{ const p=B.product.id&&prod(B.product.id); return p?p.qty:null; };
const minQty=()=>{ const p=B.product.id&&prod(B.product.id); return (p&&p.minOrder)||1; };
function qtyNote(){ const el=$('#qsub'); if(!el) return; if(B.mode==='pickup'){ el.textContent=''; drawPkTotal(); return; } el.textContent=B.qty>0?`Product Costing ${peso(B.product.price*B.qty)} · est. load ≈ ${Math.round(weightKg()*10)/10} kg`:''; drawPkTotal(); }
function setupQty(){
  const inp=$('#qin'), f=inp.closest('.fld'), max=stockOf()??Infinity, min=minQty();
  const apply=(v,final)=>{
    let msg='';
    if(!(v>0)) msg='Enter a quantity greater than 0';
    else if(v<min) msg=`Minimum order is ${min} ${B.product.unit}`;
    else if(v>max) msg=`Only ${max} ${B.product.unit} available`;
    f.classList.toggle('err',!!msg); let e=$('.em',f); e.textContent=msg;
    if(msg){ B.qty=0; if(final){ v=Math.min(max,Math.max(min,v||min)); inp.value=v; B.qty=v; f.classList.remove('err'); } }
    else B.qty=v;
    qtyNote(); drawVehicles();
  };
  inp.oninput=()=>apply(parseFloat(inp.value),false);
  inp.onblur=()=>apply(parseFloat(inp.value),true);
  const bump=d=>{ const v=Math.round(((parseFloat(inp.value)||B.qty||min)+d)*100)/100; inp.value=Math.min(max,Math.max(min,v)); apply(parseFloat(inp.value),true); };
  $('#qm').onclick=()=>bump(-1); $('#qp').onclick=()=>bump(1); qtyNote();
}
function drawAddrs(){
  const pk=B.mode==='pickup', keys=pk?['pickup']:ptKeys();
  $('#addrs').innerHTML=keys.map(k=>{ const p=getPt(k), cls=k==='pickup'?'':k==='dest'?'d':'s';
   return `<div class="arow ${cls}"><span class="pin"></span><input data-k="${k}" value="${esc(p?.addr||'')}" placeholder="${k==='pickup'?(pk?'Seller pickup location':'Pickup location'):k==='dest'?'Where to?':'Extra stop'}" enterkeyhint="search" aria-label="${keyName(k)}">
    <button class="mini" data-s="${k}" aria-label="Search location">${ic('search','sm')}</button><button class="mini" data-mp="${k}" aria-label="Pick on map">${ic('map','sm')}</button>
    ${k==='pickup'&&!pk?`<button class="mini" id="swap" aria-label="Swap">${ic('swap','sm')}</button>`:''}${k[0]==='s'?`<button class="mini" data-r="${k}" aria-label="Remove stop">${ic('x','sm')}</button>`:''}</div>`;}).join('');
  $$('#addrs input').forEach(i=>i.onkeydown=e=>{ if(e.key==='Enter') searchPlace(i.dataset.k,i.value); });
  $$('#addrs [data-s]').forEach(b=>b.onclick=()=>searchPlace(b.dataset.s,$(`#addrs input[data-k="${b.dataset.s}"]`).value));
  $$('#addrs [data-mp]').forEach(b=>b.onclick=()=>openMapSheet(b.dataset.mp));
  $$('#addrs [data-r]').forEach(b=>b.onclick=()=>{B.stops.splice(+b.dataset.r.slice(1),1);drawAddrs();calcRoute();});
  const sw=$('#swap'); if(sw) sw.onclick=()=>{ [B.pickup,B.dest]=[B.dest,B.pickup]; drawAddrs(); calcRoute(); };
}
async function searchPlace(k,q){
  q=q.trim(); if(q.length<3) return toast('Type at least 3 characters to search',true);
  $('#sugg').innerHTML='<div class="sugg"><button disabled>Searching…</button></div>';
  try{
    const j=await geocode(q);
    $('#sugg').innerHTML=j.length?`<div class="sugg">${j.map((x,i)=>`<button data-i="${i}">${ic('pin','sm')} ${esc(x.addr)}</button>`).join('')}</div>`:'<div class="warnbox">No matching places found. Try a barangay or city name, or use the map button to pick a spot.</div>';
    $$('#sugg [data-i]').forEach(b=>b.onclick=()=>{ $('#sugg').innerHTML=''; openMapSheet(k,j[+b.dataset.i]); });
  }catch(e){ $('#sugg').innerHTML='<div class="warnbox">Location search is unavailable (check your internet connection). Use the map button to pick a location instead.</div>'; }
}
function useGps(){
  if(!navigator.geolocation) return toast('Geolocation is not supported on this device',true);
  toast('Finding your location…');
  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude:lat,longitude:lng}=pos.coords; openMapSheet(B.mode==='pickup'?'pickup':'dest',{addr:await reverse(lat,lng),lat,lng});
  },()=>toast('Location permission denied or unavailable',true),{enableHighAccuracy:true,timeout:10000});
}
// Map pop-up: appears only when a place is searched or "pick on map" is tapped
function openMapSheet(key,pt){
  const cur0=getPt(key), start=pt||(cur0&&cur0.lat!=null?{...cur0}:{addr:'',lat:HOME_ADDR.lat,lng:HOME_ADDR.lng});
  openSheet(keyName(key),`<div class="map" id="map" style="height:300px"></div><div class="card" id="mtxt" style="padding:10px 12px"></div>
    <p class="note" style="margin:-4px 0 10px">Tap the map or drag the pin to adjust the exact spot.</p><button class="btn" id="mok">Confirm location</button>`,()=>{
    mapSheet={key,pt:{...start}}; mapModal=true; map=L.map('map').setView([start.lat,start.lng],pt||cur0?16:12); tiles().addTo(map); layers=L.layerGroup().addTo(map);
    ptKeys().filter(k=>k!==key&&getPt(k)?.lat!=null).forEach(k=>L.marker([getPt(k).lat,getPt(k).lng],{icon:pinIcon(k==='pickup'?'#2a9d34':k==='dest'?'#065f3c':'#e8a317',k==='pickup'?'A':k==='dest'?'B':'•')}).addTo(layers));
    const lbl=key==='pickup'?'A':key==='dest'?'B':'•', col=key==='pickup'?'#2a9d34':key==='dest'?'#065f3c':'#e8a317';
    const m=L.marker([start.lat,start.lng],{icon:pinIcon(col,lbl),draggable:true}).addTo(map);
    const txt=()=>$('#mtxt')&&($('#mtxt').innerHTML=`<div class="meta" style="font-size:13px;color:var(--ink)">${ic('pin','sm')}<span style="white-space:normal">${esc(mapSheet.pt.addr||'Locating…')}</span></div>`);
    const upd=async ll=>{ m.setLatLng(ll); const mine=mapSheet; mine.pt={addr:'Locating…',lat:ll.lat,lng:ll.lng}; txt(); const a=await reverse(ll.lat,ll.lng); if(mapSheet===mine){ mine.pt.addr=a; txt(); } };
    map.on('click',e=>upd(e.latlng)); m.on('dragend',()=>upd(m.getLatLng())); txt(); if(!start.addr) upd({lat:start.lat,lng:start.lng});
    $('#mok').onclick=()=>{ const p=mapSheet.pt; if(!p.addr||p.addr==='Locating…') return toast('Still locating – try again in a second',true); const k=mapSheet.key; closeSheet(); setPt(k,{...p}); drawAddrs(); calcRoute(); toast('Location set'); };
    setTimeout(()=>map&&map.invalidateSize(),250);
  });
}
// Route via OSRM public demo server (no map needed); falls back to a labelled straight-line estimate
async function calcRoute(){
  B.dist=null;B.mins=null;B.coords=null;B.routeOk=null; if(B.mode==='pickup') return;
  const pts=ptKeys().map(getPt);
  if(pts.some(p=>!p||p.lat==null)){ drawRInfo(); drawVehicles(); return; }
  const tok=++routeTok; $('#rinfo').innerHTML='<div class="card" style="text-align:center">Calculating route…</div>';
  try{
    const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),9000);
    const r=await fetch(`https://router.project-osrm.org/route/v1/driving/${pts.map(p=>p.lng+','+p.lat).join(';')}?overview=full&geometries=geojson`,{signal:ctl.signal}); clearTimeout(to);
    const j=await r.json(); if(j.code!=='Ok') throw new Error('no route'); const rt=j.routes[0];
    if(tok!==routeTok) return;
    B.dist=rt.distance/1000; B.mins=Math.max(5,rt.duration/60); B.routeOk=true; B.coords=rt.geometry.coordinates.map(c=>[c[1],c[0]]);
  }catch(e){
    if(tok!==routeTok) return;
    let d=0; for(let i=1;i<pts.length;i++) d+=haversine(pts[i-1],pts[i]); d*=1.3;
    B.dist=d; B.mins=Math.max(5,d/30*60); B.routeOk=false; B.coords=pts.map(p=>[p.lat,p.lng]);
  }
  if(cur.v!=='delivery') return; drawRInfo(); drawVehicles();
}
function drawRInfo(){
  const el=$('#rinfo'); if(!el) return;
  if(B.dist==null){ el.innerHTML=B.mode==='pickup'?'':'<div class="warnbox">📍 Search or pick both a pickup and a destination to see distance and delivery fees.</div>'; return; }
  el.innerHTML=(B.routeOk?'':'<div class="warnbox">Live routing is unavailable right now. Showing a rough straight-line estimate (not a verified route); fares are indicative only.</div>')+
   `<div class="rinfo"><div><b>${B.dist.toFixed(1)} km</b><span>${B.routeOk?'Route distance':'Approx. distance'}</span></div><div><b>${dur(B.mins)}</b><span>Est. travel time</span></div></div>`;
}
// --- dynamic pricing: (base + perKm × distance) × service multiplier + stop fees (sample rates) ---
const svcOf=id=>SERVICES.find(s=>s.id===id);
function fare(v,sid){ if(B.dist==null) return null; return Math.round(((v.base+v.km*B.dist)*svcOf(sid).mult+B.stops.length*STOP_FEE)/5)*5; }
function eta(v,sid){ const s=svcOf(sid); return B.mins*v.eta*s.eta+(sid==='pooling'?20:0); }
function vehProblem(v){ if(weightKg()>v.cap) return 'Too heavy for this vehicle'; if(v.maxKm&&B.dist!=null&&B.dist>v.maxKm) return `Short trips only (≤${v.maxKm} km)`; return ''; }
// Vehicles in a 2-column grid, ordered smallest → largest load
function drawVehicles(){
  const el=$('#vehs'); if(!el) return;
  el.innerHTML=VEHICLES.map(v=>{ const f=fare(v,'regular'), pr=vehProblem(v);
   return `<button class="v2 ${pr?'dis':''}" data-v="${v.id}"><img src="assets/${v.id}.jpg" alt="${esc(v.name)}" loading="lazy"><b>${esc(v.name.replace('AgriGO ',''))}</b><span class="cap">Up to ${v.cap.toLocaleString()} kg</span><span class="fr">${pr?`<em>${pr}</em>`:f!=null?'≈ '+peso(f):'from '+peso(v.base)}</span></button>`;}).join('');
  $$('#vehs .v2').forEach(b=>b.onclick=()=>pickVehicle(b.dataset.v));
}
function pickVehicle(id){
  const v=VEHICLES.find(x=>x.id===id);
  if(!B.pickup?.lat||!B.dest?.lat||B.stops.some(s=>s.lat==null)){ $('#view').scrollTo({top:0}); return toast('Set the pickup and destination first',true); }
  if(!(B.qty>0)) return toast('Enter a valid weight',true);
  if(B.dist==null) return toast('Route is still loading – try again in a moment',true);
  const pr=vehProblem(v); if(pr) return toast(pr,true);
  openServiceSheet(id);
}
const localISO=t=>{const d=new Date(t-new Date().getTimezoneOffset()*6e4);return d.toISOString().slice(0,16);};
// Pop-up 1: delivery service + price
function openServiceSheet(id){
  B.vehicle=id; const v=VEHICLES.find(x=>x.id===id);
  openSheet('Delivery service',`<div class="card seller"><img src="assets/${v.id}.jpg" alt="" style="width:92px;height:62px;object-fit:contain"><div><b>${esc(v.name)}</b><div class="meta"><span>Up to ${v.cap.toLocaleString()} kg · ${B.dist.toFixed(1)} km · ${dur(B.mins*v.eta)}</span></div></div></div>
   <div id="svcs"></div><div id="later"></div><p class="note" style="margin-bottom:12px">Estimated fares based on sample pricing for this prototype.</p><button class="btn" id="svgo">Proceed ${ic('chev','sm')}</button>`,()=>{
    drawServices();
    $('#svgo').onclick=()=>{ if(B.service==='later'&&(!B.when||new Date(B.when)<new Date())) return toast('Pick a future date & time to schedule',true); openPaySheet(); };
  });
}
function drawServices(){
  const v=VEHICLES.find(x=>x.id===B.vehicle);
  $('#svcs').innerHTML=SERVICES.map(s=>`<button class="svc ${B.service===s.id?'on':''}" data-s="${s.id}"><span class="ic">${s.ic}</span><div class="t"><b>${s.name}</b><small>${s.desc}</small><small>ETA ${dur(eta(v,s.id))} · ${s.wait}</small></div><div class="pr">${peso(fare(v,s.id))}</div></button>`).join('');
  $$('#svcs .svc').forEach(b=>b.onclick=()=>{ B.service=b.dataset.s; drawServices(); });
  $('#later').innerHTML=B.service==='later'?`<div class="card">${fld('lt','Schedule date & time',B.when)}</div>`:'';
  const lt=$('#lt'); if(lt){ lt.type='datetime-local'; lt.value=B.when||''; lt.min=localISO(Date.now()+36e5); lt.onchange=()=>{B.when=lt.value;}; }
}
function totals(){
  const v=VEHICLES.find(x=>x.id===B.vehicle), pk=B.mode==='pickup';
  const fee=pk?0:(v&&B.dist!=null?fare(v,B.service):null), sub=B.product.price*B.qty;
  return {v,fee,sub,total:fee==null?null:fee+sub};
}

/* ---------- 8. PAYMENT & LOCATION → SUMMARY → CONFIRM (pop-ups) ---------- */
const PAYS=[['cod','COD','Cash on Delivery','Pay the driver or seller in cash','#2a9d34'],['gcash','<img src="assets/pay-gcash.png" alt="GCash">','GCash','Pay via GCash (simulated)','transparent'],['maya','<img src="assets/pay-maya.png" alt="Maya">','Maya','Pay via Maya (simulated)','transparent'],['bank','<img src="assets/pay-bank.png" alt="Bank Transfer">','Bank Transfer','Transfer to AgriGO account (simulated)','transparent']];
// Pop-up 2: customer info, locations, payment method
function openPaySheet(){
  const pk=B.mode==='pickup', f=B.form||{}, P=DB.profile; let payKey=f.payKey||'cod';
  openSheet('Payment & Location',`
   <div class="card"><h3>Customer information</h3>${fld('fn','Full name *',f.name??P.name)}${fld('ph','Phone number *',f.phone??P.phone,{type:'tel',ph:'09XX XXX XXXX'})}${fld('em','Email (optional)',f.email??P.email,{type:'email'})}</div>
   <div class="card"><h3>${pk?'Pickup':'Delivery'} information</h3>${fld('pa','Complete pickup address *',f.pa??B.pickup.addr,{area:1})}${pk?'':fld('da','Complete destination address *',f.da??B.dest.addr,{area:1})}
     ${fld('ins','Additional instructions',f.ins||'',{area:1,ph:'Gate color, landmarks, who to call…'})}
     <div class="fld"><label for="dt">${pk?'Pickup date & time *':B.service==='later'?'Scheduled date & time *':'Preferred date & time (optional)'}</label><input id="dt" type="datetime-local" value="${esc(f.dt??B.when??'')}"></div></div>
   <div class="card"><h3>Payment method</h3><div id="pays"></div><p class="note">Prototype only – no real payment is processed.</p></div>
   <button class="btn" id="pygo">Proceed ${ic('chev','sm')}</button>`,()=>{
    $('#dt').min=localISO(Date.now());
    const draw=()=>{ $('#pays').innerHTML=PAYS.map(p=>`<button class="pay ${payKey===p[0]?'on':''}" data-p="${p[0]}"><span class="lg" style="background:${p[4]}">${p[1]}</span><div style="flex:1"><b>${p[2]}</b><div class="note" style="margin:0">${p[3]}</div></div><span class="radio"></span></button>`).join(''); $$('#pays .pay').forEach(b=>b.onclick=()=>{payKey=b.dataset.p;draw();}); }; draw();
    $('#pygo').onclick=()=>{
      const need=pk||B.service==='later';
      const ok=[check('fn',v=>v.length>=2,'Enter your full name'),check('ph',v=>/^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g,'')),'Enter a valid PH mobile number (e.g. 09171234567)'),
        check('em',v=>!v||/^\S+@\S+\.\S+$/.test(v),'Enter a valid email'),check('pa',v=>v.length>=5,'Enter the pickup address'),
        pk||check('da',v=>v.length>=5,'Enter the destination address'),check('dt',v=>need?(v&&new Date(v)>new Date(Date.now()-6e4)):true,'Choose a valid future date & time')].every(Boolean);
      if(!ok) return toast('Please fix the highlighted fields',true);
      B.form={name:$('#fn').value.trim(),phone:$('#ph').value.trim(),email:$('#em').value.trim(),pa:$('#pa').value.trim(),da:pk?'':$('#da').value.trim(),ins:$('#ins').value.trim(),dt:$('#dt').value,payKey};
      if(need) B.when=B.form.dt; openSummarySheet();
    };
  },()=>pk?closeSheet():openServiceSheet(B.vehicle));
}
// Pop-up 3: receipt-style order summary + Confirm Booking
function openSummarySheet(){
  const t=totals(), pk=B.mode==='pickup', f=B.form, pm=PAYS.find(p=>p[0]===f.payKey), sp=B.product.id&&prod(B.product.id), v=t.v;
  openSheet('Booking Summary',`
   <div class="sv-route">
    <div class="sv-pt"><span class="dt a"></span><div><small>${pk?'PICK UP FROM SELLER':'PICKUP'}</small><b>${esc(f.pa)}</b><em>${esc(B.product.seller)}</em></div></div>
    ${B.stops.map(x=>`<div class="sv-pt"><span class="dt s"></span><div><small>STOP</small><b>${esc(x.addr)}</b></div></div>`).join('')}
    ${pk?'':`<div class="sv-pt"><span class="dt b"></span><div><small>DESTINATION</small><b>${esc(f.da)}</b></div></div>`}
   </div>
   <div class="sv-chips">${pk?`<span>${ic('clock','sm')}${B.when?new Date(B.when).toLocaleString('en-PH'):'—'}</span><span>${pkMethod()[2]}</span>`:`<span>${ic('map','sm')}${B.dist.toFixed(1)} km</span><span>${ic('clock','sm')}${dur(B.mins*v.eta)}</span><span>${svcOf(B.service).name}</span>${B.when?`<span>${new Date(B.when).toLocaleString('en-PH')}</span>`:''}`}</div>
   ${pk?'':`<div class="sv-veh"><img src="assets/${v.id}.jpg" alt=""><div><b>${esc(v.name)}</b><small>Up to ${v.cap.toLocaleString()} kg</small></div></div>`}
   <div class="sv-item"><div class="sv-th">${sp&&photo(sp)?`<img src="${photo(sp)}" alt="">`:ic('leaf')}</div><div style="flex:1;min-width:0"><b>${esc(B.product.name)}</b><small>${B.qty} ${esc(B.product.unit)} × ${peso(B.product.price)}</small></div></div>
   <div class="sv-rcpt">
    <div><span>Product Costing</span><span>${peso(t.sub)}</span></div>
    ${pk?'':`<div><span>Delivery fee (est.)</span><span>${peso(t.fee)}</span></div>`}
    <div class="sv-tot"><span>${pk?'Total':'Total estimated'}</span><b>${peso(t.total)}</b></div>
   </div>${pk&&B.pkm==='rep'?`<p class="note" style="margin:0 0 10px">Representative: <b>${esc(B.rep.name)}</b> · ${esc(B.rep.phone)}</p>`:''}
   <div class="sv-meta"><div><small>Pay with</small><b>${pm[2]}</b></div><div><small>Customer</small><b>${esc(f.name)}</b><small>${esc(f.phone)}</small></div></div>
   <p class="note" style="margin:0 0 10px">${pk?'Pickup has no delivery fee. ':'Delivery fees are estimates based on sample pricing. '}No real payment is processed.</p>
   <label class="chk"><input type="checkbox" id="agree"><span>I have reviewed my order information and confirm it is correct.</span></label>
   <button class="btn" id="cfm" style="margin-top:8px">Confirm Booking</button>`,()=>{ $('#cfm').onclick=confirmBooking; },openPaySheet);
}
function confirmBooking(){
  if(!$('#agree').checked) return toast('Please tick the confirmation box',true);
  const sp0=B.product.id&&prod(B.product.id);
  if(sp0&&B.qty>sp0.qty) return toast(`Only ${sp0.qty} ${sp0.unit} left in stock – please reduce the quantity`,true);
  submitRequest();
}
// Step 1: Confirm Booking sends a request. The app stays usable while it "finds a rider" (10–15 s)
let bookingBusy=false, bookTimer=null;
function submitRequest(){
  const t=totals(), pk=B.mode==='pickup', f=B.form, sp=B.product.id&&prod(B.product.id), step=Math.max(1,Math.floor((B.coords||[]).length/70));
  const req={rid:'r'+Date.now(),reqAt:Date.now(),dur:10000+Math.random()*5000,mode:B.mode,product:B.product,qty:B.qty,pickup:{...B.pickup,addr:f.pa},dest:pk?null:{...B.dest,addr:f.da},stops:B.stops,
    vehicle:t.v?.name||null,vid:t.v?.id||null,service:pk?'Pickup':svcOf(B.service).name,pkm:pk?pkMethod()[2]:null,rep:pk&&B.pkm==='rep'?{...B.rep}:null,when:B.when||'',dist:B.dist,mins:B.mins,fee:t.fee||0,sub:t.sub,total:t.total,pay:PAYS.find(p=>p[0]===f.payKey)[2],
    cust:{name:f.name,phone:f.phone,email:f.email},ins:f.ins,coords:(B.coords||[]).filter((_,i)=>i%step===0)};
  if(sp) sp.qty=Math.max(0,Math.round((sp.qty-B.qty)*100)/100); // reserve the stock while waiting
  DB.pending.push(req); save(); B=null; hist=[]; go('home'); toast(pk?'Order sent – waiting for the seller…':'Booking sent – finding a rider…');
}
function openPendingSheet(){
  if(!DB.pending.length) return;
  openSheet('Finding your rider',DB.pending.map(r=>`<div class="card"><b>${esc(r.product.name)}</b><div class="note" style="margin:2px 0 10px">${esc(r.vehicle||'Pickup')} · ${peso(r.total)}</div>
    <div class="pbar ind"><i></i></div><div class="note" style="margin:8px 0">${r.mode==='pickup'?'Waiting for the seller to confirm…':'Still waiting for a rider to accept…'}</div>
    <button class="btn out sm" data-cx="${r.rid}" style="color:var(--bad);border-color:var(--bad)">Cancel request</button></div>`).join('')+'<p class="note">You can keep browsing the app. We’ll show your booking reference as soon as a rider accepts.</p>',
    sh=>$$('[data-cx]',sh).forEach(b=>b.onclick=()=>cancelRequest(b.dataset.cx)));
}
function cancelRequest(rid){
  const r=DB.pending.find(x=>x.rid===rid); if(!r) return;
  const sp=r.product.id&&prod(r.product.id); if(sp) sp.qty=Math.round((sp.qty+r.qty)*100)/100;
  DB.pending=DB.pending.filter(x=>x.rid!==rid); save(); toast('Request cancelled'); if(DB.pending.length) openPendingSheet(); else closeSheet(); updNav();
}
// A rider accepted: create the real booking with its reference number
function finalizeRequest(req){
  const ref='AGO-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+(++DB.seq).toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
  const bk={...req,ref,at:Date.now(),driver:req.mode==='pickup'?null:DRIVERS[DB.seq%3],status:0,unseen:true}; delete bk.rid; delete bk.reqAt; delete bk.dur;
  DB.bookings.unshift(bk); DB.pending=DB.pending.filter(x=>x.rid!==req.rid);
  pushNotif('Booking confirmed ✅',`${ref} – ${bk.product.name}`); save();
}
// Runs every second: finishes requests whose wait is over, updates the waiting text, shows the "Booking Confirmed" pop-up
function pendingTick(){
  const now=Date.now(), done=DB.pending.filter(r=>r.reqAt+r.dur<=now); done.forEach(finalizeRequest);
  if(done.length) updNav();
  const sm=$('#mini small'); if(sm&&DB.pending.length&&$('#app').classList.contains('hasmini')) sm.textContent=waitText(DB.pending[0]);
  const un=DB.bookings.find(b=>b.unseen); if(un&&$('#sheet').hidden){ un.unseen=false; save(); showConfirmed(un); }
}
// Step 2: booking confirmation with reference number
function showConfirmed(bk){
  const row=(a,b)=>`<div><span>${a}</span><span>${b}</span></div>`;
  openSheet('Booking Confirmed',`<div class="ok" style="padding:4px 0 8px"><div class="c">${ic('check')}</div><h2>Booking Confirmed!</h2><p style="color:var(--mute)">${bk.mode==='pickup'?'The seller confirmed your pickup order.':'A rider accepted your order and is on the way to pick it up.'}</p></div>
   <div class="card" style="text-align:center"><div class="note" style="margin:0 0 4px">Booking reference</div><div class="code" style="font-size:19px;letter-spacing:1px;margin:6px 0 10px">${esc(bk.ref)}</div><button class="chip" id="cpr" type="button" style="margin:0 auto">Copy reference</button></div>
   <div class="card sum">${row('Product',`${esc(bk.product.name)} × ${bk.qty} ${esc(bk.product.unit)}`)}${bk.vehicle?row('Vehicle',esc(bk.vehicle)):''}${row('Service',esc(bk.service))}${row('Payment',esc(bk.pay))}<div class="tot"><span>Total estimated</span><span>${peso(bk.total)}</span></div></div>
   <button class="btn" id="trk">${bk.mode==='pickup'?'Track Order':'Track Delivery'}</button><button class="btn out" id="bhm" style="margin-top:8px">Back to Home</button>`,()=>{
    $('#trk').onclick=()=>{ go('track',bk.ref); }; $('#bhm').onclick=()=>{ hist=[]; go('home'); };
    $('#cpr').onclick=async()=>{ try{await navigator.clipboard.writeText(bk.ref);}catch(e){} toast('Reference copied'); };
  });
}
/* ---------- 9. CONFIRMATION & TRACKING (simulated) ---------- */
function viewTrack(){
  if(map){map.remove();map=null;}
  const b=DB.bookings.find(x=>x.ref===cur.a); if(!b) return go('home');
  const steps=b.mode==='pickup'?STATUS_PICK:STATUS_DEL, last=steps.length-1, can=!!b.cancelled, done=!can&&b.status>=last, row=(a,c)=>`<div><span>${a}</span><span>${c}</span></div>`;
  $('#view').innerHTML=`<div class="page">${pageHead('Booking Details')}
   ${done?`<div class="ok card"><div class="c">${ic('check')}</div><h2>${b.mode==='pickup'?'Order Collected!':'Successfully Delivered!'}</h2><p style="color:var(--mute)">Salamat! Your order has been completed. You earned <b>${Math.floor(b.total/50)} reward points</b>.</p></div>`:''}
   ${can?`<div class="card" style="text-align:center;color:var(--bad)"><b>This booking was cancelled</b><div class="note">It has been removed from your active deliveries.</div></div>`:''}
   <div class="ref"><small>Booking reference</small><h2>${b.ref}</h2><small>${dateStr(b.at)} · ${clock(b.at)} · ${b.mode==='pickup'?'Pickup':'Delivery'}</small></div>
   <div class="map tall" id="map"></div>
   <div class="card"><h3>Status</h3><div class="note" style="margin:-6px 0 12px">Step ${b.status+1} of ${steps.length}</div><ul class="steps">${steps.slice(0,b.status+1).map((s,i)=>`<li class="${can?'':i<b.status?'done':(done?'done':'cur')} ${i===b.status&&!can&&b.status>0?'new':''}"><span class="dt">${can||i<b.status||done?'✓':i+1}</span>${s}</li>`).join('')}</ul>
    ${done||can?'':`<div class="acts" style="margin-top:14px"><button class="btn out sm" id="nx" style="flex:1">Next status</button><button class="btn sm" id="auto" style="flex:1">▶ Auto-simulate</button></div><p class="note">Status updates are simulated for this prototype.</p>${b.status<=(b.mode==='pickup'?1:3)?`<button class="btn out" id="cnl" style="margin-top:8px;color:var(--bad);border-color:var(--bad)">Cancel booking</button>`:''}`}</div>
   <div class="card"><h3>Seller</h3><div class="drv"><div class="av">${initials(b.product.seller||'S')}</div><div style="flex:1"><b>${esc(b.product.seller)}</b><div class="meta"><span>${esc(b.pickup.addr)}</span></div></div></div></div>
   ${b.driver&&b.status>=2?`<div class="card"><h3>Rider</h3><div class="drv"><div class="av on">${initials(b.driver.name)}</div><div style="flex:1"><b>${b.driver.name}</b><div class="meta"><span>★ ${b.driver.rating} · ${b.driver.plate} (sample driver)</span></div></div><a class="cb" href="tel:${b.driver.phone.replace(/\s/g,'')}" aria-label="Call rider">${ic('phone','sm')}</a><button class="cb" id="rmsg" aria-label="Message rider">${ic('chat','sm')}</button></div><div class="note" style="margin:8px 0 0">${esc(b.driver.phone)} (sample driver)</div></div>`:''}
   <div class="card sum"><h3>Order information</h3>${row('Product',`${esc(b.product.name)} × ${b.qty} ${esc(b.product.unit)}`)}${row('Seller',esc(b.product.seller))}${row('Customer',esc(b.cust.name)+' · '+esc(b.cust.phone))}
    ${row('Pickup',esc(b.pickup.addr))}${b.dest?row('Destination',esc(b.dest.addr)):''}${b.vehicle?row('Vehicle',esc(b.vehicle)):''}${row('Service',esc(b.service))}${b.when?row('Scheduled',new Date(b.when).toLocaleString('en-PH')):''}${b.dist?row('Distance',b.dist.toFixed(1)+' km'):''}
    ${b.pkm?row('Pickup method',esc(b.pkm)):''}${b.rep?row('Representative',esc(b.rep.name)+' · '+esc(b.rep.phone)):''}${row('Payment',esc(b.pay))}${b.mode==='pickup'?'':row('Delivery fee',peso(b.fee))}${row('Product Costing',peso(b.sub))}<div class="tot"><span>${b.mode==='pickup'?'Total':'Total estimated'}</span><span>${peso(b.total)}</span></div></div>
   <div class="acts">${b.product.id?`<button class="btn out" id="ms">${ic('chat','sm')}Message Seller</button>`:''}<button class="btn" id="hm">Back to Home</button></div></div>`;
  const rm=$('#rmsg'); if(rm) rm.onclick=()=>openChatWithRider(b);
  const cn=$('#cnl'); if(cn) cn.onclick=()=>{ if(!confirm('Cancel this booking?')) return; b.cancelled=true; const rs=b.product.id&&prod(b.product.id); if(rs&&!b.restocked){ rs.qty=Math.round((rs.qty+b.qty)*100)/100; b.restocked=true; } save(); pushNotif('Booking cancelled',b.ref+' was cancelled.'); toast('Booking cancelled'); viewTrack(); };
  $('#hm').onclick=()=>{hist=[];go('home');}; const ms=$('#ms'); if(ms) ms.onclick=()=>{const p=prod(b.product.id); p?openChatWith(p):toast('Listing no longer available',true);};
  // map
  map=L.map('map').setView([b.pickup.lat,b.pickup.lng],12); tiles().addTo(map);
  const pts=[[b.pickup.lat,b.pickup.lng]]; L.marker(pts[0],{icon:pinIcon('#2a9d34','A')}).addTo(map);
  let vm=null;
  if(b.dest){ const d=[b.dest.lat,b.dest.lng]; pts.push(d); L.marker(d,{icon:pinIcon('#065f3c','B')}).addTo(map);
    if(b.coords?.length>1) L.polyline(b.coords,{color:'#2a9d34',weight:5}).addTo(map); map.fitBounds(pts.concat(b.coords||[]),{padding:[30,30]});
    vm=L.marker(vehPos(b),{icon:L.divIcon({className:'',html:`<div class="vm">${b.vid==='scooter'?'🛵':'🚚'}</div>`,iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map); }
  else map.setView(pts[0],14);
  setTimeout(()=>map&&map.invalidateSize(),250);
  const adv=()=>{ if(b.status>=last) return; b.status++; if(b.status===last){ DB.points+=Math.floor(b.total/50); DB.ptsLog.unshift({t:'Order '+b.ref,p:Math.floor(b.total/50),at:Date.now()}); pushNotif(b.mode==='pickup'?'Order collected 🎉':'Delivered 🎉',`${b.ref} completed. Salamat!`); } save(); const keep=map; if(b.status>=last||true){ clearInterval(simT); viewTrack(); } };
  const nx=$('#nx'); if(nx){ nx.onclick=()=>{ adv(); };
    $('#auto').onclick=()=>{ $('#auto').disabled=true; simT=setInterval(()=>{ if(b.status>=last){clearInterval(simT);return;} if(map){map.remove();map=null;} b.status++; if(b.status===last){DB.points+=Math.floor(b.total/50);DB.ptsLog.unshift({t:'Order '+b.ref,p:Math.floor(b.total/50),at:Date.now()});pushNotif('Delivered 🎉',b.ref+' completed.');} save(); const t=simT; viewTrack(); if(b.status<last){ $('#auto')?.setAttribute('disabled',1); simT=t; } else clearInterval(t); },2500); }; }
}
// vehicle marker position along the route, based on status
function vehPos(b){
  const c=b.coords&&b.coords.length?b.coords:[[b.pickup.lat,b.pickup.lng]], s=b.status, at=f=>c[Math.min(c.length-1,Math.round(f*(c.length-1)))];
  if(s<=2) return [b.pickup.lat+.012,b.pickup.lng-.012]; if(s===3) return [b.pickup.lat+.005,b.pickup.lng-.005];
  return at([0,0,0,0,0,.5,.92,1][s]);
}

/* ---------- 10. CREATE / EDIT LISTING ---------- */
let draftImgs=[];
const CAT_EMOJI={Vegetables:'🥬',Fruits:'🍎','Rice and Grains':'🌾','Root Crops':'🥔',Livestock:'🐖',Poultry:'🐓','Agricultural Supplies':'🌱','Other Products':'📦'};
const opts=(arr,sel)=>arr.map(o=>`<option ${o===sel?'selected':''}>${o}</option>`).join('');
function viewCreate(){
  const ed=cur.a?prod(cur.a):null, p=ed||{}; draftImgs=ed?[...ed.images]:[];
  $('#view').innerHTML=`<div class="page">${pageHead(ed?'Edit Listing':'Create Product Listing')}
   <div class="card"><h3>Product details</h3>${fld('pn','Product name *',p.name)}
    <div class="fld"><label for="pc">Category *</label><select id="pc">${opts(CATS.slice(1),p.cat)}</select></div>
    ${fld('pd','Description *',p.desc,{area:1,ph:'Describe quality, variety, harvest, packaging…'})}
    <div class="two"><div class="fld"><label for="pcd">Condition</label><select id="pcd">${opts(['Fresh','Organic','Dried / Processed','Live','New'],p.cond)}</select></div>
     <div class="fld"><label for="pu">Unit *</label><select id="pu">${opts(['kg','sack','bundle','piece','tray','liter'],p.unit)}</select></div></div>
    <div class="two">${fld('pq','Available stock *',p.qty,{type:'number',attr:'min="0" inputmode="decimal"'})}${fld('hd','Harvest date (optional)',p.harvest||'',{type:'date'})}</div></div>
   <div class="card"><h3>Pricing</h3>${fld('pp','Price per unit (₱) *',p.price,{type:'number',attr:'min="0" step="0.01" inputmode="decimal"'})}
    <div class="two">${fld('mo','Min. order (optional)',p.minOrder||'',{type:'number',attr:'min="0"'})}${fld('bk','Bulk pricing (optional)',p.bulk||'',{ph:'e.g. ₱50/kg for 100 kg+'})}</div></div>
   <div class="card"><h3>Photos</h3><div class="imgs" id="imgs"></div><p class="note">Add multiple photos. Images are resized and stored on this device.</p></div>
   <div class="card"><h3>Seller information</h3>${fld('sn','Seller / farm name *',p.seller||DB.profile.name+' Farm')}${fld('sp','Contact number *',p.phone||DB.profile.phone,{type:'tel'})}${fld('sl','Seller location *',p.loc,{ph:'Barangay, City, Province'})}</div>
   <div class="card"><h3>Availability & delivery</h3><p class="note" style="margin:0 0 10px">Availability updates automatically from your stock: it shows <b>Low stock</b> when it runs low, and the listing is removed from Home when stock reaches 0.</p>${fld('la','Low-stock alert at (optional)',p.lowAt||'',{type:'number',ph:'Default: 20% of your stock',attr:'min="0" inputmode="decimal"'})}
        <div class="fld"><label for="pf">Fulfilment</label><select id="pf">${[['both','Delivery and pickup'],['delivery','Delivery available'],['pickup','Pickup available']].map(o=>`<option value="${o[0]}" ${p.delivery===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div></div>
   <div class="sticky"><button class="btn" id="pub">${ed?'Save Changes':'Publish Product'}</button></div></div>`;
  const drawImgs=()=>{ $('#imgs').innerHTML=draftImgs.map((s,i)=>`<div class="th"><img src="${s}" alt="Preview ${i+1}"><button data-x="${i}" aria-label="Remove">×</button></div>`).join('')+`<label class="up">${ic('plus')}<br>Add photo<input type="file" id="fi" accept="image/*" multiple hidden></label>`;
    $$('#imgs [data-x]').forEach(b=>b.onclick=()=>{draftImgs.splice(+b.dataset.x,1);drawImgs();});
    $('#fi').onchange=async e=>{ for(const f of [...e.target.files].slice(0,5-draftImgs.length)) draftImgs.push(await shrink(f)); drawImgs(); }; };
  drawImgs();
  $('#pub').onclick=async()=>{
    const ok=[check('pn',v=>v.length>=3,'Enter a product name'),check('pd',v=>v.length>=10,'Describe your product (10+ characters)'),check('pq',v=>v!==''&&+v>=0,'Enter a valid quantity'),check('pp',v=>+v>0,'Enter a price greater than 0'),
      check('sn',v=>v.length>=2,'Enter the seller name'),check('sp',v=>/^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g,'')),'Enter a valid PH mobile number'),check('sl',v=>v.length>=3,'Enter the location')].every(Boolean);
    if(!ok) return toast('Please complete the required fields',true);
    $('#pub').disabled=true; const loc=$('#sl').value.trim();
    let g=ed&&ed.loc===loc?{lat:ed.lat,lng:ed.lng}:null;
    if(!g){ try{ const j=await geocode(loc); if(j[0]) g={lat:j[0].lat,lng:j[0].lng}; }catch(e){} }
    g=g||{lat:HOME_ADDR.lat,lng:HOME_ADDR.lng};
    const cat=$('#pc').value, q=+$('#pq').value, d={name:$('#pn').value.trim(),cat,desc:$('#pd').value.trim(),cond:$('#pcd').value,unit:$('#pu').value,qty:q,harvest:$('#hd').value,price:+$('#pp').value,minOrder:+$('#mo').value||0,bulk:$('#bk').value.trim(),
      seller:$('#sn').value.trim(),phone:$('#sp').value.trim(),loc,lat:g.lat,lng:g.lng,lowAt:+$('#la').value||0,delivery:$('#pf').value,images:draftImgs,emoji:CAT_EMOJI[cat]};
    if(ed){ Object.assign(ed,d,{initQty:Math.max(ed.initQty||q,q)}); save(); toast('Listing updated'); hist=[{v:'settings',a:null},{v:'myprods',a:null}]; return go('myprod',ed.id,false); }
    const np={id:'u'+Date.now(),owner:'me',market:+(d.price*1.05).toFixed(2),kw:'farm,'+d.name.split(' ')[0],posted:Date.now(),initQty:q,sold:0,...d};
    DB.products.unshift(np); toast('Product published! 🎉'); pushNotif('Listing published',d.name+' is now live on Home.');
    setTimeout(()=>simulateSale(np.id),25000); // demo: a simulated buyer orders shortly after publishing
    save(); S.q='';S.cat='All'; hist=[]; go('home');
  };
}
// resize uploaded photos so LocalStorage doesn't overflow
function shrink(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const sc=Math.min(1,640/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=im.width*sc;c.height=im.height*sc; c.getContext('2d').drawImage(im,0,0,c.width,c.height); res(c.toDataURL('image/jpeg',.72)); }; im.src=r.result; }; r.readAsDataURL(file); }); }

/* ---------- 11. CHAT ---------- */
const waiting=new Set(); let convDraw=null;
const pickN=(a,n)=>a[n%a.length];
function queueReply(c){
  if(waiting.has(c.id)) return; waiting.add(c.id);
  setTimeout(()=>{ waiting.delete(c.id); if(!DB.chats.includes(c)) return;
    const last=[...c.msgs].reverse().find(m=>m.f==='me'); const here=cur.v==='conv'&&cur.a===c.id;
    if(!here) c.unread++;
    reply(c,last?(last.t||''):'',!!(last&&last.img)); save();
    if(here&&convDraw) convDraw(); else updNav(); },900+Math.random()*900);
}
function openChatWith(p){
  let c=DB.chats.find(x=>x.pid===p.id||x.name===p.seller);
  if(!c){ c={id:'c'+Date.now(),name:p.seller,pid:p.id,online:true,unread:0,msgs:[]}; DB.chats.unshift(c); }
  if(!c.msgs.length) c.msgs.push({f:'me',t:`Hi! Is "${p.name}" still available?`,at:Date.now()});
  save(); go('conv',c.id);
}
function openChatWithRider(b){
  const id='rd_'+b.ref; let c=DB.chats.find(x=>x.id===id);
  if(!c){ c={id,name:b.driver.name+' (Rider)',rider:true,ref:b.ref,online:true,unread:0,msgs:[{f:'them',t:`Hello po! I'm ${b.driver.name}, your AgriGO rider for ${b.ref}. I'll take good care of your order.`,at:Date.now()}]}; DB.chats.unshift(c); save(); }
  go('conv',id);
}
function deleteChat(id,after){
  const c=DB.chats.find(x=>x.id===id); if(!c) return;
  if(!confirm(`Delete your conversation with ${c.name}? This can't be undone.`)) return;
  DB.chats=DB.chats.filter(x=>x.id!==id); waiting.delete(id); save(); updNav(); toast('Conversation deleted'); after&&after();
}
function viewChat(){
  const list=[...DB.chats].sort((a,b)=>(b.msgs.at(-1)?.at||0)-(a.msgs.at(-1)?.at||0));
  $('#view').innerHTML=`<div class="page"><div class="pgtitle"><h1>Messages</h1><button class="chip" id="cs">${ic('help','sm')} Support</button></div>
   ${list.length?list.map(c=>{const m=c.msgs.at(-1);return `<div class="conv" role="button" tabindex="0" data-c="${c.id}"><div class="av ${c.online?'on':''}">${initials(c.name)}</div><div class="t"><b>${esc(c.name)}</b><p>${m?(m.img?'📷 Photo':esc(m.t)):'No messages yet'}</p></div><div class="r"><span>${m?clock(m.at):''}</span>${c.unread?`<span class="u">${c.unread}</span>`:''}</div><button class="cdel" data-d="${c.id}" aria-label="Delete conversation">${ic('trash','sm')}</button></div>`;}).join(''):'<div class="empty"><div class="big">💬</div>No conversations yet.<br>Tap “Message Seller” on any product.</div>'}</div>`;
  $$('.conv').forEach(b=>{ b.onclick=()=>go('conv',b.dataset.c); b.onkeydown=e=>{ if(e.key==='Enter') go('conv',b.dataset.c); }; });
  $$('.cdel').forEach(b=>b.onclick=e=>{ e.stopPropagation(); deleteChat(b.dataset.d,viewChat); });
  $('#cs').onclick=openSupport;
}
function openSupport(){ let c=DB.chats.find(x=>x.id==='cs'); if(!c){ c={id:'cs',name:'AgriGO Customer Service',online:true,unread:0,msgs:[{f:'them',t:'Kumusta! This is AgriGO Support. Ask me anything – cash out, posting, delivery rates, booking, payments and more.',at:Date.now()}]}; DB.chats.unshift(c); save(); } go('conv','cs'); }
const CS_QUICK=['How to cash out','How to post','Delivery rates','How to book','Payment methods','Track my order'];
function viewConv(){
  const c=DB.chats.find(x=>x.id===cur.a); if(!c) return go('chat'); c.unread=0; save();
  $('#view').innerHTML=`<div class="chatwrap"><div class="chead" style="padding-top:calc(10px + var(--sat))">${backBtn}<div class="av ${c.online?'on':''}" style="width:40px;height:40px;font-size:15px">${initials(c.name)}</div><div style="flex:1;min-width:0"><b>${esc(c.name)}</b><div class="note" style="margin:0">${c.online?'Online':'Offline'}</div></div>${c.pid&&prod(c.pid)?`<button class="chip" id="vp">View item</button>`:c.ref?`<button class="chip" id="vb">View booking</button>`:''}<button class="ib" id="cdl" aria-label="Delete conversation" style="width:36px;height:36px;flex:none">${ic('trash','sm')}</button></div>
   <div class="msgs" id="msgs"></div>${c.id==='cs'?`<div class="qchips">${CS_QUICK.map(q=>`<button class="chip" data-q="${q}" type="button">${q}</button>`).join('')}</div>`:''}<div class="cin"><label class="mini" style="width:44px;height:44px;border-radius:50%;cursor:pointer">${ic('img','sm')}<input type="file" id="att" accept="image/*" hidden></label><input type="text" id="mi" placeholder="Type a message" aria-label="Message"><button class="send" id="sd" aria-label="Send">${ic('send','sm')}</button></div></div>`;
  const draw=convDraw=()=>{ const el=$('#msgs'); if(!el) return; el.innerHTML=c.msgs.map(m=>`<div class="m ${m.f==='me'?'me':''}">${m.img?`<img src="${m.img}" alt="Photo">`:''}${m.t?esc(m.t):''}<time>${clock(m.at)}</time></div>`).join('')+(waiting.has(c.id)?'<div class="m typing"><span></span><span></span><span></span></div>':''); el.scrollTop=el.scrollHeight; }; draw();
  const send=(t,img)=>{ c.msgs.push({f:'me',t,img,at:Date.now()}); save(); queueReply(c); draw(); };
  const go1=()=>{ const v=$('#mi').value.trim(); if(!v) return; $('#mi').value=''; send(v); };
  $('#sd').onclick=go1; $('#mi').onkeydown=e=>{if(e.key==='Enter')go1();};
  $('#att').onchange=async e=>{ if(e.target.files[0]) send('',await shrink(e.target.files[0])); };
  $$('.qchips .chip').forEach(b=>b.onclick=()=>send(b.dataset.q));
  $('#cdl').onclick=()=>deleteChat(c.id,()=>go('chat'));
  const vp=$('#vp'); if(vp) vp.onclick=()=>go('detail',c.pid);
  const vb=$('#vb'); if(vb) vb.onclick=()=>go('track',c.ref);
  if(c.msgs.length&&c.msgs.at(-1).f==='me'&&!waiting.has(c.id)){ queueReply(c); draw(); }
  else if(waiting.has(c.id)) draw();
}

/* ---------- smart simulated replies (keyword / intent based) ---------- */
function reply(c,t='',isImg=false){
  const raw=t||'', l=' '+raw.toLowerCase().replace(/[?!.,]/g,' ')+' ';
  let r;
  if(c.rider) r=riderReply(c,l,raw,isImg);
  else if(c.id==='cs') r=csReply(c,l,raw,isImg);
  else r=sellerReply(c,l,raw,isImg);
  c.msgs.push({f:'them',t:r,at:Date.now()});
}
function sellerReply(c,l,raw,isImg){
  const p=c.pid&&prod(c.pid), n=c.msgs.length, T=r=>r.test(l), out=[], add=s=>{ if(s&&out.length<2) out.push(s); };
  const u=p?p.unit:'piraso', nm=p?p.name:'product', num=parseFloat((raw.match(/(\d+(?:\.\d+)?)/)||[])[1]);
  if(isImg) return 'Natanggap ko po ang photo, salamat! May tanong po ba kayo tungkol dito?';
  const cat=p?(p.cat+' '+p.name).toLowerCase():'';
  const shelf=/egg/.test(cat)?'Ang itlog po ay tumatagal ng mga 3–4 na linggo sa malamig at tuyong lugar.'
   :/chicken|poultry|manok/.test(cat)?'Dressed/fresh po ito – i-chill o i-freeze agad pagdating para tumagal.'
   :/leaf|pechay|petchay|kangkong|lettuce|mustasa|spinach|malunggay|sitaw/.test(cat)?'Leafy veggies po ito kaya best within 2–3 days; ilagay sa ref na may basang tela para sariwa pa rin.'
   :/fruit|mango|banana|pineapple|papaya|tomato|eggplant|onion|garlic|potato|camote|carrot|vegetable/.test(cat)?'Tatagal po ito ng mga 4–7 days sa cool at tuyong lugar (mas matagal kung nasa ref).'
   :/rice|grain|corn|bigas|palay/.test(cat)?'Tuyo at naka-sako po, tumatagal ng ilang buwan kung nakatago sa tuyong lugar.'
   :/fertiliz|supply|seed|feed|compost/.test(cat)?'Hindi po ito madaling masira – itabi lang sa tuyo at may lilim na lugar.'
   :'Maayos po ang pagkaka-pack at fresh po ito.';
  if(T(/ (hi|hello|hey|kumusta|musta|magandang|good (am|pm|morning|afternoon|evening)) /)&&raw.trim().split(/\s+/).length<=4) add(`Hello po! 😊 Salamat sa pag-message. Ano pong maitutulong ko tungkol sa ${nm}?`);
  if(T(/legit|scam|totoo ba|peke|fake|trusted|reliable|mapagkakatiwalaan|safe ba|manloko|modus|real ba/)) add(`Legit po kami! 😊 Active seller po kami sa AgriGO${p?`, taga-${p.loc}`:''}. Pwede po kayong mag-COD o mag-pickup para makita muna ang product, at may chat & tracking po lahat ng order.`);
  if(T(/masira|nasisira|masisira|mabulok|bulok|spoil|damage|tumagal|tatagal|tagal|fresh|expire|shelf|quality|durog|madurog|lanta|malanta|sariwa|kondisyon|condition/)) add(`${shelf} ${p&&p.cond?`Condition po: ${p.cond}. `:''}Kung may sira pagdating, i-message niyo lang po agad with photo para maayos po natin.`);
  if(T(/sure (na|ne|ba)|sigurado|talaga ba|confirm|kumpirm|final|reserve|hold|ilaan|seryoso/)) add(`Opo, sure na po! ✅ Ire-reserve ko po ${isFinite(num)?num+' ':''}${isFinite(num)?u+' ng ':''}${nm} para sa inyo. Pag na-book niyo na po sa Buy / Arrange, ihahanda na agad namin.`);
  if(T(/available|avail|stock|meron pa|may stock|mayroon|ubos|sold|pa ba|still|meron/)) add(p?(p.qty<=0?`Pasensya na po, sold out na po ang ${nm} ngayon. Babalitaan ko po kayo pag may bago.`:`Yes po, ${p.qty} ${u} pa ang available${p.minOrder?` (minimum order: ${p.minOrder} ${u})`:''}. Ilan po ang kailangan niyo?`):'Yes po, available pa po. Ilan po ang kailangan niyo?');
  if(T(/tawad|last price|lowest|pinakamababa|mura pa|bawas|discount|sale|promo/)) add(p?`Pasensya na po, ${peso(p.price)}/${u} na po ang pinakamababa namin.${p.bulk?` Pero para sa bulk may special price po: ${p.bulk}.`:' Pero kung marami po ang kukunin, pwede po nating pag-usapan.'}`:'Medyo mababa na po ang presyo, pero pwede nating pag-usapan kung bulk.');
  else if(T(/price|how much|magkano|presyo|rate|halaga/)) add(p?`${peso(p.price)}/${u} po. ${p.bulk?`Bulk pricing: ${p.bulk}. `:''}Ilan po ang kukunin niyo?`:'Depende po sa dami. Ilan po ang kailangan niyo?');
  if(T(/bulk|wholesale|maramihan|marami|dami|resell/)&&!T(/tawad|discount/)) add(p&&p.bulk?`Bulk pricing po: ${p.bulk}. May stock po kami na ${p.qty} ${u}.`:`Pwede po ang maramihan – sabihin niyo lang po kung ilan para ma-quote ko kayo.`);
  if(T(/order|bili|bibili|bilhin|kukuha|kuha|kukunin|gusto ko|take|\d+\s*(kg|kilo|sack|sako|bundle|piece|pcs|pc|tray|dozen)/)&&isFinite(num)&&p){
    if(p.minOrder&&num<p.minOrder) add(`Minimum order po namin ay ${p.minOrder} ${u}.`);
    else if(num>p.qty) add(`${p.qty} ${u} lang po ang available ngayon. Pwede po ba iyon?`);
    else add(`Noted po! ${num} ${u} × ${peso(p.price)} = ${peso(num*p.price)} (hindi pa kasama ang delivery fee). Tap niyo lang po ang Buy / Arrange sa product page para ma-book.`); }
  if(T(/where|saan|location|lugar|address|malapit|layo|taga/)) add(p?`Nasa ${p.loc} po kami${p.lat!=null?` (mga ${haversine(HOME_ADDR,p).toFixed(1)} km mula sa AUF)`:''}. Pwede po kayong mag-pickup o mag-book ng AgriGO delivery.`:'Pwede po kayong mag-pickup o mag-book ng delivery.');
  if(T(/deliver|hatid|pickup|pick up|kunin|ship|shipping|padala/)) add(p&&p.delivery==='pickup'?'Pickup lang po ang available sa product na ito. Dito po kayo pwedeng pumunta sa aming location.':p&&p.delivery==='delivery'?'Delivery lang po ang available. Mag-book po kayo ng AgriGO vehicle sa product page.':'Pwede po both! Pickup sa amin o mag-book ng AgriGO vehicle sa product page – ihahanda po namin ang order.');
  if(T(/pay|bayad|gcash|maya|cod|cash|bank|transfer|payment/)) add('Tumatanggap po tayo ng Cash on Delivery, GCash, Maya at Bank Transfer – pipiliin niyo po sa checkout.');
  if(T(/when|kailan|anong oras|ready|schedule|mamaya|bukas|today|ngayon|how long|gaano katagal|oras/)) add('Ready po ang order within 1–2 hours pagkatapos ng booking. Bukas po kami 6AM–6PM araw-araw.');
  if(T(/number|contact|call|tawag|phone|cp |text/)) add(p&&p.phone?`Pwede po kayong mag-text o tumawag sa ${p.phone}.`:'Dito na lang po tayo mag-chat para ma-record ang usapan.');
  if(T(/pack|balot|sako|box|lalagyan/)) add('Maayos po naming ibinabalot at inilalagay sa matibay na container/sako para hindi madurog sa biyahe.');
  if(T(/organic|pesticide|chemical|spray|gamot/)) add('Maingat po kami sa pagtatanim at hindi sobra sa spray. Pwede po kayong magtanong ng details bago mag-order.');
  if(T(/size|laki|timbang|bigat|weight|gaano kalaki|description|detalye|ano ito/)&&p) add(`${p.desc}`);
  if(T(/cancel|refund|return|ibalik|palit|replace/)) add('Pwede po ma-cancel ang order bago pa ma-prepare. Kung may problema sa product, i-send niyo lang po ang photo at aayusin natin.');
  if(T(/ (salamat|thank|thanks|tnx|ty) /)) add('Walang anuman po! 😊 Message lang po kayo anytime kung may tanong pa.');
  if(T(/ (bye|paalam|sige po|ingat) /)&&!out.length) add('Ingat po! Salamat sa pag-message. 🌿');
  if(!out.length&&T(/^ *(ok|okay|sige|noted|opo|yes|oo|sge|sure) *$/)) add('Sige po! Hihintayin ko po ang order niyo. 😊');
  if(!out.length) add(pickN(['Sige po, noted! Ano pa po ang gusto niyong malaman tungkol sa '+nm+'?','Salamat po! Pwede niyo po akong tanungin tungkol sa presyo, stock, delivery o quality ng product.','Okay po! Kung ready na po kayo, i-tap lang ang Buy / Arrange sa product page. 👍'],n));
  return out.join('\n\n');
}
function riderReply(c,l,raw,isImg){
  const bk=DB.bookings.find(x=>x.ref===c.ref), n=c.msgs.length, T=r=>r.test(l), out=[], add=s=>{ if(s&&out.length<2) out.push(s); };
  if(isImg) return 'Natanggap ko po ang photo, salamat! Noted po.';
  const mins=bk&&bk.mins?Math.max(5,Math.round(bk.mins/2)):10;
  if(T(/ (hi|hello|hey|kumusta|musta|good (am|pm|morning|afternoon|evening)) /)&&raw.trim().split(/\s+/).length<=4) add('Hello po! 😊 Nasa biyahe na po ako. Ano po ang maitutulong ko?');
  if(T(/legit|scam|totoo|id|verified|rider ka ba|sigurado ka|sure ka/)) add(`Opo, verified AgriGO rider po ako${bk&&bk.vehicle?` at ${bk.vehicle} ang gamit ko`:''}. Makikita niyo po ang booking ${c.ref} sa app para makumpirma.`);
  if(T(/masira|masisira|nasira|ingat|fragile|babasagin|madurog|durog|tapon|itapon|bulok|careful/)) add('Opo, mag-iingat po ako! Naka-secure po ang mga items sa vehicle at dahan-dahan po ang takbo ko sa lubak, para hindi madurog o masira.');
  if(T(/where|saan|eta|asan|nasaan|malapit pa|ilang minuto|how long|gaano katagal|malayo/)) add(`Nasa biyahe na po ako, mga ${mins} minuto na lang po ang layo.`);
  if(T(/dumating|arrive|nandito|andito|nasa labas|nasa baba|sa gate|andyan|nandyan/)) add('Malapit na po ako! Pagdating ko po, tatawagan/ime-message ko kayo agad.');
  if(T(/late|ang tagal|matagal|traffic|bakit|delay/)) add('Pasensya na po sa tagal, medyo traffic po sa daan. Papunta na po ako ngayon.');
  if(T(/gate|address|landmark|bahay|house|kulay|color|tapat|katabi|malapit sa|barangay|street|kanto/)) add('Noted po! Hahanapin ko po ang location na iyon. Kung hindi ko makita, tatawagan ko po kayo.');
  if(T(/bayad|pay|cod|cash|sukli|panukli|change|gcash|maya|total|magkano|how much|fee|presyo/)) add(`${bk&&bk.total!=null?`Ang total po ay ${peso(bk.total)}. `:''}${bk&&/cash/i.test(bk.pay||'')?'Cash on Delivery po – pakihanda na lang ang eksaktong amount kung maaari, may panukli rin po ako.':'Nasa app na po ang bayad ninyo, wala na po kayong kailangang ibigay sa akin.'}`);
  if(T(/baba|ibaba|iwan|leave|gate|guard|sa labas|pa-?receive|pareceive|kapatid|nanay|tatay/)) add('Sige po, pwede ko pong iwan sa guard/ipaabot sa tatanggap. Sabihin niyo lang po ang pangalan para siguradong tama.');
  if(T(/call|tawag|number|contact|text/)) add('Pwede po akong ma-contact dito sa chat, at tatawagan ko po kayo pagdating ko sa location.');
  if(T(/cancel|ayaw na|wag na|huwag na/)) add('Pwede niyo po i-cancel sa tracking page ng booking. Pakisabi lang po agad para hindi na ako pumunta.');
  if(T(/photo|picture|litrato|proof|resibo|receipt/)) add('Opo, magpapadala po ako ng photo pagka-deliver ng order.');
  if(T(/wait|hintay|sandali|saglit|kunin muna|babalikan/)) add('Sige po, maghihintay po ako ng ilang minuto. Message lang po kayo pag ready na.');
  if(T(/ (salamat|thank|thanks|tnx|ty) /)) add('Walang anuman po! 😊 Salamat din po sa tiwala.');
  if(!out.length&&T(/^ *(ok|okay|sige|noted|opo|yes|oo|sge|sure) *$/)) add('Sige po! 👍');
  if(!out.length) add(pickN(['Okay po, noted!','Sige po, copy. Ia-update ko po kayo pag malapit na ako.','Opo, ako na po ang bahala. 👍'],n));
  return out.join('\n\n');
}
function csReply(c,l,raw,isImg){
  const n=c.msgs.length, T=r=>r.test(l);
  if(isImg) return 'Salamat po sa screenshot/photo! Pakilarawan din po ang concern at isama ang booking reference (hal. AG-XXXX) para matulungan namin kayo.';
  const ex=(id,km)=>{ const v=VEHICLES.find(x=>x.id===id); return v?Math.round((v.base+v.km*km)/5)*5:0; };
  if(T(/cash ?out|cashout|withdraw|ilabas|i-?withdraw|kunin ang pera|paano kunin|wallet|balance|kita|earn/)) return `💸 Paano mag-cash out:\n1. Settings › My Wallet\n2. I-tap ang Cash Out\n3. Ilagay ang amount (minimum ${peso(MIN_CASHOUT)})\n4. Piliin ang GCash, Maya o Bank Transfer at ilagay ang account number\n5. I-confirm\n\nNote: ${FEE_RATE*100}% AgriGO service fee ang ibinabawas sa bawat sale. Ang cash out ay "Processing (demo)" sa prototype na ito.`;
  if(T(/post|mag-?post|magbenta|sell|ibenta|listing|upload|i-?list|paano magbenta|mag-?add ng product|gumawa ng listing/)) return '🌱 Paano mag-post ng product:\n1. I-tap ang green + (Post) sa gitna ng bottom bar\n2. Maglagay ng photo, pangalan, category, presyo, dami at unit\n3. Isulat ang description at location\n4. Piliin kung Delivery, Pickup o Both\n5. I-tap ang Publish\n\nMakikita niyo ang mga naka-post sa Settings › My Posted Products kung saan pwede ring i-edit o i-delete.';
  if(T(/rate|fare|presyo ng deliver|delivery fee|how much.*deliver|magkano.*(deliver|hatid|padala)|singil|charge|pamasahe|bayad sa deliver|per km|kilometer|km|fee/)){
    const rows=VEHICLES.map(v=>`• ${v.name.replace('AgriGO ','')}: ${peso(v.base)} + ${peso(v.km)}/km`).join('\n');
    return `🚚 Delivery rates (base fare + per km):\n${rows}\n\nServices: Priority ×${SERVICES[0].mult}, Regular ×1, Pooling ×${SERVICES[2].mult}. Dagdag na ${peso(STOP_FEE)} bawat extra stop.\n\nHalimbawa: 10 km Sedan (Regular) ≈ ${peso(ex('sedan',10))}. Makikita ang exact fare pagkatapos pumili ng pickup at destination. (Sample prototype rates.)`; }
  if(T(/vehicle|sasakyan|truck|van|tricycle|scooter|motor|capacity|kaya ng|kilo ang|ilang kilo|weight limit/)) return '🚛 Mga available na vehicle:\n'+VEHICLES.map(v=>`• ${v.name.replace('AgriGO ','')} – hanggang ${v.cap.toLocaleString()} kg${v.maxKm?` (≤${v.maxKm} km lang)`:''}`).join('\n');
  if(T(/track|nasaan|saan na|status|subaybay|order ko|delivery ko|asan na/)) return '📍 Para i-track: i-tap ang active delivery bar sa itaas ng bottom bar, o pumunta sa Settings › Order History / Delivery History at buksan ang booking. Dito niyo makikita ang status, rider at pwedeng makipag-chat.';
  if(T(/book|mag-?book|paano mag-?deliver|magpa-?deliver|magpadala|bumili|paano bumili|mag-?order|how to buy/)) return '📦 Paano mag-book ng delivery:\n1. Buksan ang product › Buy / Arrange\n2. Ilagay ang quantity at piliin ang Delivery\n3. I-set ang pickup at destination (pwede ring Current location o Add stop)\n4. Pumili ng vehicle, tapos ng service (Priority / Regular / Pooling / Book for Later)\n5. Ilagay ang details at payment method, i-confirm\n\nPara sa walang product, i-tap ang Delivery sa bottom bar para sa custom parcel.';
  if(T(/pay|bayad|gcash|maya|cod|bank|payment|magbayad/)) return '💳 Payment methods: Cash on Delivery, GCash, Maya at Bank Transfer. Piliin ito sa checkout bago i-confirm ang booking. (Simulated lang ang payments sa prototype na ito – walang totoong pera na gumagalaw.)';
  if(T(/cancel|ikansela|kansel|ayaw na|huwag na ituloy/)) return '❌ Para i-cancel: buksan ang booking (Settings › Delivery History o ang active delivery bar) at i-tap ang Cancel. Pwede lang ito bago ma-pickup ng rider ang order.';
  if(T(/rider|driver|kausapin ang rider|contact.*rider/)) return '🛵 Pagka-assign ng rider, buksan ang booking sa tracking page at i-tap ang Chat with rider. Makikita rin ang rider sa Settings › My Driver.';
  if(T(/point|reward|redeem|voucher|promo|code|refer|invite|kaibigan/)) return '🎁 Rewards: kumita ng points sa bawat delivery at i-redeem sa Settings › Rewards (hal. ₱50 delivery voucher). Sa Refer a Friend, ibigay ang code niyo at kumita ng 100 points bawat sumali.';
  if(T(/address|tirahan|lokasyon ko|edit profile|profile|account|password|pangalan ko|palitan|update/)) return '👤 Settings › My Profile / Edit Profile para baguhin ang pangalan at contact info, at Settings › My Addresses para magdagdag o magbago ng address.';
  if(T(/pickup|pick up|self pickup|kunin ko mismo|pumunta sa seller/)) return '🧺 Pickup: sa Buy / Arrange piliin ang Pickup, saka piliin kung self pickup, own vehicle, authorized representative o meet-up point. Makikita rin ang direksyon papunta sa seller.';
  if(T(/refund|damaged|sira|nasira|problem|problema|reklamo|complain|issue|late|hindi dumating|di dumating|wrong|mali ang|report/)) return '🛠️ Pasensya na po sa abala! Pakisend ang booking reference (hal. AG-XXXX), ano ang nangyari, at photo kung meron. Irerepaso namin ito agad. Para sa urgent delivery issues, i-chat din ang rider mula sa tracking page.';
  if(T(/legit|scam|safe|ligtas|totoo|trusted|real/)) return '🔒 Ang AgriGO ay nag-uugnay sa mga magsasaka, mamimili at riders. Tandaan: demo/prototype ang version na ito, kaya simulated ang payments at walang totoong transaksyon.';
  if(T(/human|agent|tao|totoong tao|tawagan|hotline|email|contact (us|support)/)) return '🙋 Ito ang in-app support namin. Para sa iba pang concern, ilarawan ang problema at ilagay ang booking reference para ma-escalate sa support team.';
  if(T(/hour|oras|open|bukas ba|schedule ng support|available ba kayo/)) return '🕗 Bukas ang in-app chat namin buong araw. Ang delivery ay depende sa availability ng riders; pwede rin ang Book for Later para sa nakaiskedyul na oras.';
  if(T(/ (hi|hello|hey|kumusta|musta|good (am|pm|morning|afternoon|evening)) /)&&raw.trim().split(/\s+/).length<=4) return 'Hello po! 😊 Ako ang AgriGO Support. Pwede niyo akong tanungin tungkol sa cash out, pag-post, delivery rates, booking, payments o tracking.';
  if(T(/ (salamat|thank|thanks|tnx|ty) /)) return 'Walang anuman po! 😊 Narito lang kami kung may iba pa kayong kailangan.';
  if(T(/^ *(ok|okay|sige|noted|opo|yes|oo) *$/)) return 'Sige po! May iba pa po ba kaming matutulungan?';
  return pickN(['Salamat sa pag-message! Hindi ko po sigurado kung ano ang ibig niyong sabihin, pero pwede niyo akong tanungin tungkol sa: cash out, pag-post, delivery rates, booking, payment methods, tracking, rewards o account. 😊','Pasensya na po, pakiulit o pakilinaw ang tanong niyo. Halimbawa: "How to cash out?", "Magkano ang delivery?" o "Paano mag-post?". Kung problema sa order, isama ang booking reference.'],n);
}

/* ---------- 12. SETTINGS ---------- */
const MENU=[['Account',[['profile','user','My Profile'],['editprof','edit','Edit Profile'],['addr','pin','My Addresses'],['contact','phone','Contact Information']]],
 ['Transactions',[['orders','bag','Order History'],['deliveries','truck','Delivery History'],['driver','user','My Driver'],['wallet','wallet','My Wallet'],['myprods','box','My Posted Products']]],
 ['Additional Services',[['rewards','gift','Rewards'],['refer','star','Refer a Friend'],['help','help','Help Center'],['support','chat','Chat Customer Service']]],
 ['Application Settings',[['notif','bell','Notifications'],['privacy','lock','Privacy Settings'],['security','lock','Security'],['lang','globe','Language'],['about','info','About AgriGO'],['terms','doc','Terms and Conditions'],['logout','out','Sign Out']]]];
function viewSettings(){
  const P=DB.profile;
  $('#view').innerHTML=`<div class="page"><div class="pgtitle"><h1>Settings</h1></div>
   <div class="prof"><div class="av">${esc(P.avatar)}</div><div><b style="font-size:17px">${esc(P.name)}</b><div style="opacity:.9;font-size:12.5px">${esc(P.phone)}</div><div style="font-size:12px;margin-top:3px">⭐ ${DB.points} points</div></div></div>
   <div class="qk"><button data-s="wallet"><span>${ic('wallet')}</span><div><small>My Wallet</small><b>${peso(DB.wallet.balance)}</b></div></button><button data-s="myprods"><span>${ic('box')}</span><div><small>Posted products</small><b>${DB.products.filter(x=>x.owner==='me').length} listing(s)</b></div></button></div>
   ${MENU.map(([h,items])=>`<div class="list"><h5>${h}</h5>${items.map(i=>`<button class="li ${i[0]==='logout'?'red':''}" data-s="${i[0]}"><span class="ic">${ic(i[1],'sm')}</span>${i[2]}<span class="ch">${ic('chev','sm')}</span></button>`).join('')}</div>`).join('')}
   <p class="note" style="text-align:center">AgriGO prototype v1.0 · Ani mo, Hatid ko!</p></div>`;
  $$('.li,.qk button').forEach(b=>b.onclick=()=>openSetting(b.dataset.s));
}
const hrows=(arr,fn)=>arr.length?arr.map(fn).join(''):'<div class="empty">Nothing here yet.</div>';
const bkState=b=>b.cancelled?'Cancelled':(b.mode==='pickup'?STATUS_PICK:STATUS_DEL)[b.status];
const bkRow=b=>`<div class="hrow" data-bk="${b.ref}" style="cursor:pointer"><div><b>${esc(b.product.name)}</b><small>${b.ref} · ${dateStr(b.at)}</small><small>${bkState(b)}</small></div><b>${peso(b.total)}</b></div>`;
function toggleRows(keys){ return `<div class="list">${keys.map(([k,l])=>`<div class="li" data-t="${k}">${l}<span class="tog ${DB.prefs[k]?'on':''}"></span></div>`).join('')}</div>`; }
function openSetting(k){
  if(k==='wallet') return go('wallet'); if(k==='myprods') return go('myprods');
  const P=DB.profile; let title=MENU.flatMap(m=>m[1]).find(i=>i[0]===k)[2], html='', after=null;
  switch(k){
   case 'profile': html=`<div class="card"><div class="drv"><div class="av" style="width:64px;height:64px;font-size:24px">${esc(P.avatar)}</div><div><b style="font-size:17px">${esc(P.name)}</b><div class="note" style="margin:0">AgriGO member</div></div></div></div><div class="card sum"><div><span>Phone</span><span>${esc(P.phone)}</span></div><div><span>Email</span><span>${esc(P.email||'—')}</span></div><div><span>Orders</span><span>${DB.bookings.length}</span></div><div><span>Listings</span><span>${DB.products.filter(p=>p.owner==='me').length}</span></div></div>`; break;
   case 'editprof': case 'contact': html=`<div class="card">${k==='editprof'?fld('en','Full name *',P.name):''}${fld('ep','Phone number *',P.phone,{type:'tel'})}${fld('ee','Email',P.email,{type:'email'})}</div><button class="btn" id="sv">Save</button>`;
     after=()=>$('#sv').onclick=()=>{ const ok=[k==='contact'||check('en',v=>v.length>=2,'Enter your name'),check('ep',v=>/^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g,'')),'Enter a valid PH mobile number'),check('ee',v=>!v||/^\S+@\S+\.\S+$/.test(v),'Enter a valid email')].every(Boolean); if(!ok) return;
       if(k==='editprof'){P.name=$('#en').value.trim();P.avatar=initials(P.name);} P.phone=$('#ep').value.trim();P.email=$('#ee').value.trim(); save(); closeSheet(); toast('Profile saved'); viewSettings(); }; break;
   case 'addr': html=`<div id="al"></div><div class="card"><h3>Add address</h3>${fld('al1','Label (Home, Farm…)','',{})}${fld('al2','Full address','',{area:1})}<button class="btn" id="aa">Save address</button></div>`;
     after=()=>{ const d=()=>{ $('#al').innerHTML=hrows(DB.addresses,(a,i)=>`<div class="card hrow" style="margin-bottom:8px"><div><b>${esc(a.label)}</b><small>${esc(a.addr)}</small></div>${i?`<button class="mini" data-d="${i}" aria-label="Delete">${ic('trash','sm')}</button>`:''}</div>`); $$('#al [data-d]').forEach(b=>b.onclick=()=>{DB.addresses.splice(+b.dataset.d,1);save();d();}); }; d();
       $('#aa').onclick=async()=>{ if(!check('al1',v=>v.length>=2,'Enter a label')|!check('al2',v=>v.length>=5,'Enter the address')) return; let g=HOME_ADDR; try{const j=await geocode($('#al2').value); if(j[0]) g={lat:j[0].lat,lng:j[0].lng};}catch(e){} DB.addresses.push({label:$('#al1').value.trim(),addr:$('#al2').value.trim(),lat:g.lat,lng:g.lng}); save(); toast('Address added'); openSetting('addr'); }; }; break;
   case 'orders': html=hrows(DB.bookings,bkRow); break;
   case 'deliveries': html=hrows(DB.bookings.filter(b=>b.mode==='delivery'),bkRow); break;
   case 'driver': { const list=DB.bookings.filter(b=>b.driver).sort((x,y)=>isActive(y)-isActive(x));
     html='<p class="note" style="margin:0 0 10px">Riders assigned to your delivery bookings. Sellers are shown separately on each booking.</p>'+hrows(list,b=>`<div class="card" data-bk="${b.ref}" style="cursor:pointer;margin-bottom:8px"><div class="drv"><div class="av ${isActive(b)?'on':''}">${initials(b.driver.name)}</div><div style="flex:1"><b>${b.driver.name}</b><div class="note" style="margin:0">★ ${b.driver.rating} · ${b.driver.plate} · ${esc(b.vehicle||'')}</div><div class="note" style="margin:0">${b.ref} · ${esc(b.product.name)}</div></div><span class="badge ${b.cancelled?'high':isActive(b)?'near':'good'}">${bkState(b)}</span></div></div>`); break; }
   case 'myprods': html=hrows(DB.products.filter(p=>p.owner==='me'),p=>`<div class="hrow"><div><b>${esc(p.name)}</b><small>${peso(p.price)}/${esc(p.unit)} · ${p.qty} left</small></div><div class="acts"><button class="mini" data-e="${p.id}" aria-label="Edit">${ic('edit','sm')}</button><button class="mini" data-x="${p.id}" aria-label="Delete">${ic('trash','sm')}</button></div></div>`);
     after=()=>{ $$('[data-e]').forEach(b=>b.onclick=()=>go('create',b.dataset.e)); $$('[data-x]').forEach(b=>b.onclick=()=>{ if(confirm('Delete this listing?')){DB.products=DB.products.filter(p=>p.id!==b.dataset.x);save();toast('Listing deleted');openSetting('myprods');}}); }; html+=`<button class="btn" style="margin-top:12px" onclick="hist=[];go('create')">+ New listing</button>`; break;
   case 'rewards': html=`<div class="pts"><small>Your points</small><b>${DB.points}</b></div><div class="sec"><h3>Redeem</h3></div>${[['₱50 delivery voucher',200],['Free pooling delivery',350],['₱150 off bulk order',500]].map(r=>`<div class="card hrow" style="margin-bottom:8px"><div><b>${r[0]}</b><small>${r[1]} pts</small></div><button class="btn sm" data-r="${r[1]}" data-n="${r[0]}" ${DB.points<r[1]?'disabled':''}>Redeem</button></div>`).join('')}<div class="sec"><h3>History</h3></div><div class="card">${hrows(DB.ptsLog,l=>`<div class="hrow"><div><b>${esc(l.t)}</b><small>${dateStr(l.at)}</small></div><b style="color:${l.p>0?'var(--g)':'var(--bad)'}">${l.p>0?'+':''}${l.p}</b></div>`)}</div>`;
     after=()=>$$('[data-r]').forEach(b=>b.onclick=()=>{ DB.points-=+b.dataset.r; DB.ptsLog.unshift({t:'Redeemed: '+b.dataset.n,p:-b.dataset.r,at:Date.now()}); save(); toast('Reward redeemed (sample)'); openSetting('rewards'); }); break;
   case 'refer': html=`<div class="card" style="text-align:center"><div style="font-size:42px">🎁</div><b>Invite a friend, earn 100 points</b><div class="code">${DB.code}</div><button class="btn" id="cp">Copy code</button></div>`;
     after=()=>$('#cp').onclick=async()=>{ try{await navigator.clipboard.writeText(DB.code);}catch(e){const t=document.createElement('textarea');t.value=DB.code;document.body.append(t);t.select();document.execCommand('copy');t.remove();} toast('Referral code copied!'); }; break;
   case 'help': html=[['How do I book a delivery?','Open a product, tap Buy / Arrange, choose Delivery, set your destination and pick a vehicle.'],['How are fees computed?','Base fare + per-km charge for the chosen vehicle, adjusted by the service type and extra stops. Sample rates only.'],['Can I sell my produce?','Yes – tap the + button to publish a listing.'],['How do I pick up an order?','Choose Pickup after tapping Buy / Arrange and collect from the seller.']].map(f=>`<details class="card"><summary style="font-weight:700">${f[0]}</summary><p style="margin-top:8px;color:var(--mute)">${f[1]}</p></details>`).join(''); break;
   case 'support': return openSupport();
   case 'notif': html=toggleRows([['push','Push notifications'],['order','Order & delivery updates'],['promo','Promotions']]); break;
   case 'privacy': html=toggleRows([['loc','Share location for delivery'],['ads','Personalised offers']]); break;
   case 'security': html=toggleRows([['twofa','Two-step verification (demo)']])+'<p class="note">Prototype only – no real authentication is performed.</p>'; break;
   case 'lang': html=['English','Filipino'].map(l=>`<button class="svc ${DB.lang===l?'on':''}" data-l="${l}"><div class="t"><b>${l}</b></div></button>`).join('')+'<p class="note">Language preference is saved; full translation is not part of this prototype.</p>';
     after=()=>$$('[data-l]').forEach(b=>b.onclick=()=>{DB.lang=b.dataset.l;save();toast('Language: '+DB.lang);openSetting('lang');}); break;
   case 'about': html=`<div class="card" style="text-align:center"><img src="assets/logo.jpg" alt="AgriGO" style="margin:0 auto 10px;max-width:240px"><p>AgriGO connects farmers, suppliers and buyers through a marketplace and branded delivery fleet. <b>Ani mo, Hatid ko!</b></p><p class="note">Version 1.0 prototype</p></div>`; break;
   case 'terms': html='<div class="card"><p>This is a prototype. Prices, market references, drivers and payments are samples for demonstration only. No real transactions are processed and no payment data is collected.</p></div>'; break;
   case 'logout': Auth.confirmSignOut(); return;
  }
  openSheet(title,html,s=>{
    $$('[data-t]',s).forEach(r=>r.onclick=()=>{ const t=r.dataset.t; DB.prefs[t]=!DB.prefs[t]; $('.tog',r).classList.toggle('on',DB.prefs[t]); save(); });
    $$('[data-bk]',s).forEach(r=>r.onclick=()=>go('track',r.dataset.bk));
    after&&after();
  });
}

/* ---------- WALLET, SALES & MY POSTED PRODUCTS ---------- */
const BUYERS=['Maria Santos','Jun Dela Cruz','Liza Ramos','Carlo Reyes','Ana Bautista','Nelson Garcia','Grace Villanueva'];
const FEE_RATE=.05, MIN_CASHOUT=100, r2=n=>Math.round(n*100)/100;
// A buyer purchases (part of) one of the user's listings: stock goes down, earnings go to the wallet
function recordSale(p,qty,buyer){
  qty=Math.min(qty,p.qty); if(qty<=0) return null;
  const gross=r2(p.price*qty), fee=r2(gross*FEE_RATE), net=r2(gross-fee);
  p.qty=r2(p.qty-qty); p.sold=r2((p.sold||0)+qty); DB.wallet.balance=r2(DB.wallet.balance+net);
  DB.wallet.tx.unshift({id:'t'+Date.now()+Math.random().toString(36).slice(2,5),type:'sale',pid:p.id,title:`${p.name} × ${qty} ${p.unit}`,buyer,gross,fee,amount:net,at:Date.now()});
  pushNotif('New sale 🎉',`${buyer} bought ${qty} ${p.unit} of ${p.name}. +${peso(net)} added to your wallet.`);
  if(p.qty<=0) pushNotif('Sold out',`${p.name} is sold out and was removed from the product listing.`);
  else if(stockState(p)[0]==='low') pushNotif('Low stock ⚠️',`${p.name} has only ${p.qty} ${p.unit} left.`);
  save(); return {qty,net};
}
function simulateSale(pid){
  const p=prod(pid); if(!p||p.owner!=='me'||p.qty<=0) return toast('Nothing left to sell',true);
  const q=Math.max(1,Math.min(p.qty,Math.round(p.qty*(.1+Math.random()*.3))));
  const r=recordSale(p,q,BUYERS[Math.floor(Math.random()*BUYERS.length)]); if(!r) return;
  toast(`New sale! +${peso(r.net)} added to wallet`);
  if(cur.v==='myprod'&&cur.a===pid) viewMyProd(); else if(cur.v==='wallet') viewWallet(); else if(cur.v==='myprods') viewMyProds();
  else if(cur.v==='home'){ drawLocFilter(); drawGrid(); } else updNav();
}
const txRow=t=>{ const sale=t.type==='sale'; return `<div class="tx"><span class="ti ${sale?'up':'dn'}">${ic(sale?'plus2':'out','sm')}</span><div class="t"><b>${esc(t.title)}</b><small>${sale?`Buyer: ${esc(t.buyer)} · fee ${peso(t.fee)}`:`${esc(t.acct||'')} · ${esc(t.status||'')}`}</small><small>${dateStr(t.at)} · ${clock(t.at)}</small></div><b class="${sale?'pos':'neg'}">${sale?'+':'−'}${peso(Math.abs(t.amount))}</b></div>`; };
let walTab='all';
function viewWallet(){
  const W=DB.wallet, sales=W.tx.filter(t=>t.type==='sale'), outs=W.tx.filter(t=>t.type==='cashout');
  const list=walTab==='all'?W.tx:walTab==='sale'?sales:outs;
  $('#view').innerHTML=`<div class="page">${pageHead('My Wallet')}
   <div class="wal"><small>Available balance</small><h2>${peso(W.balance)}</h2>
    <div class="wst"><div><b>${peso(sales.reduce((a,t)=>a+t.amount,0))}</b><span>Total earned</span></div><div><b>${peso(-outs.reduce((a,t)=>a+t.amount,0))}</b><span>Cashed out</span></div><div><b>${sales.length}</b><span>Sales</span></div></div>
    <button class="btn" id="co" style="background:#fff;color:var(--dark)">${ic('out','sm')}Cash Out</button></div>
   <div class="chips" id="wt" style="margin-bottom:0">${[['all','All'],['sale','Sales'],['cashout','Cash-outs']].map(([k,l])=>`<button class="chip ${walTab===k?'on':''}" data-t="${k}">${l}</button>`).join('')}</div>
   <div class="card" style="padding:4px 14px">${list.length?list.map(txRow).join(''):`<div class="empty"><div class="big">👛</div>No transactions yet.<br>When buyers purchase the products you post, your earnings are listed here.</div>`}</div>
   <p class="note">Prototype only: sales are simulated and no real money moves. A ${FEE_RATE*100}% AgriGO service fee is deducted from each sale.</p></div>`;
  $$('#wt .chip').forEach(b=>b.onclick=()=>{walTab=b.dataset.t;viewWallet();}); $('#co').onclick=openCashout;
}
function openCashout(){
  const W=DB.wallet; if(W.balance<MIN_CASHOUT) return toast(`Minimum cash out is ${peso(MIN_CASHOUT)}. Your balance is ${peso(W.balance)}.`,true);
  let m='GCash';
  openSheet('Cash Out',`<div class="card" style="text-align:center"><div class="note" style="margin:0">Available balance</div><h2 style="color:var(--dark);font-size:26px">${peso(W.balance)}</h2></div>
   <div class="card">${fld('ca','Amount (₱) *','',{type:'number',ph:'Minimum '+peso(MIN_CASHOUT),attr:'min="100" step="0.01" inputmode="decimal"'})}<button class="chip" id="cmax" type="button" style="margin:-6px 0 12px">Cash out all</button>
    <div class="fld"><label>Send to</label><div class="chips" id="cm" style="padding:0;margin:0"></div></div>
    ${fld('cnm','Account name *',DB.profile.name)}<div id="cbk"></div>${fld('cc','Mobile number *',DB.profile.phone,{type:'tel'})}</div>
   <button class="btn" id="cgo">Confirm Cash Out</button><p class="note">Demo only – no real transfer is made.</p>`,()=>{
    const drawM=()=>{ $('#cm').innerHTML=['GCash','Maya','Bank Transfer'].map(x=>`<button class="chip ${m===x?'on':''}" data-m="${x}" type="button">${x}</button>`).join('');
      $('label[for=cc]').textContent=m==='Bank Transfer'?'Bank account number *':'Mobile number *';
      $('#cbk').innerHTML=m==='Bank Transfer'?fld('cb','Bank name *',''):'';
      $$('#cm .chip').forEach(b=>b.onclick=()=>{m=b.dataset.m;const v=$('#cc').value;drawM();$('#cc').value=m==='Bank Transfer'?'':DB.profile.phone;}); }; drawM();
    $('#cmax').onclick=()=>{ $('#ca').value=W.balance; };
    $('#cgo').onclick=()=>{
      const ok=[check('ca',v=>+v>=MIN_CASHOUT&&+v<=W.balance,`Enter ${peso(MIN_CASHOUT)} to ${peso(W.balance)}`),check('cnm',v=>v.length>=2,'Enter the account name'),
        m==='Bank Transfer'?(check('cb',v=>v.length>=2,'Enter the bank name')&check('cc',v=>/^\d{8,16}$/.test(v.replace(/\s/g,'')),'Enter 8–16 digits')):check('cc',v=>/^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g,'')),'Enter a valid PH mobile number')].every(Boolean);
      if(!ok) return toast('Please fix the highlighted fields',true);
      const amt=r2(+$('#ca').value), acct=$('#cc').value.trim(); W.balance=r2(W.balance-amt);
      W.tx.unshift({id:'t'+Date.now(),type:'cashout',title:'Cash out to '+m,acct:'••••'+acct.replace(/\D/g,'').slice(-4),amount:-amt,status:'Processing (demo)',at:Date.now()});
      pushNotif('Cash out requested',`${peso(amt)} to ${m} is being processed (demo).`); save(); closeSheet(); toast(`Cash out of ${peso(amt)} requested`); if(cur.v==='wallet') viewWallet();
    };
  });
}
function viewMyProds(){
  const mine=DB.products.filter(p=>p.owner==='me').sort((a,b)=>b.posted-a.posted);
  $('#view').innerHTML=`<div class="page">${pageHead('My Posted Products')}
   <div class="rinfo"><div><b>${mine.length}</b><span>Listings</span></div><div><b>${mine.filter(p=>p.qty>0).length}</b><span>On sale</span></div><div><b>${mine.reduce((a,p)=>a+(p.sold||0),0)}</b><span>Units sold</span></div></div>
   ${mine.length?mine.map(p=>{ const st=stockState(p), pct=Math.max(0,Math.min(100,p.qty/(p.initQty||p.qty||1)*100));
     return `<button class="mp" data-id="${p.id}"><div class="th2">${photo(p)?`<img src="${photo(p)}" alt="">`:ic('leaf')}</div><div class="t"><b>${esc(p.name)}</b><small>${peso(p.price)} / ${esc(p.unit)} · ${esc(p.loc)}</small><div class="bar2 ${st[0]}"><i style="width:${pct}%"></i></div><small>${p.qty} of ${p.initQty||p.qty} ${esc(p.unit)} left · ${p.sold||0} sold</small></div><span class="badge ${st[0]==='out'?'high':st[0]==='low'?'near':'good'}">${st[0]==='out'?'Sold out':st[0]==='low'?'Low':'Live'}</span></button>`; }).join(''):
     `<div class="empty"><div class="big">🌱</div>You haven’t posted any products yet.<br>Tap the button below to sell your harvest.</div>`}
   <div class="sticky"><button class="btn" id="np">${ic('plus','sm')}Post a new product</button></div></div>`;
  $$('.mp').forEach(b=>b.onclick=()=>go('myprod',b.dataset.id)); $('#np').onclick=()=>{ hist=[]; go('create'); };
}
function viewMyProd(){
  const p=prod(cur.a); if(!p||p.owner!=='me') return back();
  const st=stockState(p), pct=Math.max(0,Math.min(100,p.qty/(p.initQty||p.qty||1)*100)), sales=DB.wallet.tx.filter(t=>t.pid===p.id), earned=sales.reduce((a,t)=>a+t.amount,0);
  const imgs=p.images||[];
  $('#view').innerHTML=`<div class="page">${pageHead('Product Details')}
   <div class="pimg">${ic('leaf','ph')}${pimg(p)}</div>
   <div class="card" style="margin-top:-18px;position:relative;border-radius:20px 20px var(--r) var(--r)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><h2 style="font-size:20px">${esc(p.name)}</h2><span class="badge ${st[0]==='out'?'high':st[0]==='low'?'near':'good'}">${st[1]}</span></div>
    <div class="price" style="font-size:22px">${peso(p.price)} <small>per ${esc(p.unit)}</small></div><p style="margin-top:8px;color:#37483d">${esc(p.desc)}</p></div>
   ${imgs.length>1?`<div class="imgs" style="margin-bottom:12px">${imgs.map(s=>`<div class="th"><img src="${s}" alt=""></div>`).join('')}</div>`:''}
   <div class="card"><h3>Stock</h3><div class="bar2 big ${st[0]}"><i style="width:${pct}%"></i></div><div class="cmp"><span>Remaining</span><b>${p.qty} ${esc(p.unit)}</b></div><div class="cmp"><span>Initial stock</span><b>${p.initQty||p.qty} ${esc(p.unit)}</b></div><div class="cmp"><span>Units sold</span><b>${p.sold||0} ${esc(p.unit)}</b></div><div class="cmp"><span>Low-stock alert at</span><b>${lowAt(p)} ${esc(p.unit)}</b></div><div class="cmp"><span>Earned (after fees)</span><b style="color:var(--g)">${peso(earned)}</b></div>
    <p class="note">${p.qty<=0?'Sold out – this product is hidden from the Home listing. Edit the stock to list it again.':'Live on the Home listing. It is removed automatically when stock reaches 0.'}</p></div>
   <div class="card"><h3>All details</h3><dl class="spec"><dt>Listing ID</dt><dd>${esc(p.id)}</dd><dt>Category</dt><dd>${esc(p.cat)}</dd><dt>Condition</dt><dd>${esc(p.cond||'—')}</dd><dt>Unit</dt><dd>${esc(p.unit)}</dd><dt>Price per unit</dt><dd>${peso(p.price)}</dd><dt>Minimum order</dt><dd>${p.minOrder?p.minOrder+' '+esc(p.unit):'None'}</dd><dt>Bulk pricing</dt><dd>${esc(p.bulk||'None')}</dd><dt>Harvest date</dt><dd>${p.harvest?dateStr(p.harvest):'—'}</dd><dt>Fulfilment</dt><dd>${{both:'Delivery & Pickup',delivery:'Delivery only',pickup:'Pickup only'}[p.delivery]}</dd><dt>Seller / farm</dt><dd>${esc(p.seller)}</dd><dt>Contact</dt><dd>${esc(p.phone)}</dd><dt>Location</dt><dd>${esc(p.loc)}</dd><dt>Date posted</dt><dd>${dateStr(p.posted)}</dd></dl></div>
   <div class="card"><h3>Sales history</h3>${sales.length?sales.map(txRow).join(''):'<p class="note" style="margin:0">No sales yet. Buyers’ orders appear here and in your wallet.</p>'}</div>
   <div class="acts" style="margin-bottom:10px"><button class="btn out" id="vh">${ic('home','sm')}View on Home</button><button class="btn out" id="sim" ${p.qty<=0?'disabled':''}>Simulate order</button></div>
   <div class="acts"><button class="btn out" id="ed">${ic('edit','sm')}Edit</button><button class="btn bad" id="del">${ic('trash','sm')}Delete</button></div>
   <p class="note" style="text-align:center">“Simulate order” is a demo of a buyer purchasing this product.</p></div>`;
  $('#vh').onclick=()=>go('detail',p.id); $('#sim').onclick=()=>simulateSale(p.id); $('#ed').onclick=()=>go('create',p.id);
  $('#del').onclick=()=>{ if(!confirm(`Delete “${p.name}”? It will also be removed from the product listing.`)) return; DB.products=DB.products.filter(x=>x.id!==p.id); save(); toast('Product deleted and removed from the listing'); back(); };
}

/* ---------- INIT ---------- */
load(); save(); updNav(); render(); loadPhotos(); setInterval(pendingTick,1000);
window.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!bookingBusy) closeSheet(); });
