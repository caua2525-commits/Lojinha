/* Painel do dono: alerta vermelho quando o total do pedido não bate com os preços do catálogo */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/';
  var list=document.getElementById('plist'),ords={},uns=[];
  var R=function(v){return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  function problema(o){
    var its=o.items||[],prods;
    if(!its.length)return 'Pedido sem itens.';
    if(its.some(function(i){return !(i.q>=1)||i.q%1!==0}))return 'Há item com quantidade inválida.';
    try{prods=S.products}catch(e){return ''}
    if(!prods)return '';
    var exp=0;
    its.forEach(function(i){var p=prods.find(function(x){return x.id===i.p});if(p)exp+=p.price*i.q});
    exp=Math.round(exp*100)/100;
    if(Math.abs(exp-(+o.total||0))>0.01)return 'O total do pedido ('+R(o.total)+') não bate com os preços do catálogo ('+R(exp)+').';
    return '';
  }
  function mark(){
    if(!list)return;
    list.querySelectorAll('.row').forEach(function(card){
      if(card.querySelector('.alerta'))return;
      var b=card.querySelector('button[data-id]');if(!b)return;
      var o=ords[b.dataset.id];if(!o||['novo','sep','pronto'].indexOf(o.st)<0)return;
      var t=problema(o);if(!t)return;
      var d=document.createElement('div');d.className='alerta';
      d.style.cssText='background:var(--wb);color:var(--wn);border-radius:10px;padding:8px 10px;margin-bottom:8px;font-size:13px;font-weight:700';
      d.textContent='Atenção: '+t+' Confira antes de confirmar o Pix.';
      card.insertBefore(d,card.firstChild);
    });
  }
  if(list)new MutationObserver(mark).observe(list,{childList:true});
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),F=await import(V+'firebase-firestore.js'),app;
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      var db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        uns.forEach(function(f){f()});uns=[];ords={};
        if(!u)return;
        uns.push(F.onSnapshot(F.collection(db,'orders'),function(s){ords={};s.forEach(function(d){ords[d.id]=d.data()});mark()},function(){}));
      });
    }catch(e){}
  })();
})();
