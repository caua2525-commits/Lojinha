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

/* Visual do painel do dono: mais limpo, com menos texto e animações leves */
(function(){
  var css=`
:root{--bg:#f4f7f5;--line:#e3ebe6;--sh:0 1px 2px rgba(16,40,28,.06),0 6px 18px rgba(16,40,28,.06)}
@media (prefers-color-scheme:dark){:root{--bg:#0c1511;--line:#22322a;--sh:0 1px 2px rgba(0,0,0,.3),0 6px 18px rgba(0,0,0,.25)}}
body{-webkit-tap-highlight-color:transparent}
main{padding-bottom:120px}
h1{font-size:24px;font-weight:800;letter-spacing:-.02em}
h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:26px 0 2px}
.card,.row,.tile{border:0;box-shadow:var(--sh);border-radius:18px}
.card,.row{padding:16px}
.tot{border-radius:22px;background:linear-gradient(135deg,var(--br),#12a064);box-shadow:0 10px 28px rgba(15,123,79,.28)}
.tot b{font-size:38px;letter-spacing:-.02em}
input,select{border:1.5px solid transparent;border-radius:12px;padding:12px 14px;transition:border-color .2s,box-shadow .2s}
input:focus,select:focus{outline:0;border-color:var(--br);box-shadow:0 0 0 4px rgba(15,123,79,.18)}
.pri,.sec,.seg button,.chips button{border:0;border-radius:14px;transition:transform .12s ease,box-shadow .2s,background .2s}
.pri{background:linear-gradient(135deg,var(--br),#12a064)}
.sec{background:var(--bg)}
.pri:active,.sec:active,.seg button:active,.chips button:active{transform:scale(.96)}
.seg button[aria-pressed="true"]{box-shadow:0 4px 14px rgba(15,123,79,.3)}
nav{left:12px;right:12px;bottom:calc(10px + env(safe-area-inset-bottom,0px));border:0;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.22);padding:6px}
nav button{border-radius:18px;transition:background .25s,color .25s,transform .12s}
nav button:active{transform:scale(.94)}
section:not([hidden]){animation:pe-in .3s ease both}
@keyframes pe-in{from{opacity:0;transform:translateY(8px)}}
#msg:not(:empty){bottom:calc(92px + env(safe-area-inset-bottom,0px));border-radius:16px;animation:pe-toast .3s ease both}
@keyframes pe-toast{from{opacity:0;transform:translateY(12px) scale(.96)}}
.card.add>.mut:not([id]),#pinset .mut{display:none}
details.acc{margin:0}
details.acc>summary{list-style:none;cursor:pointer;font-weight:700;display:flex;justify-content:space-between;align-items:center;padding:2px 0}
details.acc>summary::-webkit-details-marker{display:none}
details.acc>summary::after{content:"";width:9px;height:9px;border-right:2.5px solid var(--mut);border-bottom:2.5px solid var(--mut);transform:rotate(45deg);transition:transform .25s}
details.acc[open]>summary::after{transform:rotate(-135deg)}
.accb{display:flex;flex-direction:column;gap:10px;padding-top:12px}
details.acc[open] .accb{animation:pe-in .25s ease both}
.qk{display:flex;justify-content:space-between;align-items:center;background:var(--card);box-shadow:var(--sh);border-radius:18px;padding:14px 16px;font-weight:700;margin:10px 0}
.qk input{appearance:none;-webkit-appearance:none;width:50px;height:30px;padding:0;border:0;border-radius:99px;background:var(--line);position:relative;transition:background .25s}
.qk input::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .25s}
.qk input:checked{background:var(--br)}
.qk input:checked::after{transform:translateX(20px)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
  var st=document.createElement('style');st.id='pe-style';st.textContent=css;document.head.appendChild(st);
  function acc(c){
    if(c.dataset.acc)return;var t=c.querySelector(':scope>b');if(!t)return;c.dataset.acc='1';
    var d=document.createElement('details'),s=document.createElement('summary'),b=document.createElement('div');
    d.className='acc';b.className='accb';s.textContent=t.textContent;t.remove();
    while(c.firstChild)b.appendChild(c.firstChild);
    d.appendChild(s);d.appendChild(b);c.appendChild(d);
  }
  document.querySelectorAll('#v-estoque>.card.add').forEach(acc);
  var ol=document.getElementById('ologged');
  if(ol){
    var cards=[].slice.call(ol.querySelectorAll(':scope>.card.add'));
    cards.forEach(function(c){acc(c);ol.appendChild(c)});
    var o=document.getElementById('oopen');
    if(o){
      var l=document.createElement('label');l.className='qk';
      l.innerHTML='<span>Aceitar pedidos</span><input type="checkbox" id="qk">';
      ol.insertBefore(l,ol.firstChild);
      var q=l.querySelector('input');q.checked=o.checked;
      q.addEventListener('change',function(){o.checked=q.checked;o.dispatchEvent(new Event('change',{bubbles:true}))});
      setInterval(function(){if(document.activeElement!==q)q.checked=o.checked},800);
    }
  }
})();
