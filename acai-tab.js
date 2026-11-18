(function(){
  var tabs=document.getElementById('tabs'),fia=document.getElementById('sec-fia');
  if(!tabs||!fia)return;
  tabs.style.gridTemplateColumns='repeat(4,1fr)';
  var b=document.createElement('button');
  b.dataset.a='t';b.dataset.v='acai';b.setAttribute('aria-pressed','false');b.textContent='Açaí';
  tabs.children[0].after(b);
  var s=document.createElement('div');s.id='sec-acai';s.hidden=true;
  var f=document.createElement('iframe');
  f.title='Monte seu açaí';
  f.style.cssText='width:100%;height:calc(100dvh - 190px);min-height:420px;border:0;display:block';
  s.appendChild(f);fia.after(s);
  new MutationObserver(function(){s.hidden=b.getAttribute('aria-pressed')!=='true'})
    .observe(tabs,{attributes:true,subtree:true,attributeFilter:['aria-pressed']});
  f.addEventListener('load',function(){
    try{var a=f.contentDocument.querySelector('a[href="loja.html"]');if(a)a.hidden=true}catch(e){}
  });
  (async function(){
    var u='acai.html';
    try{var r=await fetch(u,{method:'HEAD'});if(!r.ok)u='a%C3%A7a%C3%AD.html'}catch(e){}
    f.src=u;
  })();
})();

/* Esconde da aba Loja os produtos das categorias Açaí, Ingredientes e Cobertura */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/';
  var nz=function(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()};
  var esconde=function(c){c=nz(c);return c==='acai'||c==='ingredientes'||c.indexOf('cobertura')===0};
  var ids={},un=null,grid=document.getElementById('grid'),cats=document.getElementById('cats');
  function apply(){
    if(grid)grid.querySelectorAll('.tile').forEach(function(t){var b=t.querySelector('[data-id]');t.hidden=!!(b&&ids[b.dataset.id])});
    if(cats)cats.querySelectorAll('button').forEach(function(b){b.hidden=esconde(b.textContent)});
  }
  var mo=new MutationObserver(apply);
  if(grid)mo.observe(grid,{childList:true});
  if(cats)mo.observe(cats,{childList:true});
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),F=await import(V+'firebase-firestore.js');
      var app;
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      var db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        if(un){un();un=null}
        if(!u)return;
        un=F.onSnapshot(F.collection(db,'products'),function(s){
          ids={};s.forEach(function(d){if(esconde(d.data().cat))ids[d.id]=1});apply();
        },function(){});
      });
    }catch(e){}
  })();
})();

