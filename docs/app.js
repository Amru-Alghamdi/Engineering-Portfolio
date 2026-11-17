(function(){
var D=document,R=D.documentElement;
try{var t=localStorage.getItem('theme');if(t)R.setAttribute('data-theme',t);}catch(e){}
function isDark(){var t=R.getAttribute('data-theme');return t?t==='dark':window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;}
function CalcError(m,id){this.message=m;this.id=id;}
var A=window.App={};
A.err=function(m,id){throw new CalcError(m,id);};
A.esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
A.fin=function(x,what){if(typeof x!=='number'||!isFinite(x))throw new CalcError((what||'A result')+' is not a finite number; check the inputs.');return x;};
A.fmt=function(x,d){A.fin(x);if(d==null)d=3;var a=Math.abs(x);if(a!==0&&(a>=1e9||a<Math.pow(10,-d)/2))return x.toExponential(Math.max(2,d));
 var s=x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});return s==='-0'||/^-0\.0*$/.test(s)?s.slice(1):s;};
function lab(el){var l=el.id&&D.querySelector('label[for="'+el.id+'"]');return el.getAttribute('data-label')||(l?l.textContent:el.id);}
function hidden(el){return !!el.closest('[hidden]');}
A.v=function(id){var el=typeof id==='string'?D.getElementById(id):id;if(!el)throw new CalcError('Missing input '+id);
 var s=String(el.value).trim();if(s===''){if(el.hasAttribute('data-opt'))return null;throw new CalcError(lab(el)+': value is empty or not a valid number.',el.id);}
 var x=Number(s);if(!isFinite(x))throw new CalcError(lab(el)+': must be a finite number.',el.id);
 if(el.min!==''&&el.min!=null&&x<Number(el.min))throw new CalcError(lab(el)+': must be at least '+el.min+'.',el.id);
 if(el.max!==''&&el.max!=null&&x>Number(el.max))throw new CalcError(lab(el)+': must be at most '+el.max+'.',el.id);
 if(el.hasAttribute('data-gt')&&!(x>Number(el.getAttribute('data-gt'))))throw new CalcError(lab(el)+': must be greater than '+el.getAttribute('data-gt')+'.',el.id);
 return x;};
A.s=function(id){return D.getElementById(id).value;};
var last='';
function render(r){var h='',txt=[];
 (r.rows||[]).forEach(function(w){if(typeof w==='string'){h+='<tr class="sec"><td colspan="3">'+A.esc(w)+'</td></tr>';txt.push('','['+w+']');return;}
  h+='<tr'+(w[3]?' class="'+w[3]+'"':'')+'><td>'+A.esc(w[0])+'</td><td class="n">'+w[1]+'</td><td class="u">'+A.esc(w[2]||'')+'</td></tr>';txt.push(w[0]+': '+String(w[1]).replace(/<[^>]+>/g,'')+(w[2]?' '+w[2]:''));});
 var o='';(r.ok||[]).forEach(function(m){o+='<div class="msg ok">'+A.esc(m)+'</div>';txt.push('OK: '+m);});
 (r.warn||[]).forEach(function(m){o+='<div class="msg wa">'+A.esc(m)+'</div>';txt.push('Warning: '+m);});
 return {html:o+(h?'<table class="res"><tbody>'+h+'</tbody></table>':'')+(r.html||''),text:txt.join('\n')};}
A.calc=function(fn){var form=D.getElementById('calc-form'),out=D.getElementById('results');
 function run(){var errs=[];form.querySelectorAll('[aria-invalid]').forEach(function(e){e.removeAttribute('aria-invalid');});
  form.querySelectorAll('input[data-num]').forEach(function(el){if(hidden(el))return;try{A.v(el);}catch(e){errs.push(e);}});
  var res=null;if(!errs.length){try{res=render(fn(A.v)||{});}catch(e){errs.push(e instanceof CalcError?e:new CalcError('Unexpected error: '+e.message));}}
  if(errs.length){errs.forEach(function(e){var el=e.id&&D.getElementById(e.id);if(el)el.setAttribute('aria-invalid','true');});
   out.innerHTML=errs.map(function(e){return '<div class="msg er" role="alert">'+A.esc(e.message)+'</div>';}).join('');last='Errors:\n'+errs.map(function(e){return e.message;}).join('\n');return;}
  out.innerHTML=res.html;last=res.text;}
 form.addEventListener('input',run);form.addEventListener('change',run);form.addEventListener('submit',function(e){e.preventDefault();});A.run=run;run();};
function inputsText(){var a=[];D.querySelectorAll('#calc-form input[data-num],#calc-form select').forEach(function(el){if(hidden(el)||!el.id)return;var u=el.closest('.f');u=u&&u.querySelector('.u');
 var v=el.tagName==='SELECT'?el.options[el.selectedIndex].text:el.value;a.push(lab(el)+' = '+v+(u?' '+u.textContent:''));});return a.join('\n');}
A.copy=function(text,btn){function done(ok){if(btn){var o=btn.textContent;btn.textContent=ok?'Copied':'Copy failed';setTimeout(function(){btn.textContent=o;},1500);}}
 function fb(){var t=D.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';D.body.appendChild(t);t.select();var ok=false;try{ok=D.execCommand('copy');}catch(e){}D.body.removeChild(t);done(ok);}
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(function(){done(true);},fb);}else fb();};
A.download=function(name,text,type){var b=new Blob([text],{type:type||'text/csv'}),a=D.createElement('a');a.href=URL.createObjectURL(b);a.download=name;D.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);};
A.store={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}};
D.addEventListener('DOMContentLoaded',function(){
 var tb=D.getElementById('theme');function lbl(){if(tb){tb.textContent=isDark()?'Light':'Dark';tb.setAttribute('aria-label','Switch to '+(isDark()?'light':'dark')+' theme');}}
 if(tb){lbl();tb.addEventListener('click',function(){var n=isDark()?'light':'dark';R.setAttribute('data-theme',n);try{localStorage.setItem('theme',n);}catch(e){}lbl();});}
 var cb=D.getElementById('copy');if(cb)cb.addEventListener('click',function(){A.copy(D.title.split(' | ')[0]+'\n\nInputs\n'+inputsText()+'\n\nResults'+(last.charAt(0)==='\n'?'':'\n')+last+'\n\n'+(D.getElementById('disc')||{}).textContent,cb);});
 D.querySelectorAll('.tabs').forEach(function(g){var bs=g.querySelectorAll('button[data-tab]');bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){var on=x===b;x.setAttribute('aria-selected',on);var p=D.getElementById(x.getAttribute('data-tab'));if(p)p.hidden=!on;});if(A.run)A.run();});});});
 var q=D.getElementById('q');if(q){var cards=D.querySelectorAll('.card[data-k]'),em=D.getElementById('noresult');q.addEventListener('input',function(){var w=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean),n=0;
  cards.forEach(function(c){var k=c.getAttribute('data-k'),hit=w.every(function(x){return k.indexOf(x)>=0;});c.hidden=!hit;if(hit)n++;});em.hidden=n>0;});}
});
})();
