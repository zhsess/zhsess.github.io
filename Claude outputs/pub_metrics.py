import requests, json, math, collections, sys, time, os
S=requests.Session()
API='https://api.openalex.org'
def get(path, **p):
    if os.environ.get('OPENALEX_API_KEY'): p['api_key']=os.environ['OPENALEX_API_KEY']
    if os.environ.get('OPENALEX_MAILTO'): p['mailto']=os.environ['OPENALEX_MAILTO']
    for t in range(6):
        time.sleep(1.0)
        r=S.get(API+path, params=p, timeout=40)
        if r.status_code==200: return r.json()
        if r.status_code==429:
            wait=int(r.headers.get('Retry-After','0') or 0) or 10*(t+1)
            print('  429, waiting',wait,'s',file=sys.stderr); time.sleep(min(wait,60)); continue
        r.raise_for_status()
    r.raise_for_status()
papers={
 '[1] Zhang+2023 GRL (SAF traffic)':'10.1029/2023GL103759',
 '[2] Zhang&Ben-Zion 2024 JGR (dictionary learning)':'10.1029/2023JB027016',
 '[3] Zhang+2024 GRL (P*PKP)':'10.1029/2024GL110130',
 '[4] Zhang+2025 TSR (Bonin)':'10.1785/0320240035',
 '[5] Zhang+2026 NC (MWC)':'10.1038/s41467-026-70315-4',
 '[6] Zhang&Zhan 2026 JGR (DAS)':'10.1029/2026JB034841',
}
def short(u): return u.rsplit('/',1)[-1]
res={}
for name,doi in papers.items():
    try:
        w=get(f'/works/doi:{doi}')
    except Exception as e:
        print(name,'ERR',e); continue
    W=short(w['id']); refs=[short(r) for r in w['referenced_works']]
    out={'year':w['publication_year'],'cited_by':w['cited_by_count'],'fwci':w.get('fwci'),
         'pctile':(w.get('citation_normalized_percentile') or {}).get('value'),
         'top10':(w.get('citation_normalized_percentile') or {}).get('is_in_top_10_percent'),
         'n_refs':len(refs)}
    # --- reference field diversity
    subf=collections.Counter(); fld=collections.Counter(); src=collections.Counter(); got=0
    for i in range(0,len(refs),50):
        ch=refs[i:i+50]
        d=get('/works',filter='openalex:'+'|'.join(ch),select='id,primary_topic,primary_location',**{'per-page':50})
        for r in d['results']:
            got+=1
            t=r.get('primary_topic') or {}
            subf[(t.get('subfield') or {}).get('display_name','?')]+=1
            fld[(t.get('field') or {}).get('display_name','?')]+=1
            s=((r.get('primary_location') or {}).get('source') or {}).get('display_name')
            if s: src[s]+=1
    def H(c):
        n=sum(c.values()); return -sum(v/n*math.log(v/n) for v in c.values()) if n else 0
    out['ref_resolved']=got
    out['subfields']=subf.most_common(6); out['fields']=fld.most_common(4)
    out['H_subfield']=round(H(subf),2); out['n_subfields']=len(subf)
    top=subf.most_common(1)[0][1] if subf else 0
    out['share_outside_top_subfield']=round(1-top/max(got,1),2)
    out['n_journals']=len(src)
    # --- CD index
    citing=[]; cur='*'
    while True:
        d=get('/works',filter=f'cites:{W}',select='id,referenced_works',cursor=cur,**{'per-page':200})
        citing+=d['results']; cur=d['meta'].get('next_cursor')
        if not cur or not d['results']: break
    A=len(citing); R=set(refs)
    nj=sum(1 for c in citing if R & {short(x) for x in c['referenced_works']})
    ni=A-nj
    if len(refs)<=100:
        B=get('/works',filter='cites:'+'|'.join(refs),select='id',**{'per-page':1})['meta']['count']
        nk=B-nj-1  # minus focal paper itself (it cites its own refs)
        den=ni+nj+nk
        out.update(n_i=ni,n_j=nj,n_k=nk,CD=round((ni-nj)/den,4) if den>0 else None)
    else:
        out.update(n_i=ni,n_j=nj,n_k='>100 refs; skipped')
    res[name]=out
    print('\n'+name); 
    for k,v in out.items(): print('  ',k,':',v)
json.dump(res,open('/tmp/pub/result.json','w'),indent=1,default=str)
