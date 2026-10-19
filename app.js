'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const photos = window.MEDIA.filter(item => item.type === 'photo');
const videos = window.MEDIA.filter(item => item.type === 'video');
const byId = id => window.MEDIA.find(item => item.id === id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const groupNames = { iskcon: 'ISKCON Temple, Pune', amanora: 'Amanora Mall, Pune', seasons: 'Seasons Mall, Pune', together: 'Our little world' };
const photoCaptions = {
  'iskcon-01':'Where our story began', 'iskcon-02':'That first little feeling', 'iskcon-03':'A beautiful beginning', 'iskcon-04':'Already my favourite company',
  'amanora-01':'An ordinary day, made special', 'amanora-02':'My favourite person', 'amanora-03':'Just look at that smile', 'amanora-04':'Happiness looks like this', 'amanora-05':'Your hand in mine',
  'seasons-01':'A little closer, every day', 'seasons-02':'Flowers for my favourite girl', 'seasons-03':'That smile is everything', 'seasons-04':'Beside you is where I belong', 'seasons-05':'Us, always',
  'together-01':'A little closer, every day', 'together-02':'A smile worth every rose', 'together-03':'A little kiss, a lot of love', 'together-04':'My favourite smile', 'together-05':'Happiest beside you',
  'together-06':'Little moments, big feelings', 'together-07':'A world of our own', 'together-08':'Your hand, my favourite place', 'together-09':'Time well spent', 'together-10':'The joy of being us',
  'together-11':'That smile. My whole world.', 'together-12':'A little promise of forever', 'together-13':'The beginning of forever', 'together-14':'Just you and me', 'together-15':'One beautiful yes', 'together-16':'My favourite place is beside you', 'together-17':'All the joy in one moment', 'together-18':'Celebrating us', 'together-19':'A day made better by you', 'together-20':'Only eyes for you', 'together-21':'The view is better with you', 'together-22':'A lifetime of views together'
};
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 4500); }
function celebrate() {
  if (reducedMotion) return;
  const target = $('#confetti'); target.replaceChildren();
  const colors = ['#b18abf','#cba19e','#e2c997','#9875a6','#f6e2df'];
  for (let i=0; i<65; i++) { const piece = document.createElement('i'); piece.style.cssText = `--left:${Math.random()*100}%;--color:${colors[i%colors.length]};--duration:${3+Math.random()*2}s;--delay:${Math.random()*.8}s;--drift:${Math.random()*180-90}px`; target.append(piece); }
  clearTimeout(celebrate.timer); celebrate.timer = setTimeout(() => target.replaceChildren(), 6000);
}

