import {$,el,num,load,select,fail} from './ui.mjs';
import {locate,matching,counts} from './model.mjs';
const regions={BC:'British Columbia',NS:'Nova Scotia',AB:'Alberta',SK:'Saskatchewan',MB:'Manitoba',ON:'Ontario',QC:'Québec',NB:'New Brunswick',PE:'Prince Edward Island',NL:'Newfoundland and Labrador',YT:'Yukon',NT:'Northwest Territories',NU:'Nunavut'};
let data=[],i=0,region='BC',shapes={};
function mapSelection(rows,metric){
  const map=$('map');
  map.setAttribute('viewBox','0 0 '+shapes.width+' '+shapes.height);
  const info=()=>{
    const chosen=rows.find(r=>r[0]===region);
    $('mapDetail').textContent=regions[region]+' · '+num(chosen[1])+' transmitter records · '+num(chosen[2])+' distinct coordinates';
    for(const node of map.querySelectorAll('path'))node.setAttribute('aria-pressed',String(node.dataset.region===region));
  };
  const features=rows.map(([k,n,c])=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path'),title=document.createElementNS('http://www.w3.org/2000/svg','title');
    const v=metric?c:n, fraction=Math.sqrt(v/Math.max(1,rows[0][1+metric]));
    path.setAttribute('d',shapes.paths[k]);path.setAttribute('fill',v?'hsl(182 41% '+(88-61*fraction)+'%)':'#f3f2eb');path.setAttribute('fill-rule','evenodd');
    path.setAttribute('role','button');path.setAttribute('tabindex','0');path.dataset.region=k;
    title.textContent=regions[k]+' · '+num(n)+' TX rows · '+num(c)+' coordinates';path.setAttribute('aria-label',title.textContent);path.append(title);
    path.onclick=()=>{region=k;info();};
    path.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();region=k;info();}};return path;
  });map.replaceChildren(...features);info();
}
function populate(){
  const found=matching(data,$('query').value);select('bands',found.map(n=>[String(n),data[n].label]));
  if(!found.length){$('notice').textContent='No allocation matches that search. The last selected band is displayed below.';return;}
  $('notice').textContent=num(found.length)+' matching bands';
  if(!found.includes(i))i=found[0];
  $('bands').value=i;draw();
}
function choose(newIndex){
  i=newIndex;$('query').value='';populate();$('unit').value='MHz';$('freq').value=data[i].low/1000;
}
function draw(){
  const b=data[i];$('band').textContent=b.label;$('services').replaceChildren(...b.services.split(';').map(s=>el('li',s.trim())));
  const metric=Number($('scale').value),rows=counts(b,regions,metric);
  $('tx').textContent=num(rows.reduce((a,r)=>a+r[1],0));
  $('sites').textContent=num(rows.reduce((a,r)=>a+r[2],0))+' distinct coordinate pairs counted within regions';
  mapSelection(rows,metric);
  $('rows').replaceChildren(...rows.map(([k,n,c])=>{
    const tr=el('tr'),name=el('td',regions[k]),bar=el('span',undefined,'bar');
    bar.style.width=100*(metric?c:n)/Math.max(1,rows[0][1+metric])+'%';name.append(bar);tr.append(name,el('td',num(n)),el('td',num(c)));return tr;
  }));
  $('lower').disabled=i<=0;$('higher').disabled=i>=data.length-1;
}
function findBand(){
  const n=locate(data,$('freq').value,$('unit').value);
  if(n<0){$('notice').textContent='Enter a frequency from 0 kHz up to, but excluding, 300 GHz.';return;}
  i=n;$('query').value='';populate();$('notice').textContent='Frequency falls within '+data[i].label;
}
async function start(){
 const [bands,s,geometry]=await Promise.all([load('bands'),load('status'),load('regions')]);data=bands;shapes=geometry;
 $('status').textContent=s.table+' allocation table · '+num(s.count)+' bands · Site extract '+s.edition+' · Retrieved '+s.retrieved;
 $('skips').textContent='The import counted '+num(s.assignment_count)+' transmitter rows. Exclusions by reason: '+Object.entries(s.skipped).map(([k,v])=>k+' ('+num(v)+')').join(', ')+'. Coordinate counts use distinct published pairs within each band and province or territory.';
 $('query').oninput=populate;$('find').onclick=findBand;$('freq').onkeydown=e=>{if(e.key==='Enter')findBand();};
 $('bands').onchange=()=>{i=Number($('bands').value);$('freq').value=data[i].low/1000;$('unit').value='MHz';draw();};$('scale').onchange=draw;
 $('lower').onclick=()=>choose(i-1);$('higher').onclick=()=>choose(i+1);findBand();
}
start().catch(fail);
