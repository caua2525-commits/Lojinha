/* Painel do dono: alerta vermelho quando o total do pedido não bate com os preços do catálogo */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/';
  var list=document.getElementById('plist'),ords={},uns=[];
  window.__pedidos=function(){return ords};
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
    var d=+o.desc||0;
    if(d>0){
      if(window.__cupons){
        var cp=window.__cupons[o.cupom];
        if(!cp||!cp.on)return 'O cupom '+(o.cupom||'')+' não existe ou está desligado.';
        var ok=Math.min(exp,Math.round((cp.pct?exp*cp.pct/100:cp.val)*100)/100);
        if(Math.abs(ok-d)>0.01)return 'O desconto ('+R(d)+') não confere com o cupom '+o.cupom+' ('+R(ok)+').';
        if(Object.keys(ords).some(function(k){var x=ords[k];return x.uid===o.uid&&x.cupom===o.cupom&&x.st!=='canc'&&x.t<o.t}))return 'O cliente já usou o cupom '+o.cupom+' antes.';
      }
      exp=Math.round((exp-d)*100)/100;
    }
    if(Math.abs(exp-(+o.total||0))>0.01)return 'O total do pedido ('+R(o.total)+') não bate com os preços do catálogo ('+R(exp)+').';
    return '';
  }
  var LB={novo:'Novo',sep:'Separado',pronto:'Pronto',ent:'Entregue',canc:'Cancelado'};
