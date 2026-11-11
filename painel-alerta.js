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
  function cod(id){var h=7;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return String(100+h%900)}
var LB={novo:'Novo',sep:'Separado',pronto:'Pronto',ent:'Entregue',canc:'Cancelado'};
function conferir(){
  var inp=document.getElementById('cc'),out=document.getElementById('ccr');if(!inp||!out)return;
  var v=inp.value;out.textContent='';if(v.length<3)return;
  function add(t,ok){var d=document.createElement('div');d.textContent=t;d.style.cssText='margin-top:8px;padding:10px 12px;border-radius:12px;font-weight:700;font-size:14px;'+(ok?'background:rgba(27,122,74,.14);border-left:4px solid #1b7a4a':'background:var(--wb);color:var(--wn);border-left:4px solid var(--wn)');out.appendChild(d)}
  var m=Object.keys(ords).filter(function(k){return cod(k)===v}).map(function(k){return {id:k,o:ords[k]}}).sort(function(a,b){return b.o.t-a.o.t}).slice(0,3);
  if(!m.length){add('Nenhum pedido com esse código.',false);return}
  m.forEach(function(x){var o=x.o,ok=['novo','sep','pronto'].indexOf(o.st)>=0;
    add((ok?'Confere: ':o.st==='ent'?'Já entregue: ':'Cancelado: ')+(o.name||'Cliente')+', '+R(o.total)+', '+(o.items||[]).map(function(i){return i.q+'x '+i.n}).join(', ')+' ('+LB[o.st]+', '+(o.pay==='pix'?(o.paid?'Pix confirmado':'Pix a confirmar'):'fiado')+')',ok)});
}
(function(){
  if(!list||!list.previousElementSibling)return;
  var h=list.previousElementSibling,box=document.createElement('div');box.className='card';
  box.innerHTML='<label>Conferir código de retirada<input id="cc" inputmode="numeric" maxlength="3" placeholder="3 números do cliente" autocomplete="off"></label><div id="ccr"></div>';
  h.parentNode.insertBefore(box,h);
  box.querySelector('input').addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,3);conferir()});
})();
function mark(){
    if(!list)return;
    list.querySelectorAll('.row').forEach(function(card){
      if(card.querySelector('.alerta'))return;
      var b=card.querySelector('button[data-id]');if(!b)return;
      var o=ords[b.dataset.id];if(!o||['novo','sep','pronto'].indexOf(o.st)<0)return;
      if(!card.querySelector('.cod3')){var rh=card.querySelector('.rh'),c=document.createElement('span');c.className='cod3';c.textContent='Código '+cod(b.dataset.id);c.style.cssText='background:#ffd21f;color:#10295a;border-radius:99px;padding:3px 12px;font:800 14px ui-monospace,Menlo,monospace;letter-spacing:.08em;white-space:nowrap';if(rh)rh.insertBefore(c,rh.lastElementChild)}
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
        uns.push(F.onSnapshot(F.collection(db,'orders'),function(s){ords={};s.forEach(function(d){ords[d.id]=d.data()});mark();conferir()},function(){}));
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

/* Tema profissional do painel: azul-marinho e amarelo, igual à identidade da loja */
(function(){
  var css=`
:root{--bg:#f2f4fa;--card:#fff;--ink:#0f2350;--mut:#5d6b8c;--line:#e1e6f2;--br:#10295a;--bri:#fff;--wn:#c62828;--wb:#fdeaea;--sh:0 1px 2px rgba(16,41,90,.06),0 8px 22px rgba(16,41,90,.08)}
@media (prefers-color-scheme:dark){:root{--bg:#0a1430;--card:#122450;--ink:#eef2ff;--mut:#9fb0d6;--line:#243a6b;--br:#ffd21f;--bri:#10295a;--wn:#ff8a7e;--wb:#3a1b22;--sh:0 1px 2px rgba(0,0,0,.35),0 8px 22px rgba(0,0,0,.3)}}
body{font-family:Figtree,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{max-width:none;margin:0;padding-top:20px;padding-bottom:22px;padding-left:max(16px,calc((100vw - 640px)/2 + 16px));padding-right:max(16px,calc((100vw - 640px)/2 + 16px));background:linear-gradient(135deg,#10295a,#1d4ba0);border-radius:0 0 28px 28px;box-shadow:0 10px 30px rgba(16,41,90,.25)}
h1{font-family:"Alfa Slab One",Georgia,serif;font-weight:400;font-size:27px;color:#fff}
#hoje{color:#ffd21f;font-weight:700;text-transform:capitalize;margin-top:2px}
header .sec{background:rgba(255,255,255,.14);color:#fff;border:0}
header input{color:var(--ink)}
main{padding-top:18px}
#busca{background:var(--card);box-shadow:var(--sh);border-radius:99px;padding-left:18px}
.tot{position:relative;overflow:hidden;background:linear-gradient(135deg,#10295a,#2257b8);color:#fff;box-shadow:0 12px 28px rgba(16,41,90,.3)}
.tot::after{content:"";position:absolute;right:-34px;top:-34px;width:130px;height:130px;border-radius:50%;background:rgba(255,210,31,.22)}
.tot b{color:#ffd21f}
.tile{border-top:4px solid #ffd21f}
.row{border-left:4px solid #ffd21f}
.badge{background:#ffd21f;color:#10295a}
.pri{background:var(--br);color:var(--bri)}
.sec{background:var(--bg);color:var(--ink)}
#done{background:#ffd21f;color:#10295a;box-shadow:0 8px 18px rgba(255,210,31,.35)}
.seg button[aria-pressed="true"]{box-shadow:0 4px 14px rgba(16,41,90,.3)}
input:focus,select:focus{border-color:#ffd21f;box-shadow:0 0 0 4px rgba(255,210,31,.28)}
nav button{display:flex;flex-direction:column;align-items:center;gap:1px;font-size:11px;font-weight:700;padding:8px 2px}
nav button::before{font-size:19px;line-height:1.2;filter:grayscale(.6);opacity:.75;transition:filter .25s,opacity .25s,transform .25s}
nav button[aria-current="page"]{background:var(--br);color:var(--bri)}
nav button[aria-current="page"]::before{filter:none;opacity:1;transform:translateY(-1px) scale(1.1)}
#n-vender::before{content:"\\1F6D2"}#n-estoque::before{content:"\\1F4E6"}#n-resumo::before{content:"\\1F4CA"}#n-fiado::before{content:"\\1F4D2"}#n-ped::before{content:"\\1F9FE"}
`;
  var st=document.createElement('style');st.id='pe-tema';st.textContent=css;document.head.appendChild(st);
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.content='#10295a';
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Figtree:wght@500;700;800&display=swap';
  document.head.appendChild(l);
})();