// A small original instrumental, synthesized locally. No third-party recording.
const music = {
  context:null, master:null, timer:null, wanted:false, ducked:false, busy:false, next:0, bar:0,
  async toggle() { if (this.busy) return; this.busy=true; try { await this.set(!this.wanted); } finally { this.busy=false; } },
  async set(enabled) {
    if (!enabled) { this.wanted=false; clearInterval(this.timer); if (this.context) { const old=this.context; this.context=null; this.master=null; await old.close(); } this.update(); return; }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Audio unsupported');
      if (!this.context) { this.context=new AudioContext(); this.master=this.context.createGain(); this.master.gain.value=this.ducked?0:.16; this.master.connect(this.context.destination); this.next=this.context.currentTime+.1; this.bar=0; }
      await this.context.resume(); this.wanted=true; this.schedule(); clearInterval(this.timer); this.timer=setInterval(()=>this.schedule(),1000); this.update();
    } catch { this.wanted=false; this.update(); toast('Music could not start. Tap the music button to try again.'); }
  },
  note(midi,start,duration,volume) {
    const ctx=this.context, envelope=ctx.createGain(); envelope.gain.setValueAtTime(0,start); envelope.gain.linearRampToValueAtTime(volume,start+.035); envelope.gain.exponentialRampToValueAtTime(.001,start+duration); envelope.connect(this.master);
    [1,2,3].forEach((multiple,i)=>{ const osc=ctx.createOscillator(); const level=ctx.createGain(); osc.type='sine'; osc.frequency.value=440*Math.pow(2,(midi-69)/12)*multiple; level.gain.value=[1,.22,.06][i]; osc.connect(level); level.connect(envelope); osc.start(start); osc.stop(start+duration+.05); osc.onended=()=>{osc.disconnect();level.disconnect();}; });
    setTimeout(()=>envelope.disconnect(),Math.max(0,(start+duration-this.context.currentTime+1)*1000));
  },
  schedule() {
    if (!this.context || !this.wanted) return;
    const chords=[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]];
    const tune=[[76,74,72,67],[72,69,67,64],[69,72,74,72],[71,67,69,74],[76,79,76,72],[72,76,74,69],[69,72,77,76],[74,71,67,72]];
    const beat=60/72;
    while(this.next<this.context.currentTime+5) {
      const chord=chords[this.bar%4];
      [0,2,1,3,2,1,3,2].forEach((position,i)=>this.note(chord[position],this.next+i*beat/2,2.8,.22));
      tune[this.bar%8].forEach((note,i)=>this.note(note,this.next+i*beat,2.6,.14));
      this.note(chord[0]-12,this.next,3.6,.18);
      this.next+=beat*4; this.bar++;
    }
  },
  duck(value) { this.ducked=value; if(this.context && this.master) this.master.gain.setTargetAtTime(value?0:.16,this.context.currentTime,.18); this.update(); },
  update() { $('#sound-toggle').setAttribute('aria-pressed',String(this.wanted)); $('#sound-toggle').setAttribute('aria-label',this.wanted?'Turn background music off':'Play gentle background music'); $('#sound-label').textContent=this.wanted?(this.ducked?'Music paused':'Music on'):'Music off'; }
};
$('#sound-toggle').addEventListener('click',()=>music.toggle());
$('#begin').addEventListener('click',()=>{ if(!music.wanted) music.set(true); celebrate(); $('#story').scrollIntoView({behavior:reducedMotion?'instant':'smooth'}); });

function countdown() {
  const birthday = Date.parse('2026-12-10T00:00:00+05:30'), now=Date.now(), remaining=birthday-now;
  if(remaining<=0) { $('.countdown-label').textContent=now<birthday+86400000?'Today is your day':'A birthday to remember'; $('#countdown-numbers').innerHTML='<span class="handwritten">Happy birthday, my love ♡</span>'; return; }
  const data = [Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60];
  $('#countdown-numbers').innerHTML=data.map((n,i)=>`<span><b>${String(n).padStart(2,'0')}</b><small>${['days','hours','mins'][i]}</small></span>`).join('');
}
countdown(); setInterval(countdown,30000);