function conferir(){
  var inp=document.getElementById('cc'),out=document.getElementById('ccr');if(!inp||!out)return;
  var v=inp.value;out.textContent='';if(v.length<3)return;
  function add(t,ok){var d=document.createElement('div');d.textContent=t;d.style.cssText='margin-top:8px;padding:10px 12px;border-radius:12px;font-weight:700;font-size:14px;'+(ok?'background:rgba(27,122,74,.14);border-left:4px solid #1b7a4a':'background:var(--wb);color:var(--wn);border-left:4px solid var(--wn)');out.appendChild(d)}
  var m=Object.keys(ords).filter(function(k){return String(ords[k].code||'')===v}).map(function(k){return {id:k,o:ords[k]}}).sort(function(a,b){return b.o.t-a.o.t}).slice(0,3);
  if(!m.length){add('Nenhum pedido com esse código.',false);return}
  m.forEach(function(x){var o=x.o,ok=['novo','sep','pronto'].indexOf(o.st)>=0;
    add((ok?'Confere: ':o.st==='ent'?'Já entregue: ':'Cancelado: ')+(o.name||'Cliente')+', '+R(o.total)+', '+(o.items||[]).map(function(i){return i.q+'x '+i.n}).join(', ')+' ('+LB[o.st]+', '+(o.pay==='pix'?(o.paid?'Pix confirmado':'Pix a confirmar'):o.pay==='din'?'dinheiro na retirada':o.pay==='car'?'cartão na retirada':'fiado')+')',ok)});
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
      if(o.obs&&!card.querySelector('.obs3')){var rh=card.querySelector('.rh'),ob=document.createElement('div');ob.className='obs3';ob.textContent='Obs: '+o.obs;ob.style.cssText='background:#fff3b0;color:#5a4000;border-radius:10px;padding:8px 10px;margin:6px 0;font-size:14px;font-weight:700';if(rh)rh.after(ob)}
      var ex=[];if(o.ret)ex.push('Retirada: '+o.ret);if(o.pay==='din'&&o.troco>o.total)ex.push('Troco para '+R(o.troco)+': devolver '+R(o.troco-o.total));
      if(ex.length&&!card.querySelector('.ret3')){var rh2=card.querySelector('.rh'),r3=document.createElement('div');r3.className='ret3';r3.textContent=ex.join(' | ');r3.style.cssText='background:#e3ecff;color:#10295a;border-radius:10px;padding:8px 10px;margin:6px 0;font-size:14px;font-weight:700';if(rh2)rh2.after(r3)}
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

/* Resumo: itens mais e menos vendidos na semana */
(function(){
  var sec=document.getElementById('v-resumo'),res=document.getElementById('res');
  if(!sec)return;
  var card=document.createElement('div');card.className='card';card.id='semana';
  sec.insertBefore(card,sec.firstChild);
  var nz=function(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var extra=function(p){var c=p?nz(p.cat):'';return c==='ingredientes'||c.indexOf('cobertura')===0};
  function linha(n,q,max,cor){
    var w=max?Math.max(q>0?4:0,q/max*100):0;
    return '<div style="margin:10px 0 2px"><div style="display:flex;justify-content:space-between;gap:10px;font-weight:700"><span>'+esc(n)+'</span><span>'+q+' un</span></div><div style="height:6px;border-radius:99px;background:var(--bg);margin-top:5px"><div style="height:6px;border-radius:99px;width:'+w+'%;background:'+cor+';transition:width .5s ease"></div></div></div>';
  }
  function bloco(t,arr,max,cor){
    if(!arr.length)return '';
    return '<div class="mut" style="margin-top:16px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">'+t+'</div>'+arr.map(function(x){return linha(x.n,x.q,max,cor)}).join('');
  }
  function pintar(){
    var S2;try{S2=S}catch(e){return}
    var ds=[];for(var i=0;i<7;i++)ds.push(new Date(Date.now()-i*864e5).toLocaleDateString('sv-SE'));
    var m={};
    function add(id,n,q){var x=m[id]||(m[id]={n:n,q:0});x.q+=q}
    (S2.sales||[]).forEach(function(s){if(ds.indexOf(s.d)<0)return;(s.items||[]).forEach(function(i){add(i.p,i.n,+i.q||0)})});
    ds.forEach(function(d){var o=(S2.days||{})[d]||{};Object.keys(o).forEach(function(id){add(id,o[id].n,+o[id].q||0)})});
    var prods=S2.products||[],byId={};prods.forEach(function(p){byId[p.id]=p});
    var normais=[],extras=[];
    Object.keys(m).forEach(function(id){var p=byId[id],x={id:id,n:p?p.name:m[id].n,q:m[id].q};(extra(p)?extras:normais).push(x)});
    prods.forEach(function(p){if(!m[p.id]&&!extra(p))normais.push({id:p.id,n:p.name,q:0})});
    var top=normais.filter(function(x){return x.q>0}).sort(function(a,b){return b.q-a.q}).slice(0,5),inTop={};
    top.forEach(function(x){inTop[x.id]=1});
    var low=normais.filter(function(x){return byId[x.id]&&!inTop[x.id]}).sort(function(a,b){return a.q-b.q||a.n.localeCompare(b.n,'pt-BR')}).slice(0,5);
    var ex=extras.filter(function(x){return x.q>0}).sort(function(a,b){return b.q-a.q}).slice(0,5);
    var h='<b>Semana: mais e menos vendidos</b><div class="mut">Últimos 7 dias</div>';
    if(!top.length&&!ex.length)h+='<p class="mut">Nenhuma venda nos últimos 7 dias.</p>';
    else{var mx=top.length?top[0].q:0;h+=bloco('Mais vendidos',top,mx,'var(--br)')+bloco('Menos vendidos',low,mx,'var(--wn)')+bloco('Ingredientes e coberturas mais pedidos',ex,ex.length?ex[0].q:0,'#ffd21f')}
    if(card.innerHTML!==h)card.innerHTML=h;
  }
  if(res)new MutationObserver(pintar).observe(res,{childList:true});
  pintar();setTimeout(pintar,800);setInterval(pintar,30000);
})();


/* Tempo de preparo: o dono define e o cliente vê na loja */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/',ol=document.getElementById('ologged');
  if(!ol)return;
  var l=document.createElement('label');
  l.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--card);box-shadow:var(--sh);border-radius:18px;padding:12px 16px;font-weight:700;margin:10px 0';
  l.innerHTML='<span>Tempo de preparo (minutos)</span><input id="prepmin" type="number" inputmode="numeric" min="0" max="180" placeholder="0" style="width:84px;text-align:center">';
  var qk=ol.querySelector('.qk');if(qk)qk.after(l);else ol.insertBefore(l,ol.firstChild);
  var inp=l.querySelector('input'),F=null,db=null,uns=[];
  function say(t){var m=document.getElementById('msg');if(!m)return;m.textContent=t;setTimeout(function(){m.textContent=''},4000)}
  inp.addEventListener('change',async function(){
    if(!F||!db){say('Entre na conta da loja online primeiro.');return}
    var n=Math.max(0,Math.min(180,Math.round(+inp.value||0)));inp.value=n||'';
    try{await F.setDoc(F.doc(db,'config','prep'),{min:n});say(n?'Tempo de preparo: '+n+' min.':'Tempo de preparo removido.')}catch(e){say('Não consegui salvar o tempo de preparo.')}
  });
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),app;F=await import(V+'firebase-firestore.js');
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        uns.forEach(function(f){f()});uns=[];
        if(!u)return;
        uns.push(F.onSnapshot(F.doc(db,'config','prep'),function(s){if(document.activeElement!==inp)inp.value=(s.data()||{}).min||''},function(){}));
      });
    }catch(e){}
  })();
})();

