const scene=document.querySelector('.identity-campaign');
const frame=scene.querySelector('.identity-stage');
const rail=scene.querySelector('.lineup-scroll');
const photo=rail.querySelector('img');
const preference=matchMedia('(max-width: 800px) and (prefers-reduced-motion: no-preference)');
let scheduled=false;
function render(){
 scheduled=false;
 const enabled=preference.matches;
 scene.classList.toggle('kinetic-story',enabled);
 if(!enabled){photo.style.transform='';scene.style.removeProperty('--progress');document.querySelector('#look-number').textContent='08';return;}
 const distance=Math.max(0,photo.offsetWidth-rail.clientWidth);
 scene.style.setProperty('--travel',`${distance}px`);
 const progress=Math.max(0,Math.min(1,-scene.getBoundingClientRect().top/(scene.offsetHeight-frame.offsetHeight)));
 photo.style.transform=`translate3d(${-progress*distance}px,0,0)`;
 scene.style.setProperty('--progress',progress);
 document.querySelector('#look-number').textContent=String(Math.min(8,1+Math.floor(progress*8))).padStart(2,'0');
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(render);}}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);preference.addEventListener('change',schedule);photo.addEventListener('load',schedule);schedule();