const stories = {
  iskcon:{num:'01',title:'The moment<br>my heart just knew.',text:'पुण्यातल्या इस्कॉन मंदिरात तुला पहिल्यांदा पाहिलं. त्या क्षणी मनात एकच विचार आला — हिच्यासोबत मला आयुष्यभर राहायचं आहे. आपल्या गोष्टीची सुरुवात याहून सुंदर असूच शकली नसती.',english:'The first time I saw you, I knew I wanted a lifetime with you.',hero:'iskcon-02'},
  amanora:{num:'02',title:'A day out.<br>A memory for life.',text:'अमनोरा मॉलमधली आपली भेट. तुझ्यासोबत वेळ घालवणं, गप्पा मारणं, एकत्र हसणं… साधेसे क्षणही तुझ्यामुळे इतके खास झाले. जागेपेक्षा तुझी सोबत जास्त लक्षात राहिली.',english:'The best part of going anywhere? Going there with you.',hero:'amanora-04'},
  seasons:{num:'03',title:'More little moments.<br>More reasons to smile.',text:'सीझन्स मॉलमधल्या आपल्या आठवणी — फुलं, फोटो आणि तुझं ते सुंदर हसू. प्रत्येक भेटीत तू मला अजून जवळची वाटू लागलीस. तुझ्यासोबतचे हे छोटे क्षण माझ्यासाठी खूप मोठे आहेत.',english:'A few flowers, a few photographs, and my favourite smile.',hero:'seasons-02'}
};
function renderStory(group) {
  const data=stories[group], items=photos.filter(p=>p.group===group), panel=$('#story-panel');
  $$('[data-story]').forEach(b=>{const active=b.dataset.story===group;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  panel.setAttribute('aria-labelledby',`tab-${group}`);
  panel.innerHTML=`<div class="story-photo-wrap"><img class="story-main-photo" src="${byId(data.hero).src}" alt="${photoCaptions[data.hero]} — ${groupNames[group]}" tabindex="0" role="button" aria-label="Open this ${groupNames[group]} photo"><span class="story-number" aria-hidden="true">${data.num}</span></div><div class="story-text"><p class="story-location">${groupNames[group].toUpperCase()}</p><h3 lang="en">${data.title}</h3><p>${data.text}</p><p class="story-english" lang="en">“${data.english}”</p><div class="story-thumbs" role="group" aria-label="Photos from this date">${items.map(p=>`<button data-photo="${p.id}" class="${p.id===data.hero?'active':''}" aria-label="Show ${photoCaptions[p.id]}" aria-pressed="${p.id===data.hero}"><img src="${p.src}" alt="" loading="lazy"></button>`).join('')}</div></div>`;
  let current=items.findIndex(p=>p.id===data.hero);
  const main=$('.story-main-photo',panel);
  $('.story-thumbs',panel).addEventListener('click',e=>{const btn=e.target.closest('[data-photo]');if(!btn)return;const p=byId(btn.dataset.photo);current=items.indexOf(p);main.src=p.src;main.alt=`${photoCaptions[p.id]} — ${groupNames[group]}`;$$('[data-photo]',panel).forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});});
  const show=()=>openLightbox(items,current);main.addEventListener('click',show);main.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});
}
$$('[data-story]').forEach(b=>b.addEventListener('click',()=>renderStory(b.dataset.story)));
renderStory('iskcon');
function keyboardTabs(container) { container.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=$$('[role=tab]',container);let index=tabs.indexOf(document.activeElement);if(index<0)return;e.preventDefault();index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[index].focus();tabs[index].click();}); }
$$('[role=tablist]').forEach(keyboardTabs);

const reasons = [
  ['Your kindness','तुझा प्रेमळ स्वभाव माझा प्रत्येक दिवस सुंदर करतो. तू ज्या मायेने माझ्याशी वागतेस, ती माझ्यासाठी खूप मौल्यवान आहे.'],
  ['Your calm','माझा दिवस कठीण असला, तरी तुझा शांतपणा मला पुन्हा सावरायला मदत करतो. तुझं प्रेम मला अधिक समजूतदार व्हायला शिकवतं.'],
  ['You understand me','मला काय वाटतं हे तू मनापासून समजून घेतेस. तुझ्यासोबत मी जसा आहे तसाच राहू शकतो. हीच तर प्रेमाची सुंदर बाजू आहे.'],
  ['That beautiful smile','तुझं हसू पाहिलं की माझा संपूर्ण दिवस उजळतो. माझ्यासाठी जगातलं सगळ्यात सुंदर हसू म्हणजे तुझं हसू.'],
  ['Simply being you','तुझं मन इतकं सुंदर आहे की तुझ्या सोबतीत साधे क्षणही खास होतात. तू जशी आहेस, तशीच मला खूप आवडतेस.'],
  ['Our tomorrow','मला तुझ्यासोबत फक्त सुंदर दिवसच नाही, तर रोजचं साधंसं आयुष्यही जगायचं आहे. तुझ्या स्वप्नांत आणि आनंदात तुझी साथ द्यायची आहे.']
];
const openedReasons=new Set();
$('#reasons-grid').innerHTML=reasons.map((r,i)=>`<button class="reason-card" data-reason="${i}" aria-expanded="false"><span class="reason-no">0${i+1}</span><img src="assets/rose.svg" alt=""><h3>${r[0]}</h3><small>TAP TO UNFOLD</small><span class="reason-message">${r[1]}</span></button>`).join('');
$('#reasons-grid').addEventListener('click',e=>{const button=e.target.closest('[data-reason]');if(!button)return;const open=button.classList.toggle('revealed');button.setAttribute('aria-expanded',String(open));if(open)openedReasons.add(button.dataset.reason);$('#reasons-progress').textContent=openedReasons.size===6?'Six little notes. A lifetime of reasons to love you. ♡':`${openedReasons.size} of 6 love notes discovered ♡`;if(openedReasons.size===6&&!openedReasons.celebrated){openedReasons.celebrated=true;celebrate();}});