/* Aviso no celular quando um produto chega no estoque mínimo */
(function(){
  var prev=null;
  function aviso(p){
    var t;try{t=S.cfg.ntfy}catch(e){return}
    if(!t)return;
    fetch('https://ntfy.sh/'+encodeURIComponent(t)+'/publish?title='+encodeURIComponent(p.qty<=0?'Acabou: '+p.name:'Estoque baixo: '+p.name)+'&tags=warning&message='+encodeURIComponent(p.qty<=0?'O estoque zerou.':'Restam '+p.qty+' unidades.'),{mode:'no-cors'}).catch(function(){});
  }
  setInterval(function(){
    var ps;try{ps=S.products}catch(e){return}
    if(!ps)return;
    var cur={};ps.forEach(function(p){cur[p.id]=p.qty<=(p.min==null?5:p.min)});
    if(prev)ps.forEach(function(p){if(cur[p.id]&&!prev[p.id])aviso(p)});
    prev=cur;
  },4000);
})();


/* Promoção do dia: faixa no topo da loja, ligada e desligada pelo dono */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/',ol=document.getElementById('ologged');
  if(!ol)return;
  var t=document.createElement('label');t.className='qk';
  t.innerHTML='<span>Promoção do dia na loja</span><input type="checkbox" id="promoon">';
  var x=document.createElement('div');
  x.style.cssText='background:var(--card);box-shadow:var(--sh);border-radius:18px;padding:12px 16px;margin:10px 0';
  x.innerHTML='<input id="promotxt" maxlength="80" placeholder="Ex.: Açaí 500ml por R$ 14 hoje" autocomplete="off">';
  var pm=document.getElementById('prepmin'),anc=pm&&pm.parentNode;
  if(anc){anc.after(t);t.after(x)}else{ol.insertBefore(x,ol.firstChild);ol.insertBefore(t,ol.firstChild)}
  var on=t.querySelector('input'),tx=x.querySelector('input'),F=null,db=null,uns=[];
  function say(m){var e=document.getElementById('msg');if(!e)return;e.textContent=m;setTimeout(function(){e.textContent=''},4000)}
  async function salvar(){
    if(!F||!db){say('Entre na conta da loja online primeiro.');return}
    var txt=tx.value.trim().slice(0,80);
    try{await F.setDoc(F.doc(db,'config','promo'),{txt:txt,on:on.checked});say(on.checked&&txt?'Promoção publicada na loja.':'Promoção desligada.')}catch(e){say('Não consegui salvar a promoção.')}
  }
  on.addEventListener('change',salvar);tx.addEventListener('change',salvar);
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),app;F=await import(V+'firebase-firestore.js');
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        uns.forEach(function(f){f()});uns=[];
        if(!u)return;
        uns.push(F.onSnapshot(F.doc(db,'config','promo'),function(s){var d=s.data()||{};if(document.activeElement!==tx)tx.value=d.txt||'';if(document.activeElement!==on)on.checked=!!d.on},function(){}));
      });
    }catch(e){}
  })();
})();

