/* Birthday sequence adapted from ayushindurkar/HBD (MIT). See CREDITS.md. */
(() => {
  const $ = selector => document.querySelector(selector);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [...document.querySelectorAll('.scene')];
  const ideas = [...document.querySelectorAll('.five > p')];
  const ideaRanges = [];
  let currentIdea = -1;
  const chapters = [
    { name:'hello', title:'A little hello', selector:'.one' },
    { name:'birthday', title:'Your special day', selector:'.three' },
    { name:'letter', title:'A letter for you', selector:'.four' },
    { name:'ideas', title:'My favourite person', selector:'.five' },
    { name:'photo', title:'That beautiful smile', selector:'.six' },
    { name:'gallery', title:'Every angle. Always us.', selector:'.depth-gallery' },
    { name:'exposure', title:'Two hearts. One forever.', selector:'.double-exposure' },
    { name:'forever', title:'Our story', selector:'.nine' },
    { name:'ending', title:'Always, you', selector:'.ten' }
  ];
  let tl, active = -1, started = false;
  const pauseButton = $('#pause'), nextButton = $('#next');
  function updateControls() {
    const paused = tl.paused();
    document.body.classList.toggle('story-paused', paused);
    pauseButton.textContent = paused ? '▶ Play' : 'Ⅱ Pause';
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.disabled = active === chapters.length - 1 && tl.progress() === 1;
  }
  function syncScene() {
    const time = tl.time();
    let index = chapters.length - 1;
    while (index > 0 && time < tl.labels[chapters[index].name]) index--;
    $('#progress').style.width = (tl.progress() * 100) + '%';
    // Explicit display isolation also works when seeking or replaying the timeline.
    const ideaIndex = index === 3 ? ideaRanges.findIndex(range => time >= range.start && time < range.end) : -1;
    if (currentIdea !== ideaIndex) currentIdea = ideaIndex;
    ideas.forEach((idea, i) => {
      idea.hidden = i !== ideaIndex;
      idea.setAttribute('aria-hidden', String(i !== ideaIndex));
    });
    if (active !== index) {
      const old = active >= 0 ? $(chapters[active].selector) : null;
      if (old && old.contains(document.activeElement)) nextButton.focus();
      active = index;
      scenes.forEach((scene, i) => { scene.inert = i !== index; scene.setAttribute('aria-hidden', String(i !== index)); });
      $('#scene-status').textContent = String(index + 1).padStart(2,'0') + ' / ' + String(chapters.length).padStart(2,'0') + ' · ' + chapters[index].title;
      document.body.classList.toggle('is-ending', index === chapters.length - 1);
      document.body.classList.toggle('is-cinematic', ['gallery','exposure'].includes(chapters[index].name));
      nextButton.disabled = index === chapters.length - 1;
    }
  }
  function buildTimeline() {
    const gs = window.gsap;
    const duration = reduced ? .01 : .65;
    const enter = (selector, vars = {}) => tl.fromTo(selector,
      { autoAlpha:0, y:reduced ? 0 : 20, ...vars },
      { autoAlpha:1, y:0, scale:1, rotation:0, rotationX:0, duration, ease:'power2.out', immediateRender:false });
    const leave = (selector, delay) => tl.to(selector, { autoAlpha:0, y:reduced ? 0 : -20, duration, ease:'power2.in' }, '+=' + delay);
    for (let i = 0; i < 16; i++) {
      const img = document.createElement('img');
      img.src = 'img/heart-balloon-' + (i % 3 + 1) + '.svg'; img.alt = '';
      img.style.left = (i * 43 % 100) + '%';
      $('#balloons').appendChild(img);
    }
    const heading = $('.wish-hbd');
    const text = heading.textContent;
    heading.setAttribute('aria-label', text);
    heading.replaceChildren(...[...text].map(char => {
      const span = document.createElement('span'); span.textContent = char; span.setAttribute('aria-hidden','true'); return span;
    }));
    gs.set('.scene', {autoAlpha:0});
    gs.set('.container', {visibility:'visible'});
    tl = gs.timeline({paused:true, onUpdate:syncScene, onComplete:updateControls});
    tl.addLabel('hello');
    enter('.one');
    tl.fromTo('.two', {autoAlpha:0,y:reduced ? 0 : 12}, {autoAlpha:1,y:0,duration,immediateRender:false});
    leave('.one', 4.5);
    tl.addLabel('birthday');
    enter('.three', {scale:reduced ? 1 : .92});
    leave('.three', 4.5);
    tl.addLabel('letter');
    enter('.four', {scale:reduced ? 1 : .85});
    leave('.four', 28);
    tl.addLabel('ideas').set('.five', {autoAlpha:1,y:0});
    for (let i = 1; i <= 6; i++) {
      const selector = '.idea-' + i;
      const start = tl.duration();
      enter(selector, {rotationX:reduced ? 0 : 12});
      if (i === 6 && !reduced) {
        tl.fromTo('.idea-6>span',{y:12,rotation:0},{y:0,rotation:0,duration:.7,stagger:.12,ease:'back.out(1.5)',immediateRender:false}, '<');
      }
      leave(selector, i === 6 ? 4.5 : 3);
      ideaRanges.push({start, end:tl.duration()});
    }
    tl.set('.five', {autoAlpha:0});
    tl.addLabel('photo');
    enter('.six');
    tl.fromTo('.portrait-wrap',{rotationY:reduced ? 0 : -20,scale:reduced ? 1 : .9},{rotationY:0,scale:1,duration,ease:'power2.out',immediateRender:false}, '<');
    if (!reduced) {
      tl.fromTo('.hat',{y:-65,rotation:-25,autoAlpha:0},{y:0,rotation:12,autoAlpha:1,duration:.7,ease:'bounce.out',immediateRender:false}, 'photo+=.6');
      tl.fromTo('.wish-hbd span',{y:-30,autoAlpha:0,rotation:15},{y:0,autoAlpha:1,rotation:0,duration:.5,stagger:.045,ease:'back.out(1.7)',immediateRender:false}, 'photo+=.8');
      tl.fromTo('.baloons img',{y:0,autoAlpha:.85},{y:() => -innerHeight - 450,autoAlpha:0,duration:6.5,stagger:.17,ease:'power1.out',immediateRender:false}, 'photo');
    }
    tl.to('.six',{autoAlpha:0,y:reduced ? 0 : 20,duration}, 'photo+=12');
    tl.addLabel('gallery');
    enter('.depth-gallery');
    if (!reduced) tl.fromTo('.photo-stage',{rotationY:-12,scale:.9},{rotationY:0,scale:1,duration:1.2,ease:'power2.out',immediateRender:false}, '<');
    leave('.depth-gallery',18);
    tl.addLabel('exposure');
    enter('.double-exposure');
    if (!reduced) tl.fromTo('.exposure-stage',{scale:.88,y:20},{scale:1,y:0,duration:1.4,ease:'power2.out',immediateRender:false}, '<');
    leave('.double-exposure',16);
    tl.addLabel('forever');
    enter('.nine');
    if (!reduced) {
      tl.fromTo('.memory-strip figure',{y:30,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.13,immediateRender:false}, '<');
      tl.fromTo('.eight svg',{scale:1,autoAlpha:.5},{scale:35,autoAlpha:0,duration:2,stagger:.2,immediateRender:false}, '<');
    }
    leave('.nine', 8);
    tl.addLabel('ending');
    enter('.ten');
    tl.fromTo('.ending-heart, .ten-p, .line1, .line2, .line3, .ending-sign, .ending-actions, .template-credit',
      {autoAlpha:0,y:reduced ? 0 : 18},
      {autoAlpha:1,y:0,duration,stagger:reduced ? 0 : .18,immediateRender:false}, '<');
    if (reduced) {
      // Respect reduced motion: advance on request, with no automatic scene changes.
      chapters.slice(1).forEach(chapter => tl.addPause(tl.labels[chapter.name] - .02, updateControls));
    }
    syncScene();
  }
  function fallback() {
    document.body.classList.remove('not-started');
    document.body.classList.add('static-view');
    scenes.forEach(scene => {scene.inert = false; scene.removeAttribute('aria-hidden');});
    ideas.forEach(idea => {idea.hidden = false; idea.removeAttribute('aria-hidden');});
    $('#replay').textContent = '↑ Back to the beginning';
    $('#replay').onclick = () => window.scrollTo({top:0,behavior:'smooth'});
  }
  async function begin(withMusic) {
    if (started) return;
    started = true;
    document.body.classList.remove('not-started');
    $('.story-controls').hidden = false;
    if (withMusic) window.BirthdayMusic.set(true);
    tl.play(0);
    updateControls();
    pauseButton.focus({preventScroll:true});
  }
  pauseButton.addEventListener('click', () => {
    if (!tl) return;
    tl.paused(!tl.paused()); updateControls();
  });
  nextButton.addEventListener('click', () => {
    if (!tl || active >= chapters.length - 1) return;
    if (active === 3 && currentIdea < ideas.length - 1) {
      tl.seek(ideaRanges[currentIdea + 1].start + .03, false).play();
    } else {
      const label = chapters[active + 1].name;
      tl.seek(tl.labels[label] + .03, false).play();
    }
    syncScene(); updateControls();
  });
  $('#replay').addEventListener('click', () => {
    if (!tl) return;
    $('.text-box').scrollTop = 0;
    document.querySelector('[data-select-photo="0"]').click();
    tl.restart(); syncScene(); updateControls();
    pauseButton.focus({preventScroll:true});
  });
  document.addEventListener('birthday:gallery-interaction', () => { if (tl && chapters[active]?.name === 'gallery') { tl.pause(); updateControls(); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && started) {
      if (tl) { tl.pause(); updateControls(); }
      if (window.BirthdayMusic.wanted) window.BirthdayMusic.set(false);
    }
  });
  if (!window.gsap) { fallback(); return; }
  buildTimeline();
  if (window.Swal) {
    Swal.fire({
      title:'A little surprise,<br>just for you.',
      html:'<p class="welcome-date">10 December 2026</p><p>For my Apeksha. From your Dhanraj.<br><span lang="mr">एक छोटंसं सरप्राईज, खूप सारं प्रेम.</span></p>',
      imageUrl:'img/apeksha.webp', imageAlt:'Apeksha smiling', imageWidth:100, imageHeight:100,
      customClass:{popup:'birthday-popup', image:'welcome-photo'},
      showCancelButton:true, confirmButtonText:'♫ Open with music', cancelButtonText:'Open quietly',
      allowOutsideClick:false, allowEscapeKey:false, focusConfirm:false, returnFocus:false
    }).then(result => begin(result.isConfirmed));
  } else {
    begin(false);
  }
})();