const favourites=['together-16','amanora-04','iskcon-02','seasons-02','together-11','together-22','together-13','together-20','amanora-05','together-09','iskcon-04','together-18'].map(byId);
let galleryFilter='favourites',galleryLimit=8,galleryItems=favourites;
function renderGallery(){
  galleryItems=galleryFilter==='favourites'?favourites:galleryFilter==='all'?photos:photos.filter(p=>p.group===galleryFilter);
  const visible=galleryItems.slice(0,galleryLimit);
  $('#photo-grid').innerHTML=visible.map((p,i)=>`<button class="photo-card" data-gallery-index="${i}" aria-label="Open ${photoCaptions[p.id]}"><img src="${p.src}" alt="${photoCaptions[p.id]} — ${groupNames[p.group]}" loading="lazy" width="300" height="360"><span>${photoCaptions[p.id]}</span></button>`).join('');
  $('#album-count').textContent=`${visible.length} of ${galleryItems.length} memories`;
  $('#more-photos').hidden=visible.length>=galleryItems.length;
}
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{galleryFilter=button.dataset.filter;galleryLimit=8;$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderGallery();}));
$('#more-photos').addEventListener('click',()=>{const previous=galleryLimit;galleryLimit+=8;renderGallery();const next=$(`[data-gallery-index="${previous}"]`);if(next)next.focus({preventScroll:true});});
$('#photo-grid').addEventListener('click',e=>{const button=e.target.closest('[data-gallery-index]');if(button)openLightbox(galleryItems,Number(button.dataset.galleryIndex));});
renderGallery();
let lightboxItems=[],lightboxIndex=0,lightboxOpener=null;
function openLightbox(items,index){lightboxOpener=document.activeElement;lightboxItems=items;lightboxIndex=index;showLightboxPhoto();$('#lightbox').showModal();document.body.classList.add('no-scroll');}
function showLightboxPhoto(){const p=lightboxItems[lightboxIndex];$('#lightbox-image').src=p.src;$('#lightbox-image').alt=`${photoCaptions[p.id]} — ${groupNames[p.group]}`;$('#lightbox-caption').textContent=`${photoCaptions[p.id]} · ${lightboxIndex+1} / ${lightboxItems.length}`;}
function stepLightbox(step){lightboxIndex=(lightboxIndex+step+lightboxItems.length)%lightboxItems.length;showLightboxPhoto();}
$('.lightbox-close').addEventListener('click',()=>$('#lightbox').close());$('.lightbox-prev').addEventListener('click',()=>stepLightbox(-1));$('.lightbox-next').addEventListener('click',()=>stepLightbox(1));
$('#lightbox').addEventListener('close',()=>{document.body.classList.remove('no-scroll');if(lightboxOpener?.isConnected)lightboxOpener.focus({preventScroll:true});});
$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))$('#lightbox').close();});
$('#lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowLeft')stepLightbox(-1);if(e.key==='ArrowRight')stepLightbox(1);});
let touchStart=0;$('#lightbox').addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX;},{passive:true});$('#lightbox').addEventListener('touchend',e=>{const distance=e.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>60)stepLightbox(distance>0?-1:1);},{passive:true});

