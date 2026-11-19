"""Build the standalone province map from Natural Earth's public-domain 1:50m boundaries."""
import json
from math import cos,log,pi,radians,sin,tan
from pathlib import Path
from urllib.request import urlopen
SOURCE='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson'
ROOT=Path(__file__).resolve().parents[1]

def project(lon,lat):
    # Spherical Lambert conformal conic using Canada's standard parallels.
    a,b=map(radians,(49,77));n=log(cos(a)/cos(b))/log(tan(pi/4+b/2)/tan(pi/4+a/2))
    rho=(tan(pi/4+radians(lat)/2))**(-n)
    theta=n*radians(lon+96)
    return rho*sin(theta),rho*cos(theta)

def simplify(points,tol=.45):
    if len(points)<3:return points
    (ax,ay),(bx,by)=points[0],points[-1];dx,dy=bx-ax,by-ay
    worst,index=-1,0
    for i,(x,y) in enumerate(points[1:-1],1):
        t=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))) if dx or dy else 0
        distance=(x-ax-t*dx)**2+(y-ay-t*dy)**2
        if distance>worst:worst,index=distance,i
    if worst<=tol**2:return [points[0],points[-1]]
    return simplify(points[:index+1],tol)[:-1]+simplify(points[index:],tol)

def paths(features):
    regions={}
    for f in features:
        props=f['properties']
        if props['admin']!='Canada':continue
        geo=f['geometry'];polys=geo['coordinates'] if geo['type']=='MultiPolygon' else [geo['coordinates']]
        regions[props['iso_3166_2'][3:]]=[[project(*pos[:2]) for pos in ring] for poly in polys for ring in poly]
    if len(regions)!=13:raise ValueError('Expected 13 province and territory boundaries')
    coords=[p for rings in regions.values() for ring in rings for p in ring];xs,ys=zip(*coords);x0,x1=min(xs),max(xs);y0,y1=min(ys),max(ys)
    scale=min(600/(x1-x0),405/(y1-y0));result={}
    for reg,rings in regions.items():
        segments=[]
        for ring in rings:
            points=simplify([((x-x0)*scale+3,(y-y0)*scale+3) for x,y in ring])
            if len(points)>3:segments.append('M'+'L'.join(f'{x:.1f},{y:.1f}'for x,y in points)+'Z')
        result[reg]=''.join(segments)
    return {'width':round((x1-x0)*scale+6),'height':round((y1-y0)*scale+6),'paths':result}

if __name__=='__main__':
    with urlopen(SOURCE,timeout=60)as r:doc=json.load(r)
    (ROOT/'web/data/regions.json').write_text(json.dumps(paths(doc['features']),separators=(',',':'))+'\n')
