import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['store-ui.css','store-ui.js','navigation.css','index.html','shop.html','styles.css','script.js','shop.css','shop.js','home.css','home.js','motion.js','page-flow.js','page-flow.css','buyers.html','refinement.css','catalog.mjs','evolution.css','silhouette.html','silhouette.css','silhouette.js'])await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
console.log('Built static site into dist/');