/* Botão "Já paguei" também em Meus pedidos (pedidos da loja geral) */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/';
  var list=document.getElementById('olist'),cfg={},ords={},uns=[],told={};
  try{told=JSON.parse(localStorage.getItem('told')||'{}')}catch(e){}
  var R=function(v){return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  function say(t){var m=document.getElementById('msg');if(!m)return;m.textContent=t;clearTimeout(say.t);say.t=setTimeout(function(){m.textContent=''},6000)}
  function addBtns(){
    if(!list)return;
    list.querySelectorAll('button[data-a="pix"]').forEach(function(p){
      var id=p.dataset.id,n=p.nextElementSibling;
      if(n&&n.dataset&&n.dataset.ja)return;
      var b=document.createElement('button');
      b.className='sec';b.style.cssText='width:100%;margin-top:8px';b.dataset.ja=id;
      b.textContent=told[id]?'Aviso enviado. Aguarde a confirmação':'Já paguei';b.disabled=!!told[id];
      p.after(b);
    });
  }
var prep=0,pbox=null,pn=null;
  function avisos(){
    var sec=document.getElementById('sec-ped'),ci=document.getElementById('citems'),t=prep?'Tempo de preparo: cerca de '+prep+' min.':'';
    if(sec){if(!pbox){pbox=document.createElement('div');pbox.className='mut';pbox.style.cssText='margin:6px 0 10px;font-weight:700';sec.insertBefore(pbox,sec.firstChild)}pbox.hidden=!prep;pbox.textContent=t}
    if(ci){if(!pn){pn=document.createElement('div');pn.className='mut';ci.after(pn)}pn.hidden=!prep;pn.textContent=t}
  }
  var promo=null,pb=null;
  (function(){var st=document.createElement('style');st.textContent='@keyframes promo{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}@media (prefers-reduced-motion:reduce){#promo{animation:none!important}}';document.head.appendChild(st)})();
  function banner(){
    var sec=document.getElementById('sec-loja');if(!sec)return;
    if(!pb){pb=document.createElement('div');pb.id='promo';pb.style.cssText='background:var(--acc);color:var(--acci);border-radius:14px;padding:11px 14px;margin:0 0 10px;font-weight:800;text-align:center;animation:promo 2.4s ease-in-out infinite';sec.insertBefore(pb,sec.firstChild)}
    var ok=promo&&promo.on&&promo.txt;pb.hidden=!ok;pb.textContent=ok?'Promoção do dia: '+promo.txt:'';
  }
  function press(a,id,n){var b=document.createElement('button');b.dataset.a=a;b.dataset.id=id;b.hidden=true;document.body.appendChild(b);for(var k=0;k<n;k++)b.click();b.remove()}
  function again(){
    if(!list)return;
    var arr=Object.keys(ords).map(function(k){var o=ords[k];o.id=k;return o}).sort(function(a,b){return b.t-a.t});
    var rows=list.querySelectorAll(':scope>.row');
    if(!rows.length||rows.length!==arr.length)return;
    rows.forEach(function(r,i){
      var o=arr[i];if(['ent','canc'].indexOf(o.st)<0||r.querySelector('[data-again]'))return;
      var t=r.querySelector('.rh b');if(!t||t.textContent!==R(o.total))return;
      var b=document.createElement('button');b.className='sec';b.dataset.again=o.id;b.style.cssText='width:100%;margin-top:8px';b.textContent='Pedir de novo';r.appendChild(b);
    });
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-again]');if(!b)return;
    var o=ords[b.dataset.again];if(!o)return;
    (o.items||[]).forEach(function(i){press('add',i.p,+i.q||0)});
    var t=document.querySelector('#tabs button[data-v="loja"]');if(t)t.click();
    var bar=document.getElementById('bar');if(bar&&!bar.hidden)bar.click();
  });
  document.addEventListener('change',function(e){if(e.target.id==='pay'){var t=document.getElementById('trocopara');if(t)t.hidden=e.target.value!=='din'}});
  if(list)new MutationObserver(function(){addBtns();again()}).observe(list,{childList:true});
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-ja]');if(!b)return;
    var id=b.dataset.ja,o=ords[id]||{};
    if(!cfg.ntfy){say('A loja ainda não ativou os avisos. Fale com a loja.');return}
    fetch('https://ntfy.sh/'+encodeURIComponent(cfg.ntfy)+'/publish?title='+encodeURIComponent('Cliente avisou o Pix')+'&priority=high&tags=shopping_cart&message='+encodeURIComponent((o.name?'O cliente '+o.name:'Um cliente')+' informou que pagou '+R(o.total)+'. Confira o Pix no banco e toque em Pix recebido.'),{mode:'no-cors'}).catch(function(){});
    told[id]=1;try{localStorage.setItem('told',JSON.stringify(told))}catch(x){}
    b.textContent='Aviso enviado. Aguarde a confirmação';b.disabled=true;
    say('Aviso enviado à loja. Ela confirma assim que o Pix chegar.');
  });
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),F=await import(V+'firebase-firestore.js'),app;
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      var db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        uns.forEach(function(f){f()});uns=[];ords={};prep=0;avisos();promo=null;banner();
        if(!u)return;
        uns.push(F.onSnapshot(F.doc(db,'config','loja'),function(s){cfg=s.data()||{}},function(){}));
        uns.push(F.onSnapshot(F.query(F.collection(db,'orders'),F.where('uid','==',u.uid)),function(s){ords={};s.forEach(function(d){ords[d.id]=d.data()});again()},function(){}));
        uns.push(F.onSnapshot(F.doc(db,'config','prep'),function(s){prep=+((s.data()||{}).min)||0;avisos()},function(){}));
        uns.push(F.onSnapshot(F.doc(db,'config','promo'),function(s){promo=s.data()||null;banner()},function(){}));
      });
    }catch(e){}
  })();
})();

/* Pedido único: junta o carrinho da loja com os açaís montados */
(function(){
  var note=null;
  function fr(){var f=document.querySelector('#sec-acai iframe');try{return f&&f.contentWindow}catch(e){return null}}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-a="order"]');if(!b)return;
    try{var w=fr();if(w&&w.acaiCupsCount&&w.acaiCupsCount()>0){e.stopImmediatePropagation();e.preventDefault();w.acaiOrder()}}catch(x){}
  },true);
  setInterval(function(){
    var w=fr(),i=null;try{i=w&&w.acaiInfo&&w.acaiInfo()}catch(e){}
    if(!note){var ci=document.getElementById('citems');if(!ci)return;note=document.createElement('div');note.className='mut';ci.after(note)}
    note.hidden=!(i&&i.n>0);
    if(i&&i.n>0)note.textContent='Mais '+i.n+(i.n==1?' açaí montado':' açaís montados')+' na aba Açaí ('+(+i.total).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})+'): entram neste mesmo pedido.';
  },700);
})();


