export const $=id=>document.getElementById(id);
export const num=n=>Number(n).toLocaleString('en-CA');
export function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
export function link(text,href){const a=el('a',text);a.href=href;return a;}
export function select(id,options){$(id).replaceChildren(...options.map(([v,t])=>new Option(t,v)));}
export async function load(name){const r=await fetch('./data/'+name+'.json');if(!r.ok)throw Error(name+' could not be loaded');return r.json();}
export function fail(){ $('status').textContent='Could not open the saved edition. Reload to try again or use the original sources below.'; }
