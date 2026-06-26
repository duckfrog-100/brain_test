// API 상태 필터, 날짜 필터 및 산출기준 표시 패치
function apiStatusForFilterPatched(api){ return api && api.status ? api.status : 'API 결과 없음'; }
function formatDateForFilter(date){ return String(date||'').slice(5).replace('-','/'); }
function dateLabel(r){ return `${formatDateForFilter(r.date)} (${r.day})`; }
function fillDateFilter(){
  const el = $('dateFilter');
  if(!el || el.dataset.ready === '1') return;
  const dates = [...new Map(ROOMS.map(r=>[r.date, dateLabel(r)])).entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  dates.forEach(([date,label])=>el.insertAdjacentHTML('beforeend',`<option value="${esc(date)}">${esc(label)}</option>`));
  el.dataset.ready = '1';
}
function apiRuleText(api){
  if(!api) return 'API 매칭 결과 없음 → API 결과 없음';
  const note = api.note || '';
  if(note.includes('정확 일치')) return '비고에 정확 일치 포함 → 사용 가능';
  if(note.includes('부분 일치')) return '비고에 부분 일치 포함 → 대체로 사용 가능, 확인 권장';
  if(note.includes('유사도 매칭')) return '비고에 유사도 매칭 포함 → 확인 필요';
  if(note.includes('객실 등급만 매칭')) return '비고에 객실 등급만 매칭 포함 → 공식 홈페이지 검증 필요';
  if(note.includes('객실명 매칭 실패')) return '비고에 객실명 매칭 실패 포함 → 사용하지 않는 게 안전';
  if(note.includes('객실 상세정보 없음')) return '비고에 객실 상세정보 없음 포함 → 별도 수집 필요';
  if(note.includes('숙소 검색 결과 없음')) return '비고에 숙소 검색 결과 없음 포함 → 별도 수집 필요';
  return '기타 → 확인 필요';
}
function filtered(){
 const q=$('q').value.trim().toLowerCase(), reg=$('region').value, br=$('brand').value, cap=Number($('cap').value||0), vf=$('verified').value, df=($('dateFilter')?.value||'');
 return ROOMS.filter(r=>{
  const api=getApiInfo(r);
  const displayMax = isUsableApi(api) ? Number(api.maxGuests) : Number(r.maxGuests||0);
  const txt=[r.no,r.resort,r.roomType,r.city,r.region,r.brand,r.date,formatDateForFilter(r.date),r.day,api?.apiRoomName,api?.note,api?.status,api?.usability,apiRuleText(api)].join(' ').toLowerCase();
  return (!q||txt.includes(q)) && (!df||r.date===df) && (!reg||r.region===reg) && (!br||r.brand===br) && (!cap||displayMax>=cap) && (!vf||apiStatusForFilterPatched(api)===vf);
 });
}
function openModal(no){
 const r=ROOMS.find(x=>x.no===no); if(!r) return;
 const q=officialQueries(r);
 const api=getApiInfo(r);
 const apiImage = hasApiImage(api) ? `<img class="api-img" src="${esc(api.imageUrl)}" alt="${esc(api.apiRoomName || r.resort)} 객실 이미지" onerror="this.style.display='none'">` : '';
 const apiPanel = api ? `<h3>한국관광공사 API 매칭</h3>${apiImage}<div class="grid"><div><label>매칭상태</label><b>${esc(api.status)}</b></div><div><label>사용 가능 여부</label><b>${esc(api.usability)}</b></div><div><label>상태 산출 기준</label><b>${esc(apiRuleText(api))}</b></div><div><label>contentid</label><b>${esc(api.contentid)}</b></div><div><label>매칭된 숙소명</label><b>${esc(api.matchedHotel)}</b></div><div><label>API 객실명</label><b>${esc(api.apiRoomName || '정보 없음')}</b></div><div><label>API 기준/최대</label><b>${esc(api.baseGuests)} / ${esc(api.maxGuests)}</b></div><div><label>숙소/객실 점수</label><b>${esc(api.hotelScore)} / ${esc(api.roomScore)}</b></div><div><label>비고</label><b>${esc(api.note)}</b></div></div>` : `<h3>한국관광공사 API 매칭</h3><p class="hint">해당 객실은 API 매칭 결과가 없습니다.</p><p class="hint">상태 산출 기준: ${esc(apiRuleText(api))}</p>`;
 $('modalBody').innerHTML=`<h2>${esc(r.resort)}</h2><p class="sub">${esc(r.city)} · ${esc(r.roomType)}</p><div class="grid"><div><label>일정</label><b>${esc(r.date)} (${esc(r.day)}) · ${r.nights}박</b></div><div><label>요금</label><b>${money(r.price)}</b></div><div><label>자동추정 기준/최대</label><b>${r.baseGuests||'?'}인 / ${r.maxGuests||'?'}인</b></div><div><label>인원추가비</label><b>${esc(r.extraGuestFee)}</b></div><div><label>평수/등급</label><b>${esc(r.sizeHint)}</b></div><div><label>매핑 근거</label><b>${esc(r.capacityRule)}</b></div></div>${apiPanel}<div class="actions">${r.brandHomeUrl?`<a href="${esc(r.brandHomeUrl)}" target="_blank">공식 홈페이지</a>`:''}${hasApiImage(api)?`<a href="${esc(api.imageUrl)}" target="_blank">API 객실이미지</a>`:''}<a href="${searchUrl(q.officialRoom,'web')}" target="_blank">공식 객실 페이지 찾기</a><a href="${searchUrl(q.officialImage,'duck')}" target="_blank">공식 홈페이지 이미지</a><a href="${searchUrl(q.capacity,'web')}" target="_blank">정원 확인</a><a href="${searchUrl(q.extraFee,'web')}" target="_blank">인원추가비 확인</a></div><p class="hint">API 검증필요·확인필요·미사용권장 항목은 확정 정원으로 사용하지 마세요. 최종 신청 전 공식 홈페이지 확인이 필요합니다.</p>`;
 $('modal').classList.add('open'); document.body.style.overflow='hidden';
}
const originalResetFilters = resetFilters;
resetFilters = function(){ ['q','region','brand','cap','verified','dateFilter'].forEach(id=>{ if($(id)) $(id).value=''; }); render(); }
fillDateFilter();
render();