"""Join Canadian frequency allocations to counts of published terrestrial TX centres."""
from bisect import bisect_right
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
import argparse
import csv
import html
import io
import json
import math
from pathlib import Path
import re
import shutil
import tempfile
from urllib.request import Request, urlopen
import zipfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://ised-isde.canada.ca/site/spectrum-management-telecommunications/en/spectrum-allocation/canadian-table-frequency-allocations-sf10759'
SITES='https://www.ic.gc.ca/engineering/SMS_TAFL_Files/Site_Data_Extract_FX.zip'
REGIONS='AB BC MB NB NL NS NT NU ON PE QC SK YT'.split()

def network(url):
    return urlopen(Request(url,headers={'User-Agent':'CoolCode Spectrum Explorer'}),timeout=120)

def compile_edition(table,archive,edition,url):
    bands=[]
    for row in table['data']:
        low,high=map(float,(row['low(kHz)'],row['high(kHz)']))
        if low>=high or bands and bands[-1]['high']!=low: raise ValueError('Overlapping or missing frequency ranges')
        bands.append(dict(low=low,high=high,label=row['frequencyRange'],services=row['services(EN)'],regions={}))
    if len(bands)<400:raise ValueError('Incomplete allocation edition')
    minimums=[b['low']for b in bands]
    counts=Counter();locations=defaultdict(set);skipped=Counter()
    with zipfile.ZipFile(archive) as zipped:
        member,=zipped.infolist()
        extract_date=date(*member.date_time[:3]).isoformat()
        with io.TextIOWrapper(zipped.open(member),encoding='utf-8-sig',errors='replace',newline='') as file:
            rows=csv.reader(file); header=next(rows)
            indices=[header.index(k) for k in ('province_code','tx_frequency','latitude','longitude')]
            for row in rows:
                if len(row)!=len(header):skipped['row width']+=1;continue
                region,tx,lat,lon=[row[i].strip()for i in indices]
                if region not in REGIONS:skipped['unrecognized region']+=1;continue
                try: value=float(tx)*1000
                except ValueError:skipped['missing TX']+=1;continue
                index=bisect_right(minimums,value)-1
                if not math.isfinite(value) or value<=0 or index<0 or value>=bands[-1]['high']:skipped['outside frequency range']+=1;continue
                key=(index,region);counts[key]+=1
                try:
                    a,b=float(lat),float(lon)
                    if 40<=a<=90 and -145<=b<=-45:locations[key].add((a,b))
                except ValueError:pass
    if set(region for _,region in counts)!=set(REGIONS):raise ValueError('Missing regions')
    for (i,reg),count in counts.items():bands[i]['regions'][reg]=[count,len(locations[i,reg])]
    status=dict(count=len(bands),assignment_count=sum(counts.values()),edition=extract_date,table=edition,table_url=url,retrieved=datetime.now(timezone.utc).date().isoformat(),skipped=dict(skipped))
    return bands,status

def main():
    p=argparse.ArgumentParser();p.add_argument('--sites',type=Path);args=p.parse_args()
    with network(SOURCE) as r: landing=html.unescape(r.read().decode())
    match=re.search(r'https://ised-isde\.canada\.ca/[^"\s]+/ctfa_table_(\d{4})\.json(?:\?open)?',landing)
    if not match:raise ValueError('Allocation feed missing')
    with network(match[0]) as r:table=json.load(r)
    with tempfile.TemporaryDirectory() as tmp:
        archive=args.sites or Path(tmp)/'sites.zip'
        if not args.sites:
            with network(SITES) as r,archive.open('wb')as f:shutil.copyfileobj(r,f)
        bands,status=compile_edition(table,archive,match[1],match[0])
    out=ROOT/'web/data'
    for name,doc in [('bands',bands),('status',status)]: (out/(name+'.json')).write_text(json.dumps(doc,ensure_ascii=False,separators=(',',':'))+'\n')
    print(status)

if __name__=='__main__':main()
