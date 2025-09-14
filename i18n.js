
(function(){
  const sel = document.getElementById('langSel');
  const city = document.getElementById('city');
  const host = document.getElementById('messageHost');
  const linkOut = document.getElementById('linkOut');
  const copyBtn = document.getElementById('copyBtn');
  const shareBtn = document.getElementById('shareBtn');

  let TRANSLATIONS = {};
  async function loadTranslations(){
    try{
      const res = await fetch('/content/translations.json', {cache:'no-cache'});
      TRANSLATIONS = await res.json();
    }catch(e){
      host.innerHTML = '<p class="muted">Could not load translations.json</p>';
    }
  }
  function renderLang(code){
    const t = TRANSLATIONS[code];
    host.innerHTML = '';
    if(!t){ host.innerHTML = `<p class="muted">Missing translation for ${code}</p>`; return; }
    const wrap = document.createElement('div');
    const h2=document.createElement('h2'); h2.textContent=t.title||'The Last War'; wrap.appendChild(h2);
    (t.sections||[]).forEach(sec=>{
      if(sec.heading){ const h=document.createElement('h3'); h.textContent=sec.heading; wrap.appendChild(h); }
      (sec.paragraphs||[]).forEach(p=>{ const el=document.createElement('p'); el.textContent=p; wrap.appendChild(el); });
    });
    if(t.cta){ const c=document.createElement('div'); c.className='card'; c.innerHTML=`<p>${t.cta}</p>`; wrap.appendChild(c); }
    host.appendChild(wrap);
  }
  function buildURL(){
    const u=new URL(location.origin + '/last-war/');
    u.searchParams.set('utm_source','site');
    u.searchParams.set('utm_medium','read');
    u.searchParams.set('utm_campaign','the_last_war');
    u.searchParams.set('utm_content', sel.value);
    if(city.value.trim()) u.searchParams.set('utm_term', city.value.trim());
    return u.toString();
  }
  function showLang(code){
    renderLang(code);
    linkOut.textContent = buildURL();
    history.replaceState({},'', '#'+code);
  }
  function initUI(){
    sel.addEventListener('change', ()=>showLang(sel.value));
    city.addEventListener('input', ()=>linkOut.textContent=buildURL());
    copyBtn.addEventListener('click', ()=>navigator.clipboard.writeText(linkOut.textContent));
    shareBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const url = buildURL();
      if(navigator.share){ navigator.share({title:'The Last War', text:'Read, verify, share.', url}); }
      else { navigator.clipboard.writeText(url); shareBtn.textContent='Link Copied'; setTimeout(()=>shareBtn.textContent='Share',1200); }
    });
  }
  (async function(){
    await loadTranslations();
    initUI();
    const hash=location.hash.replace('#','').trim();
    const guess=(navigator.language||'en').slice(0,2);
    const langs=['en','ar','ru','zh','he','es','de','fa','hi','ko','ja','sw','am','ha','zu'];
    const initial = hash || (langs.includes(guess)? guess:'en');
    sel.value = initial;
    showLang(initial);
  })();
})();
