(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const isHome=location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
 if(isHome)document.documentElement.classList.add('home-loading');
 let leaving=false;
 document.addEventListener('DOMContentLoaded',()=>{
   document.body.classList.add('page-arriving');
   setTimeout(()=>document.body.classList.remove('page-arriving'),350);
   if(!isHome)return;
   const loader=document.createElement('div');loader.className='page-loader';loader.setAttribute('aria-hidden','true');
   loader.innerHTML='<img src="assets/logo.jpg" alt=""><span>PICLOMS</span><i></i>';
   document.body.append(loader);
   const hero=[...document.querySelectorAll('.hero img')].find(img=>img.getBoundingClientRect().width>0);
   const ready=hero?.decode?.().catch(()=>{}) || Promise.resolve();
   Promise.race([ready,new Promise(resolve=>setTimeout(resolve,4000))]).then(()=>{
     document.documentElement.classList.remove('home-loading');
     loader.classList.add('loaded');setTimeout(()=>loader.remove(),reduced.matches?0:350);
   });
 });
 document.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced.matches)return;
   const link=event.target.closest('a[href]');
   if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self'||link.hasAttribute('data-product'))return;
   const dest=new URL(link.href,location.href);
   if(dest.origin!==location.origin||!(/\.html$|\/$/.test(dest.pathname)))return;
   if(dest.pathname===location.pathname&&dest.search===location.search)return;
   event.preventDefault();if(leaving)return;leaving=true;
   document.body.classList.add('page-leaving');
   setTimeout(()=>location.assign(dest.href),200);
 });
 window.addEventListener('pageshow',()=>{leaving=false;document.body?.classList.remove('page-leaving');});
})();
