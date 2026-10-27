'use strict';
// Shared photo data and the accessible lightbox are provided by app.js.
(() => {
  const tiltTargets='.hero-art, .reason-card, .photo-card';
  if(!reducedMotion){
    document.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse')return;
      const target=event.target.closest?.(tiltTargets);if(!target)return;
      const bounds=target.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
      const amount=target.classList.contains('hero-art')?4:6;
      const x=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
      const y=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
      target.style.setProperty('--tilt-x',`${-y*amount}deg`);
      target.style.setProperty('--tilt-y',`${x*amount}deg`);
    });
    document.addEventListener('pointerout',event=>{
      const target=event.target.closest?.(tiltTargets);
      if(target&&!target.contains(event.relatedTarget)){target.style.removeProperty('--tilt-x');target.style.removeProperty('--tilt-y');}
    });
  }

  const memories=['together-16','iskcon-02','amanora-04','seasons-02','together-11','together-22'].map(byId);
  const scene=$('#memory-scene'), turntable=$('#memory-turntable'), rotateButton=$('#memory-rotate');
  let position=0, spinTimer=null, drag=null, suppressClick=false, suppressTimer=null;
  const activeIndex=()=>((position%memories.length)+memories.length)%memories.length;
  turntable.innerHTML=memories.map((photo,i)=>`<button class="memory-frame" data-memory="${i}" style="--frame-angle:${i*60}deg" aria-label="${photoCaptions[photo.id]}" tabindex="${i===0?'0':'-1'}"><img src="${photo.src}" alt="${photoCaptions[photo.id]}" loading="lazy" draggable="false"><span>${photoCaptions[photo.id]}</span></button>`).join('');
  $('#memory-dots').innerHTML=memories.map((photo,i)=>`<button class="memory-dot" data-memory-dot="${i}" aria-label="Show memory ${i+1}: ${photoCaptions[photo.id]}" aria-pressed="${i===0}"></button>`).join('');

  function render(){
    const active=activeIndex();
    turntable.style.setProperty('--orbit-angle',`${-position*60}deg`);
    $$('.memory-frame').forEach((frame,i)=>{frame.tabIndex=i===active?0:-1;frame.setAttribute('aria-hidden',String(i!==active));frame.classList.toggle('is-current',i===active);});
    $$('.memory-dot').forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));
    $('#memory-current').innerHTML=`${photoCaptions[memories[active].id]}<small>MEMORY ${active+1} OF ${memories.length}</small>`;
  }
  function stopSpin(){
    clearInterval(spinTimer);spinTimer=null;
    rotateButton.setAttribute('aria-pressed','false');rotateButton.innerHTML='<span aria-hidden="true">↻</span> Slowly turn the memories';
    $('#memory-current').setAttribute('aria-live','polite');
  }
  function move(step){position+=step;render();}
  function goTo(index){const diff=((index-activeIndex()+9)%6)-3;position+=diff;render();}
  $('#memory-prev').addEventListener('click',()=>{stopSpin();move(-1);});
  $('#memory-next').addEventListener('click',()=>{stopSpin();move(1);});
  $('#memory-dots').addEventListener('click',event=>{const dot=event.target.closest('[data-memory-dot]');if(dot){stopSpin();goTo(Number(dot.dataset.memoryDot));}});
  turntable.addEventListener('click',event=>{
    const frame=event.target.closest('[data-memory]');if(!frame||suppressClick)return;
    stopSpin();const index=Number(frame.dataset.memory);
    if(index===activeIndex())openLightbox(memories,index);else goTo(index);
  });
  scene.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();stopSpin();
    if(event.key==='Home')goTo(0);else if(event.key==='End')goTo(memories.length-1);else move(event.key==='ArrowRight'?1:-1);
    // Keep keyboard focus on the stable scene rather than a card rotating away.
    scene.focus({preventScroll:true});
  });
  rotateButton.hidden=reducedMotion;
  rotateButton.addEventListener('click',()=>{
    if(reducedMotion)return;
    if(spinTimer!==null){stopSpin();return;}
    rotateButton.setAttribute('aria-pressed','true');rotateButton.innerHTML='<span aria-hidden="true">Ⅱ</span> Pause the memories';
    $('#memory-current').setAttribute('aria-live','off');
    spinTimer=setInterval(()=>move(1),4200);
  });
  scene.addEventListener('focusin',stopSpin);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpin();});
  // Stop when the album leaves the viewport; never run background rotation.
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopSpin();},{threshold:.1}).observe(scene);}
  scene.addEventListener('dragstart',event=>event.preventDefault());
  scene.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false)return;
    stopSpin();drag={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,horizontal:false};
  });
  scene.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.horizontal&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag=null;return;}
    if(!drag.horizontal&&Math.abs(dx)>8){drag.horizontal=true;scene.setPointerCapture?.(event.pointerId);scene.classList.add('dragging');}
    if(drag.horizontal){drag.dx=dx;if(!reducedMotion)turntable.style.setProperty('--orbit-angle',`${-position*60+Math.max(-180,Math.min(180,dx))*.28}deg`);}
  });
  function finishDrag(event,cancelled=false){
    if(!drag||event.pointerId!==drag.id)return;
    const gesture=drag;drag=null;scene.classList.remove('dragging');
    if(scene.hasPointerCapture?.(event.pointerId))scene.releasePointerCapture(event.pointerId);
    if(gesture.horizontal){suppressClick=true;clearTimeout(suppressTimer);suppressTimer=setTimeout(()=>{suppressClick=false;},300);}
    if(!cancelled&&Math.abs(gesture.dx)>32)move(gesture.dx<0?1:-1);else render();
  }
  scene.addEventListener('pointerup',event=>finishDrag(event));
  scene.addEventListener('pointercancel',event=>finishDrag(event,true));
  scene.addEventListener('lostpointercapture',event=>finishDrag(event,true));
  // A mouse released outside the stage before capture must not leave a drag active.
  scene.addEventListener('pointerleave',event=>{if(drag&&!drag.horizontal)finishDrag(event,true);});
  render();
})();
