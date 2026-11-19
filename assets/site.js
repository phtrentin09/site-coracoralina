(function(){
  var D=document; D.documentElement.classList.add('js');
  /* tema: claro por padrão, escuro só se a pessoa escolher */
  (function(){var t=null;try{t=localStorage.getItem('cora-theme');}catch(e){}
    D.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');
    function sync(){var dk=D.documentElement.getAttribute('data-theme')==='dark';Array.prototype.forEach.call(D.querySelectorAll('.theme-btn'),function(b){b.setAttribute('aria-pressed',dk?'true':'false');b.setAttribute('aria-label',dk?'Usar tema claro':'Usar tema escuro');b.title=dk?'Tema claro':'Tema escuro';});}
    D.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.theme-btn');if(!b)return;var nt=D.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';D.documentElement.setAttribute('data-theme',nt);try{localStorage.setItem('cora-theme',nt);}catch(err){}sync();});
    sync();})();
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function RI(u){return (u&&window.__IMGS&&u.indexOf('cimg:')===0)?window.__IMGS[u.slice(5)]:u;}
  function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s));}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

  /* menu */
  $$('.menu-btn').forEach(function(b){
    var nav=b.parentNode.querySelector('.nav');
    b.addEventListener('click',function(){var o=nav.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');D.body.style.overflow=o?'hidden':'';});
    nav.addEventListener('click',function(e){if(e.target.closest('a')){nav.classList.remove('open');b.setAttribute('aria-expanded','false');D.body.style.overflow='';}});
  });

  /* time in Curitiba */
  function nowBR(){
    try{var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
      var o={};p.forEach(function(x){o[x.type]=x.value;});
      var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];return {wd:wd,h:parseInt(o.hour,10)%24,m:parseInt(o.minute,10)};
    }catch(e){var d=new Date();return {wd:d.getDay(),h:d.getHours(),m:d.getMinutes()};}
  }
  var T=nowBR();
  /* visit status */
  $$('[data-status]').forEach(function(el){
    var mins=T.h*60+T.m, txt;
    if(mins>=840&&mins<1020){el.classList.add('open');txt='Horário de visita aberto agora, até as 17h';}
    else if(mins<840){txt='Visitas hoje das 14h às 17h';}
    else{txt='Visitas amanhã das 14h às 17h';}
    var s=el.querySelector('span'); if(s) s.textContent=txt;
  });

  /* week tabs */
  var NAMES=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  $$('[data-week]').forEach(function(w){
    var btns=$$('.days button',w), data=JSON.parse(w.getAttribute('data-week'));
    var img=w.querySelector('.panel img'), h=w.querySelector('.panel h3'), p=w.querySelector('.panel .desc'), pro=w.querySelector('.panel .pro'), now=w.querySelector('.today-now');
    function show(i,focus){
      var d=data[i]; btns.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false');b.tabIndex=j===i?0:-1;});
      if(img){img.style.opacity=0;setTimeout(function(){img.src=RI(d.img);img.alt=d.alt;img.style.opacity=1;},reduce?0:180);}
      h.textContent=d.t; p.textContent=d.d;
      if(pro){pro.innerHTML=d.pro?('<img src="'+RI(d.proImg)+'" alt=""><span>'+d.pro+'</span>'):'';}
      if(now){now.querySelector('.day').textContent=NAMES[d.wd];now.querySelector('.script').textContent=d.wd===T.wd?'Hoje é':'Na';now.querySelector('.act').textContent=d.short;}
      if(focus)btns[i].focus();
    }
    btns.forEach(function(b,i){
      b.addEventListener('click',function(){show(i);});
      b.addEventListener('keydown',function(e){var k=e.key;if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();var n=(i+(k==='ArrowRight'?1:-1)+btns.length)%btns.length;show(n,true);}});
    });
    var ti=0; data.forEach(function(d,i){if(d.wd===T.wd)ti=i;});
    var tb=btns[ti]; if(tb){var dot=D.createElement('i');dot.className='dot';dot.setAttribute('aria-hidden','true');tb.appendChild(dot);tb.setAttribute('aria-label',tb.textContent+' (hoje)');}
    show(ti);
    /* se a página ficar aberta na virada do dia, troca sozinha para o novo dia */
    setInterval(function(){var n=nowBR();if(n.wd!==T.wd){T=n;var k=0;data.forEach(function(d,i){if(d.wd===T.wd)k=i;});btns.forEach(function(b){var o=b.querySelector('.dot');if(o)o.remove();});var dt=D.createElement('i');dt.className='dot';btns[k].appendChild(dt);show(k);}},60000);
  });

  /* checklist */
  $$('[data-checklist]').forEach(function(c){
    var items=$$('.ck',c), out=c.querySelector('[data-count]'), bar=c.querySelector('.bar i'), done=c.querySelector('[data-done]');
    function upd(){var n=items.filter(function(i){return i.classList.contains('on');}).length;
      if(out)out.textContent=n+' de '+items.length; if(bar)bar.style.width=(n/items.length*100)+'%'; if(done)done.hidden=n<items.length;}
    items.forEach(function(it){var b=it.querySelector('button');b.addEventListener('click',function(){var on=it.classList.toggle('on');b.setAttribute('aria-expanded',on?'true':'false');upd();});});
    upd();
  });

  /* carousel */
  $$('[data-carousel]').forEach(function(c){
    var s=$$('.slide',c), dots=c.querySelector('.dots'), i=0, timer;
    s.forEach(function(_,k){var b=D.createElement('button');b.type='button';b.setAttribute('aria-label','Avaliação '+(k+1));b.addEventListener('click',function(){go(k);stop();});dots.insertBefore(b,dots.querySelector('.car-nav'));});
    var db=$$('button',dots).filter(function(b){return !b.classList.contains('round');});
    function go(k){i=(k+s.length)%s.length;s.forEach(function(x,j){x.classList.toggle('on',j===i);x.setAttribute('aria-hidden',j===i?'false':'true');});db.forEach(function(b,j){b.setAttribute('aria-current',j===i?'true':'false');});}
    function stop(){clearInterval(timer);}
    var pv=c.querySelector('[data-prev]'), nx=c.querySelector('[data-next]');
    if(pv)pv.addEventListener('click',function(){go(i-1);stop();});
    if(nx)nx.addEventListener('click',function(){go(i+1);stop();});
    go(0); if(!reduce)timer=setInterval(function(){go(i+1);},7000);
    c.addEventListener('mouseenter',stop);
  });

  /* myths */
  $$('.myth button').forEach(function(b){b.addEventListener('click',function(){var m=b.parentNode,on=m.classList.toggle('on');b.setAttribute('aria-pressed',on?'true':'false');});});

  /* scroller arrows */
  $$('[data-scroller]').forEach(function(w){
    var sc=w.querySelector('.scroller');
    $$('[data-dir]',w).forEach(function(b){b.addEventListener('click',function(){sc.scrollBy({left:(+b.getAttribute('data-dir'))*sc.clientWidth*.7,behavior:reduce?'auto':'smooth'});});});
    var down=false,sx=0,sl=0;
    sc.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;sx=e.clientX;sl=sc.scrollLeft;sc.style.scrollSnapType='none';});
    window.addEventListener('pointerup',function(){if(down){down=false;sc.style.scrollSnapType='';}});
    sc.addEventListener('pointermove',function(e){if(down){sc.scrollLeft=sl-(e.clientX-sx);}});
  });

  /* lightbox */
  $$('[data-gallery]').forEach(function(g){
    var items=$$('button',g);
    items.forEach(function(b,i){b.addEventListener('click',function(){open(i);});});
    function open(i){
      var lb=D.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Foto ampliada');
      lb.innerHTML='<figure style="margin:0"><img alt=""><p></p></figure><button class="round x" aria-label="Fechar">'+X+'</button><button class="round pv" aria-label="Anterior">'+L+'</button><button class="round nx" aria-label="Próxima">'+R+'</button>';
      D.body.appendChild(lb);D.body.style.overflow='hidden';
      function set(k){i=(k+items.length)%items.length;var im=items[i].querySelector('img');lb.querySelector('img').src=im.src;lb.querySelector('img').alt=im.alt;lb.querySelector('p').textContent=items[i].getAttribute('data-cap')||'';}
      function close(){lb.remove();D.body.style.overflow='';D.removeEventListener('keydown',key);items[i].focus();}
      function key(e){if(e.key==='Escape')close();if(e.key==='ArrowRight')set(i+1);if(e.key==='ArrowLeft')set(i-1);}
      lb.querySelector('.x').onclick=close;lb.querySelector('.pv').onclick=function(){set(i-1);};lb.querySelector('.nx').onclick=function(){set(i+1);};
      lb.addEventListener('click',function(e){if(e.target===lb)close();});D.addEventListener('keydown',key);set(i);lb.querySelector('.x').focus();
    }
  });
  var X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>',L='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 5l-7 7 7 7"/></svg>',R='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 5l7 7-7 7"/></svg>';

  /* observe: symbols, collages, reveals */
  var targets=$$('.sym:not(.static),.collage,.rv');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.18,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(t){io.observe(t);});
    window.__coraObserve=function(root){$$('.sym:not(.static),.collage,.rv',root).forEach(function(t){if(!t.classList.contains('in'))io.observe(t);});};
  } else { targets.forEach(function(t){t.classList.add('in');}); }

  /* visit form -> whatsapp */
  $$('form[data-wa]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);
      var msg=f.getAttribute('data-kind')==='job'
        ?'Olá! Vi a página Trabalhe conosco no site e gostaria de me candidatar.\nNome: '+(d.get('nome')||'')+'\nFunção: '+(d.get('area')||'')+(d.get('msg')?'\nExperiência: '+d.get('msg'):'')
        :'Olá! Vim pelo site e gostaria de agendar uma visita à Cora Coralina.\nNome: '+(d.get('nome')||'')+'\nO cuidado é para: '+(d.get('para')||'')+(d.get('msg')?'\n'+d.get('msg'):'');
      var url='https://wa.me/'+f.getAttribute('data-wa')+'?text='+encodeURIComponent(msg);
      var a=f.querySelector('[data-open]');a.href=url;a.hidden=false;try{window.open(url,'_blank','noopener');}catch(err){}a.focus();});
  });

  /* cookies + map consent */
  var KEY='cora-cookies', box=D.querySelector('.cookies');
  function loadMaps(){$$('[data-map]').forEach(function(m){if(m.querySelector('iframe'))return;var f=D.createElement('iframe');f.src=m.getAttribute('data-map');f.loading='lazy';f.title='Mapa da Casa de Repouso Cora Coralina';f.referrerPolicy='no-referrer-when-downgrade';m.innerHTML='';m.appendChild(f);});}
  var v=store(KEY);
  if(box){if(!v)box.hidden=false;else if(v==='all')loadMaps();
    box.addEventListener('click',function(e){var c=e.target.getAttribute('data-c');if(!c)return;store(KEY,c);box.hidden=true;if(c==='all')loadMaps();});}
  $$('[data-loadmap]').forEach(function(b){b.addEventListener('click',function(){store(KEY,'all');if(box)box.hidden=true;loadMaps();});});

  $$('[data-year]').forEach(function(y){y.textContent=new Date().getFullYear();});
})();