const filmPlayer=$('#film-player');
const filmCounts={};
const filmData=videos.map(v=>{filmCounts[v.group]=(filmCounts[v.group]||0)+1;return {...v,title:`${v.group==='together'?'A moment of us':v.group==='amanora'?'Amanora memories':'Seasons memories'} · ${String(filmCounts[v.group]).padStart(2,'0')}`,poster:`assets/${v.group==='amanora'?'amanora-04':v.group==='seasons'?'seasons-02':'together-12'}.webp`};});
$('#film-list').innerHTML=filmData.map((v,i)=>`<button class="film-item" data-film="${i}" aria-pressed="false"><img src="${v.poster}" alt="" loading="lazy"><span><strong>${v.title}</strong><small>${groupNames[v.group]}</small></span><span class="film-play" aria-hidden="true">▷</span></button>`).join('');
function selectFilm(index,play=false){const v=filmData[index];filmPlayer.pause();filmPlayer.src=v.src;filmPlayer.poster=v.poster;filmPlayer.setAttribute('aria-label',v.title);$('#film-caption').textContent=v.title;$$('[data-film]').forEach(b=>{const active=Number(b.dataset.film)===index;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});if(play)filmPlayer.play().catch(()=>toast('Your memory is ready. Tap play on the video.'));}
$('#film-list').addEventListener('click',e=>{const b=e.target.closest('[data-film]');if(b)selectFilm(Number(b.dataset.film),true);});
filmPlayer.addEventListener('play',()=>music.duck(true));filmPlayer.addEventListener('pause',()=>music.duck(false));filmPlayer.addEventListener('ended',()=>music.duck(false));filmPlayer.addEventListener('error',()=>toast('This video could not load. Please choose another memory or try again.'));
selectFilm(0);

