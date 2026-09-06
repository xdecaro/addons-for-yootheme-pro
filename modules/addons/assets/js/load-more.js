(() => {
  'use strict';

  const ROOT='[data-yt-loadmore]';
  const GRID='.uk-grid,[uk-grid],[data-uk-grid]';
  const done=new WeakSet();
  const targetHints=new WeakMap();
  const nextWords=['next','next page','suivant','suivante','page suivante','successiva','successivo','pagina successiva','avanti','volgende','weiter','nächste','naechste','próxima','proxima','seguinte','siguiente'];
  const localized={
    en:{button:'Load more',loading:'Loading…',end:'You have viewed all items',error:'Unable to load more items. Please try again.'},
    it:{button:'Carica altri',loading:'Caricamento…',end:'Hai visualizzato tutti gli elementi',error:'Impossibile caricare altri elementi. Riprova.'},
    fr:{button:'Charger plus',loading:'Chargement…',end:'Vous avez affiché tous les éléments',error:'Impossible de charger plus d’éléments. Réessayez.'},
    de:{button:'Mehr laden',loading:'Wird geladen…',end:'Alle Elemente wurden angezeigt',error:'Weitere Elemente konnten nicht geladen werden. Bitte erneut versuchen.'},
    nl:{button:'Meer laden',loading:'Laden…',end:'Alle items zijn weergegeven',error:'Meer items laden is niet gelukt. Probeer het opnieuw.'},
    es:{button:'Cargar más',loading:'Cargando…',end:'Has visto todos los elementos',error:'No se han podido cargar más elementos. Inténtalo de nuevo.'},
    pt:{button:'Carregar mais',loading:'A carregar…',end:'Todos os itens foram apresentados',error:'Não foi possível carregar mais itens. Tente novamente.'}
  };

  const q=(r,s)=>{try{return r&&s?r.querySelector(s):null}catch{return null}};
  const qa=(r,s)=>{try{return r&&s?[...r.querySelectorAll(s)]:[]}catch{return[]}};
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  const abs=(href,base=location.href)=>{try{return href&&href!=='#'?new URL(href,base).href:null}catch{return null}};

  function language(){
    const raw=(document.documentElement.lang||navigator.language||'en').toLowerCase();
    return raw.slice(0,2);
  }

  function text(root,key){
    const custom={button:root.dataset.buttonText,loading:root.dataset.loadingText,end:root.dataset.endText,error:root.dataset.errorText}[key];
    if(String(custom||'').trim())return String(custom).trim();
    const local=(localized[language()]||localized.en)[key];
    const fallback={button:root.dataset.defaultButtonText,loading:root.dataset.defaultLoadingText,end:root.dataset.defaultEndText,error:root.dataset.defaultErrorText}[key];
    return local||fallback||localized.en[key];
  }

  function applyTexts(root){
    const label=q(root,'[data-yt-loadmore-label]');
    if(label)label.textContent=text(root,'button');
    const loading=q(root,'[data-yt-loadmore-loading-label]');
    if(loading)loading.textContent=text(root,'loading');
  }

  function builderUrl(value){
    try{
      const u=new URL(String(value||''),location.href);
      return u.searchParams.get('p')==='customizer'||(u.pathname.includes('/administrator/')&&u.searchParams.get('option')==='com_ajax');
    }catch{return false}
  }

  function builder(){
    if(builderUrl(location.href))return true;
    try{if(window.parent&&window.parent!==window&&builderUrl(window.parent.location.href))return true}catch{}
    try{if(window.top&&window.top!==window&&builderUrl(window.top.location.href))return true}catch{}
    return false;
  }

  function candidateGrids(doc){
    return qa(doc,GRID).filter(g=>!g.closest(ROOT)&&g.children.length>0);
  }

  function isBefore(a,b){
    try{return !!(a.compareDocumentPosition(b)&4)}catch{return false}
  }

  function directPreviousGrid(root){
    let n=root.previousElementSibling;
    while(n){
      if(n.matches?.(GRID))return n;
      const grids=qa(n,GRID);
      if(grids.length)return grids[grids.length-1];
      n=n.previousElementSibling;
    }
    return null;
  }

  function scopedPreviousGrid(root){
    let scope=root.parentElement;
    const doc=root.ownerDocument;

    while(scope&&scope!==doc.documentElement){
      const grids=qa(scope,GRID).filter(g=>{
        if(g===root||g.contains(root)||g.closest(ROOT)||!g.children.length)return false;
        return isBefore(g,root);
      });

      if(grids.length)return grids[grids.length-1];
      scope=scope.parentElement;
    }

    return null;
  }

  function autoTarget(root){
    if(!root)return null;
    return directPreviousGrid(root)||scopedPreviousGrid(root);
  }

  function rememberTarget(root,t){
    if(!root||!t||root.ownerDocument!==document)return;
    const grids=candidateGrids(document);
    const index=grids.indexOf(t);
    if(index>=0)targetHints.set(root,{index});
  }

  function matchingRoot(root,doc){
    if(doc===document)return root;

    if(root.id){
      const byId=doc.getElementById(root.id);
      if(byId)return byId;
    }

    const localRoots=qa(document,ROOT);
    const remoteRoots=qa(doc,ROOT);
    const index=localRoots.indexOf(root);
    return remoteRoots[index]||remoteRoots[0]||null;
  }

  function target(root,doc=document){
    if((root.dataset.targetMode||'auto')==='selector')return q(doc,root.dataset.targetSelector||'');

    if(doc===document){
      const found=autoTarget(root);
      if(found)rememberTarget(root,found);
      return found;
    }

    const remoteRoot=matchingRoot(root,doc);
    if(remoteRoot){
      const found=autoTarget(remoteRoot);
      if(found)return found;
    }

    const hint=targetHints.get(root);
    if(hint&&Number.isInteger(hint.index)){
      const grids=candidateGrids(doc);
      if(grids[hint.index])return grids[hint.index];
    }

    return null;
  }

  function itemHost(t,root){
    if(!t)return null;
    const selector=root.dataset.itemSelector||':scope > *';
    if(selector!==':scope > *')return t;

    const direct=qa(t,':scope > *').filter(x=>!x.matches(ROOT));
    if(direct.length===1){
      const only=direct[0];
      if(only.matches?.(GRID)&&only.children.length)return only;
    }

    return t;
  }

  function items(t,root){
    const host=itemHost(t,root);
    if(!host)return[];
    return qa(host,root.dataset.itemSelector||':scope > *').filter(x=>!x.matches(ROOT));
  }

  function scopes(doc,root){
    const custom=qa(doc,root.dataset.paginationSelector||'');
    return custom.length?custom:qa(doc,'.pagination,.uk-pagination,nav.pagination,ul.pagination,ul.uk-pagination,nav[aria-label*="pagination" i]');
  }

  function isNext(a){
    if(!a)return false;
    if((a.getAttribute('rel')||'').split(/\s+/).includes('next'))return true;
    const label=norm([a.textContent,a.getAttribute('aria-label'),a.getAttribute('title')].filter(Boolean).join(' '));
    return nextWords.some(w=>label.includes(norm(w)));
  }

  function currentStart(base){
    try{return parseInt(new URL(base,location.href).searchParams.get('start')||'0',10)||0}catch{return 0}
  }

  function nextUrl(doc,root,base){
    const ss=scopes(doc,root);
    const links=[];
    ss.forEach(s=>links.push(...qa(s,'a[href]')));

    const sel=root.dataset.nextSelector||'';
    let a=null;
    for(const s of ss){
      a=q(s,sel);
      if(a)break;
    }

    if(!a)a=links.find(isNext)||null;
    if(a)return abs(a.getAttribute('href'),base);

    const cur=currentStart(base);
    const candidates=[];
    links.forEach(link=>{
      const href=abs(link.getAttribute('href'),base);
      if(!href)return;
      try{
        const u=new URL(href);
        if(!u.searchParams.has('start'))return;
        const n=parseInt(u.searchParams.get('start')||'',10);
        if(Number.isFinite(n)&&n>cur)candidates.push([n,href]);
      }catch{}
    });

    candidates.sort((a,b)=>a[0]-b[0]);
    if(candidates.length)return candidates[0][1];

    const rel=q(doc,'a[rel="next"][href]');
    return rel?abs(rel.getAttribute('href'),base):null;
  }

  function derive(base,pageSize){
    if(!pageSize)return null;
    try{
      const u=new URL(base,location.href);
      if(u.pathname.includes('/administrator/'))return null;
      u.searchParams.set('start',String(currentStart(base)+pageSize));
      return u.href;
    }catch{return null}
  }

  function primaryLink(item,base){
    for(const s of ['h1 a[href]','h2 a[href]','h3 a[href]','h4 a[href]','h5 a[href]','h6 a[href]','.uk-card-title a[href]','.el-title a[href]','a.uk-link-reset[href]']){
      const a=q(item,s);
      if(a)return a;
    }

    const links=qa(item,'a[href]');
    if(!links.length)return null;

    let current='';
    try{current=new URL(base,location.href).pathname}catch{}

    return links.map(a=>{
      const href=abs(a.getAttribute('href'),base);
      if(!href)return[a,-1];
      try{
        const u=new URL(href);
        const depth=u.pathname.split('/').filter(Boolean).length;
        const txt=norm(a.textContent).length;
        return[a,depth*20+Math.min(txt,80)-(u.pathname===current?100:0)];
      }catch{return[a,-1]}
    }).sort((a,b)=>b[1]-a[1])[0][0];
  }

  function keys(item,base){
    const out=[];

    for(const n of ['data-id','data-article-id','data-item-id','data-product-id']){
      const value=item.getAttribute?.(n);
      if(value)out.push('id:'+norm(value));
    }

    const a=primaryLink(item,base);
    if(a){
      try{
        const u=new URL(abs(a.getAttribute('href'),base));
        const path=decodeURIComponent(u.pathname)
          .replace(/\/index\.php(?=\/|$)/i,'')
          .replace(/\/{2,}/g,'/')
          .replace(/\/$/,'')
          .toLowerCase();
        const parts=path.split('/').filter(Boolean);
        const last=(parts.at(-1)||'').replace(/^\d+[-_:]/,'');
        if(path)out.push('path:'+path);
        if(last.length>2)out.push('slug:'+last);
      }catch{}
    }

    const title=norm(q(item,'h1,h2,h3,h4,h5,h6,.uk-card-title,.el-title')?.textContent||'');
    const img=q(item,'img[src],img[data-src]');
    let image='';
    if(img){
      try{
        image=decodeURIComponent(new URL(img.getAttribute('src')||img.getAttribute('data-src'),base).pathname.split('/').filter(Boolean).pop()||'').toLowerCase();
      }catch{}
    }

    if(title&&image)out.push('title-image:'+title+'|'+image);
    if(!out.length){
      const txt=norm(item.textContent).slice(0,500);
      if(txt)out.push('text:'+txt);
    }

    return out;
  }

  function seenIndex(list,base){
    const seen=new Set();
    list.forEach(item=>keys(item,base).forEach(key=>seen.add(key)));
    return seen;
  }

  function duplicate(item,base,seen){
    const itemKeys=keys(item,base);
    if(itemKeys.some(key=>seen.has(key)))return true;
    itemKeys.forEach(key=>seen.add(key));
    return false;
  }

  function prepareImported(item){
    item.classList?.remove('uk-first-column','uk-grid-margin');
    return item;
  }

  function hidePagination(root){
    if(root.dataset.hidePagination!=='1')return;
    scopes(document,root).forEach(scope=>{
      if(!scope.closest(ROOT))scope.hidden=true;
    });
  }

  function busy(root,on){
    root.classList.toggle('is-loading',on);
    root.setAttribute('aria-busy',on?'true':'false');
    const button=q(root,'[data-yt-loadmore-button]');
    const loading=q(root,'[data-yt-loadmore-loading]');
    if(button)button.disabled=on;
    if(loading)loading.hidden=!on;
  }

  function label(root,value){
    const el=q(root,'[data-yt-loadmore-label]');
    if(el)el.textContent=value||text(root,'button');
  }

  function message(root,value,error=false){
    const el=q(root,'[data-yt-loadmore-message]');
    if(!el)return;
    el.textContent=value||'';
    el.classList.toggle('is-error',error);
    el.hidden=!value;
  }

  function revealControl(root){
    const selector=(root.dataset.mode||'button')==='infinite'?'[data-yt-loadmore-sentinel]':'[data-yt-loadmore-button]';
    const control=q(root,selector);
    if(control)control.hidden=false;
  }

  function setReady(root){
    root.classList.remove('is-finished');
    root.classList.add('is-ready');
    message(root,'');
    revealControl(root);
  }

  function finish(root,observer,show=true){
    observer?.disconnect();
    root.classList.add('is-finished');
    if(!show)root.classList.remove('is-ready');

    for(const selector of ['[data-yt-loadmore-button]','[data-yt-loadmore-sentinel]','[data-yt-loadmore-loading]']){
      const el=q(root,selector);
      if(el)el.hidden=true;
    }

    message(root,show&&root.dataset.showEndMessage==='1'?text(root,'end'):'');
  }

  function animate(list,mode){
    if(!mode||mode==='none')return;
    list.forEach((item,index)=>{
      item.classList.add(`yt-loadmore-new--${mode}`);
      item.style.animationDelay=`${Math.min(index*35,245)}ms`;
      item.addEventListener('animationend',()=>{
        item.classList.remove(`yt-loadmore-new--${mode}`);
        item.style.animationDelay='';
      },{once:true});
    });
  }

  function updateUi(target){
    try{
      if(window.UIkit&&typeof window.UIkit.update==='function')window.UIkit.update(target,'update');
    }catch{}
  }

  function observer(root,load){
    if((root.dataset.mode||'button')!=='infinite')return null;
    const sentinel=q(root,'[data-yt-loadmore-sentinel]');
    if(!sentinel||!('IntersectionObserver'in window))return null;

    const distance=Math.max(0,parseInt(root.dataset.threshold||'500',10)||500);
    const instance=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting))load();
    },{rootMargin:`0px 0px ${distance}px 0px`});

    instance.observe(sentinel);
    return instance;
  }

  async function probeNext(root,t,pageSize){
    if(!t||pageSize<1)return null;
    const candidate=derive(location.href,pageSize);
    if(!candidate)return null;

    try{
      const response=await fetch(candidate,{
        credentials:'same-origin',
        headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html,application/xhtml+xml'}
      });
      if(!response.ok)return null;

      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      const remoteTarget=target(root,doc);
      if(!remoteTarget)return null;

      const remoteItems=items(remoteTarget,root);
      if(!remoteItems.length)return null;

      const seen=seenIndex(items(t,root),location.href);
      for(const item of remoteItems){
        const itemKeys=keys(item,candidate);
        if(itemKeys.length&&!itemKeys.some(key=>seen.has(key)))return candidate;
      }
    }catch(error){
      console.debug('[Load More for YOOtheme Pro] Silent next-page probe failed',error);
    }

    return null;
  }

  function initAjax(root,t,initial,pageSize){
    applyTexts(root);

    if(builder()){
      root.classList.add('is-builder-preview');
      setReady(root);
      return;
    }

    const host=itemHost(t,root);
    let next=initial;
    if(!next||!host){
      finish(root,null,false);
      return;
    }

    hidePagination(root);
    setReady(root);

    const batch=Math.max(1,parseInt(root.dataset.batchSize||'4',10)||4);
    const queue=[];
    const visited=new Set();
    const seen=seenIndex(items(t,root),location.href);
    let loading=false;
    let obs=null;
    const original=text(root,'button');

    async function fetchPage(){
      if(!next)return;

      const requested=next;
      if(visited.has(requested)){
        next=null;
        return;
      }
      visited.add(requested);

      const response=await fetch(requested,{
        credentials:'same-origin',
        headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html,application/xhtml+xml'}
      });
      if(!response.ok)throw new Error(`HTTP ${response.status}`);

      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      const remoteTarget=target(root,doc);
      if(!remoteTarget)throw new Error('Remote target not found');

      const remoteItems=items(remoteTarget,root);
      let added=0;
      remoteItems.forEach(item=>{
        if(duplicate(item,requested,seen))return;
        queue.push(prepareImported(document.importNode(item,true)));
        added++;
      });

      const explicit=nextUrl(doc,root,requested);
      if(explicit&&!visited.has(explicit)){
        next=explicit;
      }else if(remoteItems.length>=pageSize&&added>0){
        next=derive(requested,pageSize);
      }else{
        next=null;
      }

      if(root.dataset.updateUrl==='1'){
        try{history.replaceState({ytLoadMore:true},'',requested)}catch{}
      }
    }

    async function fill(){
      let guard=0;
      while(queue.length<batch&&next&&guard++<10){
        const before=queue.length;
        await fetchPage();
        if(queue.length===before&&!next)break;
      }
    }

    async function load(){
      if(loading||root.classList.contains('is-finished'))return;
      loading=true;
      message(root,'');
      busy(root,true);
      label(root,text(root,'loading'));

      try{
        await fill();
        const add=queue.splice(0,batch);

        if(!add.length){
          finish(root,obs,true);
          return;
        }

        const fragment=document.createDocumentFragment();
        add.forEach(item=>fragment.appendChild(item));
        host.appendChild(fragment);
        animate(add,root.dataset.animation||'fade');
        updateUi(host);

        document.dispatchEvent(new CustomEvent('yootheme:loadmore:loaded',{
          detail:{root,target:host,items:add,url:next,strategy:'ajax'}
        }));

        if(!queue.length&&!next)finish(root,obs,true);
      }catch(error){
        console.error('[Load More for YOOtheme Pro]',error);
        message(root,text(root,'error'),true);
      }finally{
        loading=false;
        busy(root,false);
        label(root,original);
      }
    }

    const button=q(root,'[data-yt-loadmore-button]');
    if(button)button.addEventListener('click',load);
    obs=observer(root,load);
  }

  async function init(root){
    if(done.has(root))return;
    done.add(root);
    applyTexts(root);

    if(builder()){
      root.classList.add('is-builder-preview');
      setReady(root);
      return;
    }

    const t=target(root);
    if(!t){
      finish(root,null,false);
      return;
    }

    const list=items(t,root);
    if(!list.length){
      finish(root,null,false);
      return;
    }

    const pageSize=list.length;
    let next=nextUrl(document,root,location.href);

    if(!next)next=await probeNext(root,t,pageSize);

    initAjax(root,t,next,pageSize);
  }

  function boot(scope=document){
    qa(scope,ROOT).forEach(init);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>boot());
  }else{
    boot();
  }

  document.addEventListener('yootheme:builder:render',()=>boot());
})();