/* Resumo: gráficos por dia da semana, por horário e clientes que mais compram */
(function(){
  var sec=document.getElementById('v-resumo'),res=document.getElementById('res');
  if(!sec)return;
  var card=document.createElement('div');card.className='card';card.id='graficos';
  var ant=document.getElementById('semana');
  if(ant)ant.after(card);else sec.insertBefore(card,sec.firstChild);
  var R=function(v){return (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var DIA=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],DIAF=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  var tit=function(t){return '<div class="mut" style="margin-top:16px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">'+t+'</div>'};
  function colunas(vals,rot){
    var mx=Math.max.apply(null,vals),best=mx>0?vals.indexOf(mx):-1,g=vals.length>10?2:6;
    var barras=vals.map(function(v,i){return '<div style="flex:1;min-width:0;display:flex;align-items:flex-end;height:100%"><div style="width:100%;height:'+(v?Math.max(4,v/mx*100):0)+'%;border-radius:6px 6px 2px 2px;background:'+(i===best?'var(--br)':'var(--mut)')+';opacity:'+(i===best?1:.4)+';transition:height .5s ease"></div></div>'}).join('');
    var nomes=rot.map(function(r){return '<div style="flex:1;min-width:0;display:flex;justify-content:center"><span style="white-space:nowrap;font-size:10px;font-weight:700;color:var(--mut)">'+r+'</span></div>'}).join('');
    return '<div style="display:flex;align-items:flex-end;gap:'+g+'px;height:96px;margin-top:10px">'+barras+'</div><div style="display:flex;gap:'+g+'px;margin-top:4px">'+nomes+'</div>';
  }
  function pintar(){
    var S2;try{S2=S}catch(e){return}
    var desde=Date.now()-28*864e5,dia=[0,0,0,0,0,0,0],hor=[],n=0,i;
    for(i=0;i<24;i++)hor.push(0);
    (S2.sales||[]).forEach(function(s){if(!(s.t>=desde))return;var d=new Date(s.t),v=+s.tot||0;dia[d.getDay()]+=v;hor[d.getHours()]+=v;n++});
    var h='<b>Quando a loja mais vende</b><div class="mut">Últimos 28 dias</div>';
    if(!n)h+='<p class="mut">Ainda sem vendas para mostrar.</p>';
    else{
      var md=dia.indexOf(Math.max.apply(null,dia)),mh=hor.indexOf(Math.max.apply(null,hor));
      h+='<div class="mut" style="margin-top:6px">Melhor dia: <b>'+DIAF[md]+'</b>. Horário de pico: <b>'+mh+'h</b>.</div>';
      h+=tit('Por dia da semana')+colunas(dia,DIA);
      h+=tit('Por horário')+colunas(hor,hor.map(function(_,k){return k%3===0?k+'h':''}));
    }
    var po=window.__pedidos?window.__pedidos():{},g={},lim=Date.now()-30*864e5;
    Object.keys(po).forEach(function(k){var o=po[k];if(o.st!=='ent'||!(o.t>=lim))return;var key=o.uid||o.name,x=g[key]||(g[key]={n:o.name||'Cliente',q:0,v:0});x.q++;x.v+=+o.total||0});
    var cl=Object.keys(g).map(function(k){return g[k]}).sort(function(a,b){return b.v-a.v}).slice(0,5);
    if(cl.length)h+=tit('Clientes que mais compram (30 dias)')+cl.map(function(c){return '<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line);font-weight:700"><span>'+esc(c.n)+'<br><span class="mut">'+c.q+(c.q==1?' pedido':' pedidos')+'</span></span><span>'+R(c.v)+'</span></div>'}).join('');
    var av=Object.keys(po).map(function(k){return po[k]}).filter(function(o){return o.nota>=1&&o.t>=lim});
    if(av.length){
      var sm=av.reduce(function(a,o){return a+(+o.nota)},0)/av.length;
      h+=tit('Avaliações dos clientes (30 dias)')+'<div style="font-weight:800;font-size:22px;margin-top:6px">'+sm.toFixed(1).replace('.',',')+' <span style="color:#f5a400">★</span> <span class="mut">('+av.length+(av.length==1?' avaliação':' avaliações')+')</span></div>';
      h+=av.filter(function(o){return o.coment}).sort(function(a,b){return b.t-a.t}).slice(0,5).map(function(o){return '<div style="padding:8px 0;border-bottom:1px dashed var(--line)"><span style="color:#f5a400">'+'★'.repeat(o.nota)+'</span><span class="mut">'+'★'.repeat(5-o.nota)+'</span> <b>'+esc(o.name||'Cliente')+'</b><br>'+esc(o.coment)+'</div>'}).join('');
    }
    if(card.innerHTML!==h)card.innerHTML=h;
  }
  if(res)new MutationObserver(pintar).observe(res,{childList:true});
  pintar();setTimeout(pintar,900);setInterval(pintar,30000);
})();


/* Cupons de desconto: o dono cria, liga, desliga e exclui */
(function(){
  var V='https://www.gstatic.com/firebasejs/10.14.1/',ol=document.getElementById('ologged');
  if(!ol)return;
  var c=document.createElement('div');c.className='card';
  c.innerHTML='<details class="acc"><summary>Cupons de desconto</summary><div class="accb"><input id="cpcode" placeholder="Código (ex.: PRIMEIRA10)" maxlength="15" autocapitalize="characters" autocomplete="off"><div class="two"><select id="cptipo"><option value="pct">% de desconto</option><option value="val">R$ de desconto</option></select><input id="cpval" inputmode="decimal" placeholder="Valor" autocomplete="off"></div><button class="pri" id="cpsave" type="button">Salvar cupom</button><div class="mut">Cada cliente pode usar o mesmo cupom uma vez.</div><div id="cplist"></div></div></details>';
  ol.appendChild(c);
  var F=null,db=null,uns=[],lista={};
  function say(m){var e=document.getElementById('msg');if(!e)return;e.textContent=m;setTimeout(function(){e.textContent=''},4000)}
  function pintar(){
    var ids=Object.keys(lista).sort();
    document.getElementById('cplist').innerHTML=ids.map(function(id){var d=lista[id];
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--line)"><span><b>'+id+'</b><br><span class="mut">'+(d.pct?d.pct+'% de desconto':'R$ '+String(d.val).replace('.',',')+' de desconto')+', '+(d.on?'ligado':'desligado')+'</span></span><span style="display:flex;gap:6px"><button class="sec" type="button" data-cp="tog" data-id="'+id+'" style="padding:8px 12px">'+(d.on?'Desligar':'Ligar')+'</button><button class="sec" type="button" data-cp="del" data-id="'+id+'" style="padding:8px 12px">Excluir</button></span></div>'}).join('');
  }
  c.addEventListener('click',async function(e){
    var b=e.target.closest('button');if(!b)return;
    if(!F||!db){say('Entre na conta da loja online primeiro.');return}
    try{
      if(b.id==='cpsave'){
        var code=document.getElementById('cpcode').value.toUpperCase().replace(/[^A-Z0-9]/g,''),tipo=document.getElementById('cptipo').value,v=parseFloat(String(document.getElementById('cpval').value).replace(',','.'));
        if(code.length<3){say('Use um código de 3 a 15 letras ou números.');return}
        if(!(v>0)||(tipo==='pct'&&v>100)){say(tipo==='pct'?'Informe uma porcentagem de 1 a 100.':'Informe o valor do desconto em reais.');return}
        await F.setDoc(F.doc(db,'cupons',code),{pct:tipo==='pct'?v:0,val:tipo==='val'?v:0,on:true});
        document.getElementById('cpcode').value='';document.getElementById('cpval').value='';say('Cupom '+code+' salvo.');
      }else if(b.dataset.cp==='tog'){await F.updateDoc(F.doc(db,'cupons',b.dataset.id),{on:!lista[b.dataset.id].on})}
      else if(b.dataset.cp==='del'){if(confirm('Excluir o cupom '+b.dataset.id+'?'))await F.deleteDoc(F.doc(db,'cupons',b.dataset.id))}
    }catch(er){say('Não consegui salvar o cupom. Confira se as regras do Firestore foram atualizadas.')}
  });
  (async function(){
    try{
      var A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),app;F=await import(V+'firebase-firestore.js');
      for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
      if(!app)return;
      db=F.getFirestore(app);
      Au.onAuthStateChanged(Au.getAuth(app),function(u){
        uns.forEach(function(f){f()});uns=[];lista={};window.__cupons=undefined;pintar();
        if(!u)return;
        uns.push(F.onSnapshot(F.collection(db,'cupons'),function(s){lista={};s.forEach(function(d){lista[d.id]=d.data()});window.__cupons=lista;pintar()},function(){}));
      });
    }catch(e){}
  })();
})();


/* Logo no topo do painel do dono (centralizada) */
(function(){
  var h=document.querySelector('header'),t=document.getElementById('ttl');
  if(!h||!t||document.getElementById('logo'))return;
  var st=document.createElement('style');
  st.textContent='header{text-align:center}#logo{display:block;width:80px;height:80px;margin:0 auto 6px;filter:drop-shadow(0 8px 12px rgba(0,0,0,.35));animation:logoIn .7s cubic-bezier(.2,1.3,.4,1) both,logoFloat 4.5s ease-in-out .8s infinite}#logo svg{display:block;width:100%;height:100%}#ptag{display:inline-block;margin:0 0 6px;padding:2px 12px;border-radius:99px;background:rgba(255,255,255,.16);color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}@keyframes logoIn{from{opacity:0;transform:scale(.6) rotate(-10deg)}}@keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@media (prefers-reduced-motion:reduce){#logo{animation:none}}';
  document.head.appendChild(st);
  var d=document.createElement('div');d.id='logo';d.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Loja Andrea"><defs><linearGradient id="lgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe566"/><stop offset="1" stop-color="#ffbf00"/></linearGradient><linearGradient id="lgBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2358b8"/><stop offset="1" stop-color="#0d2250"/></linearGradient><linearGradient id="lgAcai" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9b4dc4"/><stop offset="1" stop-color="#4b1c70"/></linearGradient><radialGradient id="lgShine" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="60" r="57" fill="url(#lgBg)" stroke="#10295a" stroke-width="4"/><circle cx="60" cy="60" r="50" fill="none" stroke="#10295a" stroke-width="1.2" stroke-dasharray="1.5 4" stroke-linecap="round" opacity=".45"/><ellipse cx="60" cy="98.5" rx="27" ry="3.6" fill="#10295a" opacity=".16"/><g transform="translate(80 46) rotate(28) scale(.8)"><rect x="-2.2" y="-26" width="4.4" height="32" rx="2.2" fill="#10295a"/><ellipse cx="0" cy="-28" rx="6.6" ry="8.6" fill="#10295a"/><ellipse cx="-1.7" cy="-30.6" rx="2" ry="3.4" fill="#fff" opacity=".25"/></g><path d="M26 66C26 43 40 30 60 30s34 13 34 36z" fill="url(#lgAcai)"/><path d="M26 66C26 43 40 30 60 30s34 13 34 36z" fill="url(#lgShine)"/><path d="M36 54c5-9 12-13 21-14" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3.2" stroke-linecap="round"/><g fill="#e2b265" stroke="#b9853a" stroke-width=".6"><rect x="31" y="53" width="5.5" height="3.2" rx="1.4" transform="rotate(-28 33 54)"/><rect x="55" y="49" width="5.5" height="3.2" rx="1.4" transform="rotate(14 57 50)"/><rect x="84" y="55" width="5.5" height="3.2" rx="1.4" transform="rotate(32 86 56)"/><rect x="73" y="35" width="5" height="3" rx="1.4" transform="rotate(-18 75 36)"/></g><g stroke="#d9b13c" stroke-width="1.1"><circle cx="70" cy="42" r="6.6" fill="#fff0a8"/><circle cx="70" cy="42" r="3" fill="#ffe27a" stroke="none"/><circle cx="82" cy="50" r="5.6" fill="#fff0a8"/><circle cx="82" cy="50" r="2.5" fill="#ffe27a" stroke="none"/></g><path d="M46 36.5c-3.4-3.4-10-1.2-9.6 4.3.4 4.6 5.4 8.6 9.6 10.7 4.2-2.1 9.2-6.1 9.6-10.7.4-5.5-6.2-7.7-9.6-4.3z" fill="#e8252b" stroke="#a81218" stroke-width="1"/><path d="M40.5 36l5.5 3.2 5.5-3.2-1.8 5.2h-7.4z" fill="#2fa04e" stroke="#1f7a39" stroke-width=".8" stroke-linejoin="round"/><g fill="#ffe3b0"><ellipse cx="42.5" cy="44" rx=".8" ry="1.2"/><ellipse cx="46" cy="46.5" rx=".8" ry="1.2"/><ellipse cx="49.5" cy="44" rx=".8" ry="1.2"/></g><g><circle cx="38" cy="58" r="3.6" fill="#2b2f7a"/><circle cx="37" cy="57" r="1" fill="#fff" opacity=".6"/><circle cx="64" cy="57" r="3.6" fill="#2b2f7a"/><circle cx="63" cy="56" r="1" fill="#fff" opacity=".6"/></g><path d="M19 66h82c0 22-18 33-41 33S19 88 19 66z" fill="url(#lgBowl)"/><path d="M19 66h82" stroke="#ffd21f" stroke-width="3.4" stroke-linecap="round"/><path d="M28 74c3 9 11 15 20 17" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/><path transform="translate(27 31)" d="M0-5 1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3Z" fill="#fff" opacity=".95"/><path transform="translate(95 85) scale(.6)" d="M0-5 1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3Z" fill="#fff" opacity=".9"/></svg>`;
  var g=document.createElement('div');g.id='ptag';g.textContent='Painel do dono';
  h.insertBefore(d,h.firstChild);d.after(g);
})();


/* Ajudante: conecta ao Firebase já iniciado pelo app */
window.__fb=window.__fb||(async function(){
  try{
    var V='https://www.gstatic.com/firebasejs/10.14.1/',A=await import(V+'firebase-app.js'),Au=await import(V+'firebase-auth.js'),F=await import(V+'firebase-firestore.js'),app;
    for(var i=0;i<50&&!(app=A.getApps()[0]);i++)await new Promise(function(r){setTimeout(r,200)});
    return app?{F:F,Au:Au,db:F.getFirestore(app),auth:Au.getAuth(app)}:null;
  }catch(e){return null}
})();

/* Tela de abertura: o logo aparece grande por um instante */
(function(){
  try{if(sessionStorage.getItem('splash'))return;sessionStorage.setItem('splash','1')}catch(e){}
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var lg=document.getElementById('logo'),t=document.getElementById('ttl');if(!lg)return;
  var o=document.createElement('div');o.id='splash';
  o.style.cssText='position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--bg);transition:opacity .5s ease,transform .5s ease';
  var d=document.createElement('div');d.style.cssText='width:170px;height:170px;filter:drop-shadow(0 14px 18px rgba(16,41,90,.3));animation:logoIn .8s cubic-bezier(.2,1.3,.4,1) both';d.innerHTML=lg.innerHTML;
  var n=document.createElement('div');n.textContent=t?t.textContent:'';n.style.cssText='font:400 30px "Alfa Slab One",Georgia,serif;color:var(--ink);text-align:center;padding:0 20px';
  o.appendChild(d);o.appendChild(n);document.body.appendChild(o);
  setTimeout(function(){o.style.opacity='0';o.style.transform='scale(1.04)';setTimeout(function(){o.remove()},520)},1300);
})();

/* Selos nos produtos: o dono escolhe Novo, Mais pedido ou Promoção em cada produto */
(function(){
  var lista=document.getElementById('lista');if(!lista)return;
  var selos={},ctx=null,un=null;
  function say(m){var e=document.getElementById('msg');if(!e)return;e.textContent=m;clearTimeout(say.t);say.t=setTimeout(function(){e.textContent=''},4000)}
  function decorar(){
    lista.querySelectorAll(':scope>.row').forEach(function(r){
      if(r.querySelector('.selo-ctl'))return;
      var inp=r.querySelector('[data-id]');if(!inp)return;
      var id=inp.dataset.id,s=selos[id]||{},w=document.createElement('div');
      w.className='selo-ctl';w.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px';
      w.innerHTML='<label>Selo na loja<select data-selo="'+id+'"><option value="">Sem selo</option><option value="novo">Novo</option><option value="mais">Mais pedido</option><option value="promo">Promoção</option></select></label><label>Preço antigo (R$)<input data-old="'+id+'" inputmode="decimal" placeholder="Só na promoção" autocomplete="off"></label>';
      w.querySelector('select').value=s.t||'';w.querySelector('input').value=s.old?String(s.old).replace('.',','):'';
      r.appendChild(w);
    });
  }
  new MutationObserver(decorar).observe(lista,{childList:true});decorar();
  lista.addEventListener('change',async function(e){
    var id=e.target.dataset&&(e.target.dataset.selo||e.target.dataset.old);if(!id)return;
    if(!ctx){say('Entre na conta da loja online primeiro (aba Pedidos).');return}
    var w=e.target.closest('.selo-ctl'),t=w.querySelector('select').value,old=parseFloat(String(w.querySelector('input').value).replace(',','.'))||0;
    var val=t?(t==='promo'&&old>0?{t:t,old:old}:{t:t}):ctx.F.deleteField(),obj={};obj[id]=val;
    try{await ctx.F.setDoc(ctx.F.doc(ctx.db,'config','selos'),obj,{merge:true});say(t?'Selo salvo.':'Selo removido.')}
    catch(er){say('Não consegui salvar o selo.')}
  });
  window.__fb.then(function(x){
    if(!x)return;ctx=x;
    x.Au.onAuthStateChanged(x.auth,function(u){
      if(un){un();un=null}selos={};
      if(!u)return;
      un=x.F.onSnapshot(x.F.doc(x.db,'config','selos'),function(s){
        selos=s.data()||{};
        lista.querySelectorAll('.selo-ctl').forEach(function(w){if(!w.contains(document.activeElement))w.remove()});decorar();
      },function(){});
    });
  });
})();
