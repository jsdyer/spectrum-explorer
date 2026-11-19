import test from 'node:test';import assert from 'node:assert/strict';import {locate,counts,matching} from '../web/model.mjs';
const b=[{low:0,high:1000,label:'0–1 MHz',services:'FIXED',regions:{BC:[17,2]}},{low:1000,high:2000,label:'1–2 MHz',services:'MOBILE',regions:{}}];
test('Half-open bounds and compatible units',()=>{assert.equal(locate(b,1,'MHz'),1);assert.equal(locate(b,.001,'GHz'),1);assert.equal(locate(b,'','MHz'),-1);assert.equal(locate(b,2,'MHz'),-1);});
test('Service search and empty regions',()=>{assert.deepEqual(matching(b,'mob'),[1]);assert.deepEqual(counts(b[0],{NS:'Nova Scotia',BC:'British Columbia'},1),[['BC',17,2],['NS',0,0]]);});