/* Cupom de desconto no carrinho da loja */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/',F=null,db=null,me=null;
  var R=function(v){return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  function say(t){var m=document.getElementById('msg');if(!m)return;m.textContent=t;clearTimeout(say.t);say.t=setTimeout(function(){m.textContent=''},5000)}
  window.__aplicarCupom=async function(c){
    c=String(c||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(!c){window.__cupom=null;return {ok:true,msg:'Cupom removido.'}}
    if(!F||!db||!me)return {ok:false,msg:'Entre na sua conta primeiro.'};
    try{
      var s=await F.getDoc(F.doc(db,'cupons',c)),d=s.exists()?s.data():null;
      if(!d||!d.on){window.__cupom=null;return {ok:false,msg:'Cupom inválido ou desligado.'}}
      var q=await F.getDocs(F.query(F.collection(db,'orders'),F.where('uid','==',me.uid),F.where('cupom','==',c)));
      var usado=false;q.forEach(function(x){if(x.data().st!=='canc')usado=true});
      if(usado){window.__cupom=null;return {ok:false,msg:'Você já usou este cupom.'}}
      window.__cupom={code:c,pct:+d.pct||0,val:+d.val||0};
      return {ok:true,msg:'Cupom '+c+' aplicado: '+(d.pct?d.pct+'% de desconto.':R(d.val)+' de desconto.')};
    }catch(e){return {ok:false,msg:'Não consegui validar o cupom. Tente de novo.'}}
  };
  var pay=document.getElementById('pay'),lab=pay&&pay.closest('label');
  if(lab){
    var w=document.createElement('div');w.style.cssText='display:flex;gap:8px';
    w.innerHTML='<input id="cupom" placeholder="Cupom de desconto" autocomplete="off" autocapitalize="characters" style="flex:1;min-width:0"><button class="sec" type="button" style="white-space:nowrap">Aplicar</button>';
    lab.before(w);
    w.querySelector('button').addEventListener('click',async function(){
      var r=await window.__aplicarCupom(w.querySelector('input').value);say(r.msg);
      pay.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),app;F=await import(V+'firebase-firestore.js');
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){me=u;window.__cupom=null});
    }catch(e){}
  })();
})();

/* Avaliação do pedido entregue */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/',list=document.getElementById('olist'),F=null,db=null,ords={},uns=[],sel={},txt={};
  var R=function(v){return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  function say(t){var m=document.getElementById('msg');if(!m)return;m.textContent=t;clearTimeout(say.t);say.t=setTimeout(function(){m.textContent=''},5000)}
  function pintar(){
    if(!list)return;
    var arr=Object.keys(ords).map(function(k){var o=ords[k];o.id=k;return o}).sort(function(a,b){return b.t-a.t});
    var rows=list.querySelectorAll(':scope>.row');
    if(!rows.length||rows.length!==arr.length)return;
    rows.forEach(function(r,i){
      var o=arr[i];if(o.st!=='ent'||r.querySelector('[data-rate]'))return;
      var t=r.querySelector('.rh b');if(!t||t.textContent!==R(o.total))return;
      var b=document.createElement('div');b.dataset.rate=o.id;b.style.cssText='margin-top:10px;padding-top:10px;border-top:2px dashed var(--line)';
      if(o.nota){b.innerHTML='<div class="mut">Sua avaliação: <span style="color:#f5a400;font-size:18px">'+'★'.repeat(o.nota)+'</span>'+'☆'.repeat(5-o.nota)+'</div>'}
      else{
        var n=sel[o.id]||0;
        b.innerHTML='<div class="mut">Como foi seu pedido?</div><div style="display:flex;gap:4px;margin:6px 0">'+[1,2,3,4,5].map(function(k){return '<button type="button" data-star="'+k+'" data-oid="'+o.id+'" aria-label="'+k+' estrelas" style="background:none;border:0;font-size:32px;line-height:1;padding:2px 4px;color:'+(k<=n?'#f5a400':'var(--line)')+'">★</button>'}).join('')+'</div><input data-com="'+o.id+'" maxlength="200" placeholder="Comentário (opcional)" value="'+esc(txt[o.id]||'')+'" style="margin-bottom:8px"><button class="sec" type="button" data-send="'+o.id+'" style="width:100%">Enviar avaliação</button>';
      }
      r.appendChild(b);
    });
  }
  if(list){
    new MutationObserver(pintar).observe(list,{childList:true});
    list.addEventListener('input',function(e){var id=e.target.dataset&&e.target.dataset.com;if(id)txt[id]=e.target.value});
    list.addEventListener('click',async function(e){
      var b=e.target.closest('button');if(!b)return;
      if(b.dataset.star){var id=b.dataset.oid;sel[id]=+b.dataset.star;list.querySelectorAll('[data-star][data-oid="'+id+'"]').forEach(function(x){x.style.color=+x.dataset.star<=sel[id]?'#f5a400':'var(--line)'})}
      else if(b.dataset.send){
        var id2=b.dataset.send;
        if(!sel[id2]){say('Toque nas estrelas para dar sua nota.');return}
        if(!F||!db)return;
        try{await F.updateDoc(F.doc(db,'orders',id2),{nota:sel[id2],coment:String(txt[id2]||'').trim().slice(0,200)});say('Obrigado pela avaliação!')}
        catch(er){say('Não consegui enviar a avaliação. Tente de novo.')}
      }
    });
  }
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),app;F=await import(V+'firebase-firestore.js');
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        uns.forEach(function(f){f()});uns=[];ords={};
        if(!u)return;
        uns.push(F.onSnapshot(F.query(F.collection(db,'orders'),F.where('uid','==',u.uid)),function(s){ords={};s.forEach(function(d){ords[d.id]=d.data()});pintar()},function(){}));
      });
    }catch(e){}
  })();
})();
