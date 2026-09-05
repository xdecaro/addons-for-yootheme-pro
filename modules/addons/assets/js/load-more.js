(() => {
  'use strict';

  const ROOT='[data-yt-loadmore]';
  const done=new WeakSet();
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

  function builder(){
    try{const u=new URL(location.href);return u.searchParams.get('p')==='customizer'||(u.pathname.includes('/administrator/')&&u.searchParams.get('option')==='com_ajax')}catch{return false}
  }

  function autoTarget(root){
    let n=root.previousElementSibling;
    while(n){
      if(n.matches?.('.uk-grid,[uk-grid],[data-uk-grid]'))return n;
      const g=q(n,'.uk-grid,[uk-grid],[data-uk-grid]');
      if(g)return g;
      n=n.previousElementSibling;
    }
    return null;
  }

  function matchingRoot(root,doc){
    if(doc===document)return root;
    if(root.id){
      const byId=doc.getElementById(root.id);
      if(byId)return byId;
    }
    const localRoots=qa(document,ROOT),remoteRoots=qa(doc,ROOT),index=localRoots.indexOf(root);
    return remoteRoots[index]||remoteRoots[0]||null;
  }

  function target(root,doc=document){
    if((root.dataset.targetMode||'auto')==='selector')return q(doc,root.dataset.targetSelector||'');
    const remoteRoot=matchingRoot(root,doc);
    return remoteRoot?autoTarget(remoteRoot):null;
  }

  function itemHost(t,root){
    if(!t)return null;
    const selector=root.dataset.itemSelector||':scope > *';
    if(selector!==':scope > *')return t;
    const direct=qa(t,':scope > *').filter(x=>!x.matches(ROOT));
    if(direct.length===1){
      const only=direct[0];
      if(only.matches?.('.uk-grid,[uk-grid],[data-uk-grid]')&&only.children.length)return only;
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

  function currentStart(base){try{return parseInt(new URL(base,location.href).searchParams.get('start')||'0',10)||0}catch{return 0}}

  function normalizeOffset(candidate,base,pageSize){
    if(!candidate||!pageSize)return candidate;
    try{
      const u=new URL(candidate,base),cur=currentStart(base),expected=cur+pageSize;
      if(!u.searchParams.has('start'))return u.href;
      const n=parseInt(u.searchParams.get('start')||'',10);
      if(Number.isFinite(n)&&n>cur&&n<expected)u.searchParams.set('start',String(expected));
      return u.href;
    }catch{return candidate}
  }

  function nextUrl(doc,root,base,pageSize){
    const ss=scopes(doc,root),links=[];
    ss.forEach(s=>links.push(...qa(s,'a[href]')));
    let a=null;
    const sel=root.dataset.nextSelector||'';
    for(const s of ss){a=q(s,sel);if(a)break}
    if(!a)a=links.find(isNext)||null;
    if(!a){
      const cur=currentStart(base),c=[];
      links.forEach(l=>{const h=abs(l.getAttribute('href'),base);if(!h)return;try{const u=new URL(h);if(!u.searchParams.has('start'))return;const n=parseInt(u.searchParams.get('start')||'',10);if(Number.isFinite(n)&&n>cur)c.push([n,h])}catch{}});
      c.sort((x,y)=>x[0]-y[0]);if(c.length)return normalizeOffset(c[0][1],base,pageSize);
    }
    if(a)return normalizeOffset(abs(a.getAttribute('href'),base),base,pageSize);
    const rel=q(doc,'a[rel="next"][href]');
    return rel?normalizeOffset(abs(rel.getAttribute('href'),base),base,pageSize):null;
  }

  function primaryLink(item,base){
    for(const s of ['h1 a[href]','h2 a[href]','h3 a[href]','h4 a[href]','h5 a[href]','h6 a[href]','.uk-card-title a[href]','.el-title a[href]','a.uk-link-reset[href]']){const a=q(item,s);if(a)return a}
    const links=qa(item,'a[href]');if(!links.length)return null;
    let current='';try{current=new URL(base,location.href).pathname}catch{}
    return links.map(a=>{const h=abs(a.getAttribute('href'),base);if(!h)return[a,-1];try{const u=new URL(h),depth=u.pathname.split('/').filter(Boolean).length,txt=norm(a.textContent).length;return[a,depth*20+Math.min(txt,80)-(u.pathname===current?100:0)]}catch{return[a,-1]}}).sort((x,y)=>y[1]-x[1])[0][0];
  }

  function keys(item,base){
    const out=[];
    for(const n of ['data-id','data-article-id','data-item-id','data-product-id']){const v=item.getAttribute?.(n);if(v)out.push('id:'+norm(v))}
    const a=primaryLink(item,base);
    if(a){
      try{
        const u=new URL(abs(a.getAttribute('href'),base));
        const p=decodeURIComponent(u.pathname).replace(/\/index\.php(?=\/|$)/i,'').replace(/\/{2,}/g,'/').replace(/\/$/,'').toLowerCase();
        const parts=p.split('/').filter(Boolean),last=(parts.at(-1)||'').replace(/^\d+[-_:]/,'');
        if(p)out.push('path:'+p);if(last.length>2)out.push('slug:'+last);
      }catch{}
    }
    const title=norm(q(item,'h1,h2,h3,h4,h5,h6,.uk-card-title,.el-title')?.textContent||'');
    const img=q(item,'img[src],img[data-src]');
    let im='';if(img){try{im=decodeURIComponent(new URL(img.getAttribute('src')||img.getAttribute('data-src'),base).pathname.split('/').filter(Boolean).pop()||'').toLowerCase()}catch{}}
    if(title&&im)out.push('title-image:'+title+'|'+im);
    if(!out.length){const txt=norm(item.textContent).slice(0,500);if(txt)out.push('text:'+txt)}
    return out;
  }

  function seenIndex(list,base){const s=new Set();list.forEach(i=>keys(i,base).forEach(k=>s.add(k)));return s}
  function duplicate(item,base,seen){const k=keys(item,base);if(k.some(x=>seen.has(x)))return true;k.forEach(x=>seen.add(x));return false}
  function prepareImported(item){item.classList?.remove('uk-first-column','uk-grid-margin');return item}

  function hidePagination(root){if(root.dataset.hidePagination==='1')scopes(document,root).forEach(x=>{if(!x.closest(ROOT))x.hidden=true})}
  function busy(root,on){root.classList.toggle('is-loading',on);root.setAttribute('aria-busy',on?'true':'false');const b=q(root,'[data-yt-loadmore-button]'),l=q(root,'[data-yt-loadmore-loading]');if(b)b.disabled=on;if(l)l.hidden=!on}
  function label(root,value){const x=q(root,'[data-yt-loadmore-label]');if(x)x.textContent=value||text(root,'button')}
  function message(root,value,error=false){const m=q(root,'[data-yt-loadmore-message]');if(!m)return;m.textContent=value||'';m.classList.toggle('is-error',error);m.hidden=!value}

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
    for(const s of ['[data-yt-loadmore-button]','[data-yt-loadmore-sentinel]','[data-yt-loadmore-loading]']){const x=q(root,s);if(x)x.hidden=true}
    message(root,show&&root.dataset.showEndMessage==='1'?text(root,'end'):'');
  }

  function animate(list,mode){if(!mode||mode==='none')return;list.forEach((x,i)=>{x.classList.add(`yt-loadmore-new--${mode}`);x.style.animationDelay=`${Math.min(i*35,245)}ms`;x.addEventListener('animationend',()=>{x.classList.remove(`yt-loadmore-new--${mode}`);x.style.animationDelay=''},{once:true})})}
  function updateUi(t){try{if(window.UIkit&&typeof window.UIkit.update==='function')window.UIkit.update(t,'update')}catch{}}

  function observer(root,load){
    if((root.dataset.mode||'button')!=='infinite')return null;
    const s=q(root,'[data-yt-loadmore-sentinel]');if(!s||!('IntersectionObserver'in window))return null;
    const d=Math.max(0,parseInt(root.dataset.threshold||'500',10)||500),o=new IntersectionObserver(e=>{if(e.some(x=>x.isIntersecting))load()},{rootMargin:`0px 0px ${d}px 0px`});o.observe(s);return o;
  }

  function probeUrl(base,pageSize){
    try{
      const u=new URL(base,location.href);
      u.searchParams.set('start',String(currentStart(base)+pageSize));
      return u.href;
    }catch{return null}
  }

  async function probeNext(root,t,pageSize){
    if(!t||pageSize<1)return null;
    const candidate=probeUrl(location.href,pageSize);
    if(!candidate)return null;

    try{
      const r=await fetch(candidate,{credentials:'same-origin',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html,application/xhtml+xml'}});
      if(!r.ok)return null;
      const doc=new DOMParser().parseFromString(await r.text(),'text/html');
      const rt=target(root,doc);
      if(!rt)return null;
      const remote=items(rt,root);
      if(!remote.length)return null;

      const seen=seenIndex(items(t,root),location.href);
      for(const item of remote){
        const itemKeys=keys(item,candidate);
        if(itemKeys.length&&!itemKeys.some(k=>seen.has(k)))return candidate;
      }
    }catch(e){
      console.debug('[Load More for YOOtheme Pro] Silent next-page probe failed',e);
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
    let next=initial;if(!next||!host){finish(root,null,false);return}
    hidePagination(root);
    setReady(root);
    const batch=Math.max(1,parseInt(root.dataset.batchSize||'4',10)||4),queue=[],visited=new Set(),seen=seenIndex(items(t,root),location.href);
    let loading=false,obs=null;
    const original=text(root,'button');

    async function fetchPage(){
      if(!next)return;
      const requested=next;if(visited.has(requested)){next=null;return}visited.add(requested);
      const r=await fetch(requested,{credentials:'same-origin',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'text/html,application/xhtml+xml'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const doc=new DOMParser().parseFromString(await r.text(),'text/html'),rt=target(root,doc);if(!rt)throw new Error('Remote target not found');
      const remote=items(rt,root);
      remote.forEach(i=>{if(duplicate(i,requested,seen))return;queue.push(prepareImported(document.importNode(i,true)))});
      const explicit=nextUrl(doc,root,requested,pageSize);
      if(explicit&&!visited.has(explicit))next=explicit;
      else next=null;
      if(root.dataset.updateUrl==='1'){try{history.replaceState({ytLoadMore:true},'',requested)}catch{}}
    }

    async function fill(){let guard=0;while(queue.length<batch&&next&&guard++<10){const before=queue.length;await fetchPage();if(queue.length===before&&!next)break}}

    async function load(){
      if(loading||root.classList.contains('is-finished'))return;loading=true;message(root,'');busy(root,true);label(root,text(root,'loading'));
      try{
        await fill();const add=queue.splice(0,batch);if(!add.length){finish(root,obs,true);return}
        const f=document.createDocumentFragment();add.forEach(i=>f.appendChild(i));host.appendChild(f);animate(add,root.dataset.animation||'fade');updateUi(host);
        document.dispatchEvent(new CustomEvent('yootheme:loadmore:loaded',{detail:{root,target:host,items:add,url:next,strategy:'ajax'}}));
        if(!queue.length&&!next)finish(root,obs,true);
      }catch(e){console.error('[Load More for YOOtheme Pro]',e);message(root,text(root,'error'),true)}finally{loading=false;busy(root,false);label(root,original)}
    }

    const b=q(root,'[data-yt-loadmore-button]');if(b)b.addEventListener('click',load);obs=observer(root,load);
  }

  async function init(root){
    if(done.has(root))return;done.add(root);applyTexts(root);

    if(builder()){
      root.classList.add('is-builder-preview');
      setReady(root);
      return;
    }

    const t=target(root);
    if(!t){finish(root,null,false);return}

    const list=items(t,root);
    if(!list.length){finish(root,null,false);return}

    const pageSize=list.length;
    let next=nextUrl(document,root,location.href,pageSize);

    if(!next){
      next=await probeNext(root,t,pageSize);
    }

    initAjax(root,t,next,pageSize);
  }

  function boot(scope=document){qa(scope,ROOT).forEach(init)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot());else boot();
  document.addEventListener('yootheme:builder:render',()=>boot());
})();