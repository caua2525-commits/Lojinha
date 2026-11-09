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
  if(list)new MutationObserver(addBtns).observe(list,{childList:true});
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
        uns.forEach(function(f){f()});uns=[];ords={};
        if(!u)return;
        uns.push(F.onSnapshot(F.doc(db,'config','loja'),function(s){cfg=s.data()||{}},function(){}));
        uns.push(F.onSnapshot(F.query(F.collection(db,'orders'),F.where('uid','==',u.uid)),function(s){ords={};s.forEach(function(d){ords[d.id]=d.data()})},function(){}));
      });
    }catch(e){}
  })();
})();
