(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards=[...document.querySelectorAll('.depth-card')];
  const choices=[...document.querySelectorAll('[data-select-photo]')];
  let selected=0;
  function choose(index){
    selected=index;
    cards.forEach((card,i)=>{card.dataset.position=i===index?'center':((i-index+3)%3===1?'right':'left');});
    choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  choices.forEach((button,i)=>button.addEventListener('click',()=>{choose(i);document.dispatchEvent(new Event('birthday:gallery-interaction'));}));
  choose(0);
  for(const stage of document.querySelectorAll('.photo-stage,.exposure-stage')){
    if(reduced)continue;
    stage.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch')return;
      const rect=stage.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      stage.style.setProperty('--rx',(-y*10).toFixed(2)+'deg');
      stage.style.setProperty('--ry',(x*16).toFixed(2)+'deg');
    });
    stage.addEventListener('pointerleave',()=>{
      stage.style.setProperty('--rx','0deg');stage.style.setProperty('--ry','0deg');
    });
  }
})();