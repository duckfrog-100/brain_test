function currentApiStatus(api){return api&&api.status?api.status:'API 결과 없음'}
function addNightFilter(){
  if(document.getElementById('nightFilter')) return;
  const d=document.getElementById('dateFilter');
  if(!d) return;
  const s=document.createElement('select');
  s.id='nightFilter';
  [['','박수 전체'],['1','1박'],['2','2박'],['3','3박']].forEach(x=>{const o=document.createElement('option');o.value=x[0];o.textContent=x[1];s.appendChild(o)});
  d.insertAdjacentElement('afterend',s);
}
function getFilters(){return{
  q:(document.getElementById('q')?.value||'').trim().toLowerCase(),
  date:document.getElementById('dateFilter')?.value||'',
  nights:document.getElementById('nightFilter')?.value||'',
  region:document.getElementById('region')?.value||'',
  brand:document.getElementById('brand')?.value||'',
  cap:Number(document.getElementById('cap')?.value||0),
  api:document.getElementById('verified')?.value||''
}}
filtered=function(){
  const f=getFilters();
  return ROOMS.filter(r=>{
    const api=getApiInfo(r);
    const max=isUsableApi(api)?Number(api.maxGuests):Number(r.maxGuests||0);
    const text=[r.no,r.resort,r.roomType,r.city,r.region,r.brand,r.date,r.day,r.nights,api?.apiRoomName,api?.note,api?.status,api?.usability].join(' ').toLowerCase();
    return (!f.q||text.includes(f.q))&&(!f.date||r.date===f.date)&&(!f.nights||String(r.nights)===f.nights)&&(!f.region||r.region===f.region)&&(!f.brand||r.brand===f.brand)&&(!f.cap||max>=f.cap)&&(!f.api||currentApiStatus(api)===f.api)
  })
}
resetFilters=function(){['q','dateFilter','nightFilter','region','brand','cap','verified'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});render()}
addNightFilter();
['q','dateFilter','nightFilter','region','brand','cap','verified'].forEach(id=>{const e=document.getElementById(id);if(e){e.onchange=render;e.oninput=render}});
render();