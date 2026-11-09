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
