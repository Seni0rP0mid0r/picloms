const scene=document.querySelector('.identity-campaign');
const frame=scene.querySelector('.identity-stage');
const rail=scene.querySelector('.lineup-scroll');
const photo=rail.querySelector('img');
const preference=matchMedia('(max-width: 800px) and (prefers-reduced-motion: no-preference)');
let scheduled=false;
let offset=0,expected=0,base=0;
const controls=document.createElement('div');controls.className='carousel-arrows';
controls.innerHTML='<button type="button" aria-label="Предыдущие образы">←</button><button type="button" aria-label="Следующие образы">→</button>';
scene.querySelector('.story-position').append(controls);
controls.querySelectorAll('button').forEach((button,index)=>button.addEventListener('click',()=>{
 const distance=Math.max(0,photo.offsetWidth-rail.clientWidth);
 const target=Math.max(0,Math.min(distance,rail.scrollLeft+(index?1:-1)*rail.clientWidth*.8));
 offset=target-base;expected=target;rail.scrollLeft=target;updateCounter(distance);
}));
function updateCounter(distance){
 const progress=distance?rail.scrollLeft/distance:1;
 scene.style.setProperty('--progress',progress);
 document.querySelector('#look-number').textContent=String(Math.min(8,1+Math.floor(progress*8))).padStart(2,'0');
}
rail.addEventListener('scroll',()=>{
 if(Math.abs(rail.scrollLeft-expected)>2)offset=rail.scrollLeft-base;
 updateCounter(Math.max(0,photo.offsetWidth-rail.clientWidth));
},{passive:true});
function render(){
 scheduled=false;
 const enabled=preference.matches;
 scene.classList.toggle('kinetic-story',enabled);
 photo.style.transform='';
 if(!enabled){base=0;updateCounter(Math.max(0,photo.offsetWidth-rail.clientWidth));return;}
 const distance=Math.max(0,photo.offsetWidth-rail.clientWidth);
 scene.style.setProperty('--travel',`${distance}px`);
 const progress=Math.max(0,Math.min(1,-scene.getBoundingClientRect().top/(scene.offsetHeight-frame.offsetHeight)));
 base=progress*distance;
 expected=Math.max(0,Math.min(distance,base+offset));
 rail.scrollLeft=expected;
 updateCounter(distance);
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(render);}}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);preference.addEventListener('change',schedule);photo.addEventListener('load',schedule);schedule();