const quiz=[
  {mr:'आपली पहिली भेट कुठे झाली होती?',en:'Where did our story begin?',options:['ISKCON Temple, Pune','Amanora Mall','Seasons Mall'],answer:0,yes:'हो! इस्कॉन मंदिरात तुला पहिल्यांदा पाहिलं… आणि मनाने तुला निवडलं. ♡',no:'एक छोटीशी आठवण — आपली सुरुवात इस्कॉन मंदिरात झाली होती. ♡'},
  {mr:'आपल्या साखरपुड्याची खास तारीख कोणती?',en:'The date that became a little piece of forever.',options:['10 December 2026','28 May 2026','28 June 2026'],answer:1,yes:'२८ मे २०२६. माझ्या आयुष्यातला एक अविस्मरणीय दिवस. ♡',no:'२८ मे २०२६ — आपल्या एकत्र प्रवासाचा तो खास दिवस. ♡'},
  {mr:'माझा दिवस सुंदर करण्यासाठी तुला काय करावं लागतं?',en:'A very serious question. With a very obvious answer.',options:['Just smile at me ♡','Send a 40-page presentation','Solve a difficult equation'],answer:0,yes:'फक्त हस! बाकी सगळं माझं हृदय सांभाळून घेईल. 😊',no:'उत्तर अगदी सोपं आहे — तुझं एक हसू पुरेसं आहे! 😊'},
  {mr:'तुझ्यासोबतच्या पुढच्या भेटीसाठी मी काय निवडेन?',en:'Pick our next little adventure. Every answer is lovely.',options:['A peaceful temple visit','A movie and something tasty','A walk, roses and long conversations'],answer:null,yes:'ठरलं तर! तुझी सोबत असेल, तर प्रत्येक भेट खासच असेल. ♡'},
  {mr:'आपल्या गोष्टीचा माझा आवडता भाग कोणता?',en:'My favourite part of our story is…',options:['The photos','The places','You. Always you.'],answer:2,yes:'तू. नेहमी तूच. बाकी सगळं तुझ्यामुळेच सुंदर आहे. ♡',no:'फोटो आणि जागा सुंदर आहेत… पण माझं खरं उत्तर आहे: तू. नेहमी तूच. ♡'}
];
let quizIndex=0,quizScore=0,quizAnswered=false;
function renderQuiz(){
  quizAnswered=false;
  if(quizIndex>=quiz.length){$('#quiz-content').innerHTML=`<div class="quiz-complete"><span aria-hidden="true">♡</span><h3>My favourite teammate.<br>For life.</h3><p>${quizScore} / 4 memory & love questions, and one lovely date idea.<br>गुण कितीही असोत, माझं प्रेम नेहमी पूर्णच आहे.</p><button class="button primary" id="quiz-letter">A little love letter is waiting ↗</button><br><button class="text-button" id="restart-quiz">Play again ↻</button></div>`;$('#restart-quiz').onclick=()=>{quizIndex=0;quizScore=0;renderQuiz();};$('#quiz-letter').onclick=()=>{$('#letter').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});};celebrate();return;}
  const q=quiz[quizIndex];
  $('#quiz-content').innerHTML=`<div class="quiz-top"><span>A LITTLE QUESTION · ${quizIndex+1} / ${quiz.length}</span><span class="quiz-progress" aria-hidden="true">${quiz.map((_,i)=>`<i class="${i<=quizIndex?'done':''}"></i>`).join('')}</span></div><h3 class="quiz-question">${q.mr}</h3><p class="quiz-english">${q.en}</p><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${o}</button>`).join('')}</div><p class="quiz-feedback" aria-live="polite"></p><button class="button primary quiz-next" id="quiz-next" hidden>${quizIndex===quiz.length-1?'A little finale':'Next little question'} →</button>`;
  $$('.quiz-option').forEach(b=>b.onclick=()=>{if(quizAnswered)return;quizAnswered=true;const correct=q.answer===null||Number(b.dataset.answer)===q.answer;if(correct&&q.answer!==null)quizScore++;$$('.quiz-option').forEach(option=>{option.disabled=true;if(Number(option.dataset.answer)===q.answer)option.classList.add('correct');});b.classList.add(correct?'correct':'incorrect');$('.quiz-feedback').textContent=correct?q.yes:q.no;$('#quiz-next').hidden=false;});
  $('#quiz-next').onclick=()=>{quizIndex++;renderQuiz();$('.quiz-question, .quiz-complete h3')?.setAttribute('tabindex','-1');$('.quiz-question, .quiz-complete h3')?.focus({preventScroll:true});};
}
renderQuiz();
$$('[data-game]').forEach(b=>b.addEventListener('click',()=>{$$('[data-game]').forEach(t=>{const active=t===b;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});$$('.game-panel').forEach(p=>p.hidden=p.id!==b.dataset.game);}));
let matchFirst=null,matchBusy=false,matchPairs=0,matchMoves=0,matchTimer=null;
function resetMatch(){
  clearTimeout(matchTimer);matchFirst=null;matchBusy=false;matchPairs=0;matchMoves=0;
  const ids=['iskcon-03','amanora-04','seasons-02','together-16','together-22','together-11'];
  const deck=[...ids,...ids];for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  $('#match-grid').innerHTML=deck.map((id,i)=>`<button class="match-card" data-match="${id}" aria-label="Reveal memory card ${i+1}" aria-pressed="false"><img src="${byId(id).src}" alt="" loading="lazy"><span class="match-back" aria-hidden="true">♡</span></button>`).join('');
  $('#match-status').textContent='Find all 6 pairs. Take your time, love.';
}
$('#match-grid').addEventListener('click',e=>{const card=e.target.closest('.match-card');if(!card||matchBusy||card===matchFirst||card.classList.contains('matched'))return;card.classList.add('flipped');card.setAttribute('aria-pressed','true');card.setAttribute('aria-label',photoCaptions[card.dataset.match]);if(!matchFirst){matchFirst=card;return;}matchMoves++;if(card.dataset.match===matchFirst.dataset.match){[card,matchFirst].forEach(c=>{c.classList.add('matched');c.disabled=true;});matchFirst=null;matchPairs++;$('#match-status').textContent=matchPairs===6?`All 6 pairs found in ${matchMoves} turns. Just like us — better together! ♡`:`${matchPairs} / 6 pairs found · ${matchMoves} turns`;if(matchPairs===6)celebrate();}else{matchBusy=true;const previous=matchFirst;matchTimer=setTimeout(()=>{[card,previous].forEach(c=>{c.classList.remove('flipped');c.setAttribute('aria-pressed','false');c.setAttribute('aria-label',`Reveal memory card ${$$('.match-card').indexOf(c)+1}`);});matchFirst=null;matchBusy=false;},1000);}});
$('#reset-match').addEventListener('click',resetMatch);resetMatch();

const letters={
  mr:{title:'माझ्या प्रिय अपेक्षाला,',paragraphs:[
    'वाढदिवसाच्या खूप खूप शुभेच्छा, माझ्या प्रिय अपेक्षा! आजचा दिवस तुझ्यासारखाच सुंदर, प्रेमाने भरलेला आणि हसरा जावो. तुझ्यासाठी माझ्या मनात किती प्रेम आहे, ते सांगण्यासाठी हा छोटासा प्रयत्न.',
    'पुण्यातल्या इस्कॉन मंदिरात तुला पहिल्यांदा पाहिलं, तो क्षण आजही माझ्या मनात तसाच जिवंत आहे. तुला पाहताच मनात आलं — हीच ती मुलगी, जिच्यासोबत मला आयुष्यभर राहायचं आहे. तेव्हा सुरू झालेली ही भावना प्रत्येक भेटीत अजून सुंदर होत गेली.',
    'अमनोरा मॉलमधल्या गप्पा, सीझन्स मॉलमधले आपले फोटो, गणपतीचं दर्शन आणि एकत्र घालवलेले छोटे छोटे क्षण… या सगळ्या आठवणी माझ्यासाठी खूप खास आहेत. कारण त्या प्रत्येक आठवणीत तू आहेस.',
    'तुझ्याबद्दल मला सगळ्यात जास्त आवडतं ते तुझं सुंदर मन. तुझी माया, तुझा शांत स्वभाव आणि मला समजून घेण्याची तुझी तयारी — या गोष्टी शब्दांत सांगणं कठीण आहे. मी कधी चिडलेलो किंवा अस्वस्थ असलो, तरी तू माझं म्हणणं शांतपणे ऐकून घेतेस. तुझ्या या प्रेमाची मला जाणीव आहे. तुझ्यासाठीही तितकाच समजूतदार, जपणारा आणि साथ देणारा जोडीदार व्हायचं आहे.',
    'आणि तुझं हसू! माझ्यासाठी जगातलं सगळ्यात सुंदर हसू म्हणजे तुझं हसू. तू हसलीस की माझ्या मनावरचा सगळा थकवा हलका होतो. तुझ्या चेहऱ्यावरचा तो आनंद असाच कायम राहावा, हीच माझी मनापासून इच्छा आहे.',
    '२८ मे २०२६ — आपल्या साखरपुड्याचा दिवस — माझ्या आयुष्यातला एक अतिशय खास दिवस. त्या दिवशी आपण एकत्र आयुष्य घडवण्याच्या प्रवासाला सुरुवात केली. तू माझी जीवनसाथी होणार आहेस, या विचाराने मला किती आनंद आणि अभिमान वाटतो, हे कदाचित मी नेहमी शब्दांत सांगू शकत नाही.',
    'या वाढदिवशी तुझ्यासाठी माझी इच्छा आहे — तुझी स्वप्नं पूर्ण होवोत, तुला मनःशांती लाभो, आणि तुझ्या आयुष्यात भरभरून आनंद येवो. तुझ्या प्रत्येक स्वप्नाला प्रोत्साहन द्यायला, तुझं मन ऐकायला आणि प्रत्येक वळणावर तुझ्या सोबत राहायला मला आवडेल.',
    'आपल्याला अजून खूप ठिकाणी जायचं आहे, खूप आठवणी बनवायच्या आहेत आणि आयुष्यभर एकत्र हसायचं आहे. पण पुढचं आयुष्य कुठेही घेऊन गेलं, तरी त्यात तुझी साथ असावी, एवढंच मला हवं आहे.',
    'वाढदिवसाच्या खूप खूप शुभेच्छा, अपेक्षा. तू आहेस म्हणून माझं जग अधिक सुंदर आहे. माझं तुझ्यावर खूप प्रेम आहे. ♡'
  ]},
  en:{title:'My dearest Apeksha,',paragraphs:[
    'Happy birthday, my love. I hope today feels as beautiful, warm and full of joy as you make my life feel. This little world is my way of putting some of the love I feel for you into words.',
    'I still remember seeing you for the first time at the ISKCON temple in Pune. Something in my heart knew: this is the girl I want to spend my life with. That feeling has only grown with every day and every memory we have shared.',
    'Our time at Amanora Mall, our photographs at Seasons Mall, going for Ganpati darshan, and all the little moments in between mean so much to me. What makes them special is that I got to share them with you.',
    'What I love most is your beautiful heart. Your kindness, your calm nature, and the way you try to understand me mean more than I can easily say. Even when I feel upset or impatient, you listen with care. I do not take that love for granted. I want to be just as patient, understanding and supportive with you.',
    'And your smile! To me, it is the most beautiful smile in the world. It has a way of making a difficult day feel lighter. More than anything, I hope you always have reasons to smile like that.',
    '28 May 2026, the day we got engaged, will always be one of the most special days of my life. It marked the beginning of our journey towards building a life together. The thought that you will be my life partner fills me with happiness and pride.',
    'On your birthday, I wish you peace, joy, and the courage and support to follow your dreams. I want to cheer you on, listen to you, and stand beside you through all the chapters ahead.',
    'We still have so many places to visit, memories to make, and ordinary days to turn into something lovely. Wherever life takes us, the part I look forward to most is sharing it with you.',
    'Happy birthday, Apeksha. My world is more beautiful because you are in it. I love you, with all my heart. ♡'
  ]}
};
let letterLanguage='mr';
function renderLetter(){const data=letters[letterLanguage];$('#letter-content').lang=letterLanguage;$('#letter-content').innerHTML=`<h3>${data.title}</h3>${data.paragraphs.map(p=>`<p>${p}</p>`).join('')}`;$$('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===letterLanguage)));$('.letter-signature').innerHTML=`${letterLanguage==='mr'?'कायम तुझाच,':'Always yours,'}<br><span class="handwritten">Dhanraj ♡</span>`;}
$('#open-letter').addEventListener('click',()=>{$('#open-letter').setAttribute('aria-expanded','true');$('#open-letter').hidden=true;$('#birthday-letter').hidden=false;renderLetter();$('#birthday-letter').classList.add('reveal-in');$('#letter-content h3').tabIndex=-1;$('#letter-content h3').focus({preventScroll:true});});
$$('[data-language]').forEach(b=>b.addEventListener('click',()=>{letterLanguage=b.dataset.language;renderLetter();}));
$('#save-letter').addEventListener('click',()=>{const data=letters[letterLanguage];const text=`10 December 2026\n\n${data.title}\n\n${data.paragraphs.join('\n\n')}\n\n${letterLanguage==='mr'?'कायम तुझाच,':'Always yours,'}\nDhanraj ♡`;const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`For-Apeksha-with-love-${letterLanguage}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('A little letter to keep, always. ♡');});
$('#make-wish').addEventListener('click',()=>{$('.cake').classList.add('blown');$('#make-wish').hidden=true;$('#wish-result').hidden=false;celebrate();});
$('#relight').addEventListener('click',()=>{$('.cake').classList.remove('blown');$('#make-wish').hidden=false;$('#wish-result').hidden=true;$('#make-wish').focus({preventScroll:true});});
