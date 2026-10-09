(()=>{'use strict';
const messages=window.LEMON_MESSAGES,config=window.LEMON_CONFIG||{},$=id=>document.getElementById(id);let mood='all',current=messages.find(m=>m.id==='sarcastic-7');
const labels={funny:'A LITTLE LAUGH',sarcastic:'EXTRA SHARP',kind:'A LITTLE KINDNESS',useful:'ONE USEFUL NUDGE'};
function track(name,data={}){window.dispatchEvent(new CustomEvent('lemon:event',{detail:{name,...data}}));if(typeof window.plausible==='function')window.plausible(name,{props:data});}
function show(item,daily=false){current=item;$('message').textContent=item.text;$('label').textContent=daily?'TODAY’S LEMON':labels[item.category];const u=new URL(location.href);u.searchParams.set('lemon',item.id);try{history.replaceState(null,'',u)}catch{}$('status').textContent='';}
function squeeze(){const pool=messages.filter(m=>(mood==='all'||m.category===mood)&&m.id!==current.id);show(pool[Math.floor(Math.random()*pool.length)]);const el=$('squeeze');el.classList.remove('squeezed');void el.offsetWidth;el.classList.add('squeezed');track('squeeze',{category:current.category});}
$('squeeze').onclick=squeeze;$('another').onclick=squeeze;
document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{mood=b.dataset.mood;document.querySelectorAll('[data-mood]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));squeeze();});
$('daily').onclick=()=>{const date=new Date().toISOString().slice(0,10);let hash=0;for(const c of date)hash=(hash*31+c.charCodeAt(0))>>>0;show(messages[hash%messages.length],true);track('daily');};
const requested=new URLSearchParams(location.search).get('lemon');if(requested){const found=messages.find(m=>m.id===requested);if(found)show(found);}
function url(){return 'https://iflifegivesyoulemons.com/?lemon='+encodeURIComponent(current.id);}
$('share').onclick=async()=>{const data={title:'A little lemon for you',text:current.text,url:url()};try{if(navigator.share){await navigator.share(data);track('share',{method:'native'});$('status').textContent='A little zest passed on.';}else{await navigator.clipboard.writeText(data.text+'\n'+data.url);track('share',{method:'copy'});$('status').textContent='Message and link copied. Paste them into your favourite app.';}}catch(e){if(e.name!=='AbortError'){$('status').textContent='Copy this link to share: '+url();}}};
function imageBlob(){return new Promise((resolve,reject)=>{const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const ctx=canvas.getContext('2d');ctx.fillStyle='#faf8ef';ctx.fillRect(0,0,1080,1080);ctx.fillStyle='#f8d848';ctx.beginPath();ctx.ellipse(900,120,150,115,-.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3f593d';ctx.font='bold 24px Arial';ctx.fillText('IF LIFE GIVES YOU LEMONS',85,130);ctx.font='20px Arial';ctx.fillText(labels[current.category],85,240);ctx.fillStyle='#303526';ctx.font='52px Georgia';let lines=[],line='';for(const word of current.text.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>900&&line){lines.push(line);line=word;}else line=next;}lines.push(line);lines.forEach((l,i)=>ctx.fillText(l,85,440+i*70));ctx.strokeStyle='#cbd2be';ctx.beginPath();ctx.moveTo(85,870);ctx.lineTo(995,870);ctx.stroke();ctx.fillStyle='#3f593d';ctx.font='25px Arial';ctx.fillText('Squeeze your own little pick-me-up.',85,925);ctx.font='22px Arial';ctx.fillText('iflifegivesyoulemons.com',85,980);canvas.toBlob(b=>b?resolve(b):reject(new Error('Image unavailable')),'image/png');});}
$('download').onclick=async()=>{try{const blob=await imageBlob();const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='a-little-lemon-'+current.id+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(href),30000);track('save_image');$('status').textContent='Your lemon card is ready to save.';}catch{$('status').textContent='Image could not be saved. Try sharing the link instead.';}};

// Phone wallpaper: 1440 × 3200, with clear space for clocks and controls.
function wallpaperBlob(text) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 3200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quiet background accents; keep the top clear for the clock.
    ctx.fillStyle = '#edf0e4';
    ctx.beginPath();
    ctx.ellipse(1450, 2020, 370, 570, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff0b7';
    ctx.beginPath();
    ctx.ellipse(-80, 2580, 400, 520, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const maxWidth = 1060;
    function wrap(fontSize) {
      ctx.font = `${fontSize}px Georgia`;
      const lines = [];
      let line = '';
      for (const word of text.split(/\s+/)) {
        const next = line ? line + ' ' + word : word;
        if (line && ctx.measureText(next).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);
      return lines;
    }
    let size = 88;
    let lines = wrap(size);
    while (size > 42 && (lines.length * size * 1.35 > 740 ||
      lines.some(line => ctx.measureText(line).width > maxWidth))) {
      size -= 2;
      lines = wrap(size);
    }
    ctx.fillStyle = '#303526';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size}px Georgia`;
    const lineHeight = size * 1.35;
    const firstY = 1530 - (lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => ctx.fillText(line, 720, firstY + i * lineHeight));

    // Draw a small lemon directly, so no image fetch is needed.
    ctx.save();
    ctx.translate(720, 1010);
    ctx.rotate(-0.25);
    ctx.fillStyle = '#f8d848';
    ctx.beginPath();
    ctx.ellipse(0, 0, 100, 72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f593d';
    ctx.beginPath();
    ctx.ellipse(55, -70, 46, 20, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#69705e';
    ctx.font = '28px Arial';
    ctx.fillText('iflifegivesyoulemons.com', 720, 2240);
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image unavailable')), 'image/png');
  });
}
const wallpaperButton = $('wallpaper');
if (wallpaperButton) wallpaperButton.onclick = async () => {
  const selected = current;
  wallpaperButton.disabled = true;
  try {
    const blob = await wallpaperBlob(selected.text);
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'lemon-wallpaper-' + selected.id + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 30000);
    track('save_wallpaper', { category: selected.category });
    $('status').textContent = 'Wallpaper ready. Open the downloaded image and set it as your wallpaper. Your phone may crop the edges.';
  } catch {
    $('status').textContent = 'Wallpaper could not be saved. Please try again.';
  } finally {
    wallpaperButton.disabled = false;
  }
};

if(/^https:\/\//.test(config.checkoutUrl||'')){const a=document.createElement('a');a.className='buy';a.href=config.checkoutUrl;a.textContent='Get the Little Zest Pack · €4.99';a.rel='noopener';a.onclick=()=>track('product_click');$('buywrap').replaceChildren(a);}
if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.enquiryEmail||'')){$('enquiry').hidden=false;$('enquiry').href='mailto:'+config.enquiryEmail+'?subject=Domain%20acquisition%20enquiry';}
$('year').textContent=new Date().getFullYear();
if(/^https:\/\//.test(config.analyticsScriptUrl||'')&&config.analyticsDomain){const script=document.createElement('script');script.defer=true;script.src=config.analyticsScriptUrl;script.dataset.domain=config.analyticsDomain;document.head.appendChild(script);}
})();
