export function locate(bands,value,unit) {
  if(String(value).trim()==='')return -1;
  const n=Number(value)*({kHz:1,MHz:1000,GHz:1000000}[unit]);
  return Number.isFinite(n)?bands.findIndex(b=>b.low<=n && n<b.high):-1;
}
export function matching(bands,term) {
  const q=term.trim().toLowerCase();
  return bands.map((b,i)=>[b,i]).filter(([b])=>(b.services+' '+b.label).toLowerCase().includes(q)).map(([,i])=>i);
}
export function counts(band,regions,metric) {
  return Object.keys(regions).map(k=>[k,...(band.regions[k]||[0,0])]).sort((a,b)=>b[1+metric]-a[1+metric]||regions[a[0]].localeCompare(regions[b[0]]));
}
