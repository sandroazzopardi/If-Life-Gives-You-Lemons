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
// Display a real image so mobile visitors can press and hold to save it.
let previewDialog;
let previewImage;
let previewDownload;
let previousFocus;
function makePreview() {
  if (previewDialog) return;
  const style = document.createElement('style');
  style.textContent = `
    .lemon-preview { width: min(94vw, 650px); max-height: 92dvh;
      padding: 22px; border: 1px solid #cbd2be; border-radius: 14px;
      background: #faf8ef; color: #303526; overflow-y: auto; }
    .lemon-preview::backdrop { background: #152012aa; }
    .lemon-preview header { padding: 0; display: flex; gap: 15px;
      justify-content: space-between; align-items: center; }
    .lemon-preview h2 { margin: 0; font: 25px Georgia, serif; }
    .lemon-preview p { font: 14px/1.6 Arial, sans-serif; }
    .lemon-preview img { display: block; width: auto; height: auto;
      max-width: 100%; max-height: 52dvh; margin: 18px auto;
      border-radius: 8px; -webkit-touch-callout: default; user-select: auto; }
    .lemon-preview button, .lemon-preview a { font: 14px Arial, sans-serif;
      padding: 11px 15px; border-radius: 6px; }
    .lemon-preview button { background: transparent; border: 1px solid #cbd2be; }
    .lemon-preview a { display: inline-block; background: #3f593d;
      color: white; text-decoration: none; }
  `;
  document.head.appendChild(style);
  previewDialog = document.createElement('dialog');
  previewDialog.className = 'lemon-preview';
  previewDialog.setAttribute('aria-labelledby', 'lemon-preview-title');
  previewDialog.innerHTML = `
    <header>
      <h2 id="lemon-preview-title">Save your lemon</h2>
      <button type="button" aria-label="Close image preview" autofocus>Close ×</button>
    </header>
    <p>On your phone, <strong>press and hold the image</strong> and choose
      “Save image”, “Add to Photos” or a similar option. You can also try the download button.</p>
    <img alt="Your generated lemon image">
    <a download>Download image ↓</a>
    <p><strong>Opened in Messenger?</strong> If saving does not work, use its
      menu (often ⋯) and choose “Open in browser”, or copy the page link and
      paste it into Safari or Chrome. Then save the image there.</p>
    <p class="wallpaper-help" hidden>After saving, open the image in your Photos or Gallery
      app and set it as your wallpaper. Your phone may crop the edges.</p>
  `;
  document.body.appendChild(previewDialog);
  previewImage = previewDialog.querySelector('img');
  previewDownload = previewDialog.querySelector('a');
  previewDialog.querySelector('button').onclick = () => previewDialog.close();
  previewDialog.addEventListener('close', () => {
    previewImage.removeAttribute('src');
    previewDownload.removeAttribute('href');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  });
}
function previewBlob(blob, filename, wallpaper = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Preview unavailable'));
    reader.onload = () => {
      try {
        makePreview();
        previousFocus = document.activeElement;
        previewImage.src = reader.result;
        previewImage.alt = wallpaper ? 'Your lemon phone wallpaper' : 'Your lemon message card';
        previewDownload.href = reader.result;
        previewDownload.download = filename;
        previewDialog.querySelector('h2').textContent = wallpaper ? 'Save your phone wallpaper' : 'Save your lemon card';
        previewDialog.querySelector('.wallpaper-help').hidden = !wallpaper;
        if (!previewDialog.open) previewDialog.showModal();
        resolve();
      } catch (error) { reject(error); }
    };
    reader.readAsDataURL(blob);
  });
}
$('download').onclick = async () => {
  const button = $('download');
  const selected = current;
  button.disabled = true;
  try {
    const blob = await imageBlob();
    await previewBlob(blob, 'a-little-lemon-' + selected.id + '.png');
    track('image_preview');
    $('status').textContent = 'Image preview ready. Press and hold the image or use Download image.';
  } catch {
    $('status').textContent = 'Image preview could not be opened. Please try your phone’s browser.';
  } finally {
    button.disabled = false;
  }
};

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
    await previewBlob(blob, 'lemon-wallpaper-' + selected.id + '.png', true);
    track('wallpaper_preview', { category: selected.category });
    $('status').textContent = 'Wallpaper preview ready. Press and hold the image or use Download image.';
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
