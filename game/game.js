const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),statusEl=document.querySelector('#status');
const up=new Image(),down=new Image(),mark=new Image();up.src='assets/bird-up.png';down.src='assets/bird-down.png';mark.src='assets/github-mark.png';
canvas.width=window.innerWidth<600?480:720;
let state='ready',y=200,vy=0,scroll=0,score=0,last=0,time=0,pausedFrom='playing';
const gates=[{x:520,cy:200},{x:810,cy:150},{x:1100,cy:230},{x:1390,cy:175},{x:1680,cy:210}];
function report(s){statusEl.textContent=s}function reset(){state='ready';y=200;vy=0;scroll=0;score=0;time=0;report('Ready. Press Space or tap the game to start.');draw()}
function flap(){if(state==='paused')return;if(['lost','won'].includes(state))return;if(state==='ready'){state='playing';report('In flight. Five gates to the mailbox.')}vy=-240}
function lose(){state='lost';report('A little bump! Press Space or tap the game to try again.')}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(s,x,y,size=14,c='#b7cbbf'){ctx.fillStyle=c;ctx.font=`${size}px monospace`;ctx.fillText(s,x,y)}
function update(dt){if(state!=='playing')return;time+=dt;scroll+=145*dt;vy+=650*dt;y+=vy*dt;
 if(y<31||y>335){lose();return}
 score=0;for(const gate of gates){let x=gate.x-scroll;if(x+44<150)score++;if(x<166&&x+44>134&&(y-15<gate.cy-90||y+15>gate.cy+90)){lose();return}}
 if(scroll>1900){state='won';report('Delivered! Five gates cleared. Happy mailbox, happy courier. Press Space or tap for another flight.')}
}
function draw(){ctx.clearRect(0,0,720,400);rect(0,0,720,400,'#0d1117');
 for(let i=0;i<7;i++){let x=((100+i*133-scroll*.2)%850+850)%850-60;let yy=65+(i%3)*67;rect(x,yy,35,6,'#182b34');rect(x+8,yy-5,18,16,'#182b34')}
 for(let j=0;j<65;j++){let x=((j*14-scroll*.65)%750+750)%750-10;rect(x,366+(j%3)*5,9,9,['#0e4429','#006d32','#26a641'][j%3])}
 for(const gate of gates){const x=gate.x-scroll;if(x<-50||x>740)continue;for(let row=1;row<34;row++){let yy=row*10;if(yy>gate.cy-90&&yy<gate.cy+90)continue;for(let col=0;col<4;col++)rect(x+col*11,yy,8,8,['#0e4429','#006d32','#26a641'][(col+row)%3])}rect(x-3,gate.cy-95,50,7,'#52a86a');rect(x-3,gate.cy+90,50,7,'#52a86a')}
 let mx=2110-scroll;if(mx<770){rect(mx+20,244,7,115,'#9a799c');rect(mx,150,100,95,'#416d57');rect(mx+9,140,82,115,'#416d57');if(mark.complete&&mark.naturalWidth)ctx.drawImage(mark,mx+16,151,68,68);rect(mx+3,227,94,5,'#a2bba7');rect(mx+101,151,6,70,'#d4a1bf');rect(mx+107,state==='won'?151:206,25,12,'#d4a1bf')}
 // original sprite's visual body is centred in its transparent 80px square
 const yy=state==='ready'?200+Math.sin(performance.now()/280)*5:y;let bx=state==='won'?Math.min(300,150+(scroll-1820)*2):150;
 const sprite=Math.sin(performance.now()/65)>0?up:down;if(sprite.complete&&sprite.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,bx-48,yy-48,96,96)}
 if(state!=='won'){rect(bx-12,yy+28,25,20,'#c7a07b');rect(bx-2,yy+28,5,20,'#efd3a1');text('{}',bx-9,yy+42,12,'#503c48')}
 text(`gates ${score} / 5`,20,29,15,'#9bd0a7');text('COMMIT COURIER',canvas.width-186,29,14,'#d7bfdf');
 if(['ready','lost','paused','won'].includes(state)){
  ctx.fillStyle='#0d1117';const ox=(canvas.width-350)/2,oy=state==='won'?42:117;ctx.fillRect(ox,oy,350,state==='won'?104:142);text({ready:'SPECIAL DELIVERY',lost:'OOPS, A LITTLE BUMP',paused:'TAKE A BREATHER',won:'PARCEL DELIVERED'}[state],ox+22,oy+(state==='won'?30:44),19,'#e5cae9');
  const lines={ready:['Space / tap to start','Flap through five green gates'],lost:['Your bird is okay.','Space / tap to try again.'],paused:['Space / tap to resume.'],won:['Five gates. One happy mailbox.','Space / tap for one more flight.']}[state];lines.forEach((s,i)=>text(s,ox+22,oy+(state==='won'?60:78)+i*(state==='won'?20:25),13))
 }
}
function tick(now){const dt=Math.min(.025,Math.max(0,(now-last)/1000));last=now;update(dt);draw();requestAnimationFrame(tick)}
function activate(){
 if(state==='paused'){state='playing';last=performance.now();report('In flight.');return}
 if(state==='lost'||state==='won')reset();
 flap();
}
canvas.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button>0)return;e.preventDefault();canvas.focus({preventScroll:true});activate()});
window.addEventListener('keydown',e=>{if(e.code!=='Space')return;if(['A','INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName)||e.target.isContentEditable)return;e.preventDefault();if(e.repeat)return;activate()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing'){state='paused';report('Paused while away. Press Space or tap to resume.')}});
// Read-only diagnostics let the local review verify physics and controls, no network or private data.
window.courierSnapshot=()=>({state,y,vy,scroll,score,next:gates.find(g=>g.x-scroll+44>=130)||null});
requestAnimationFrame(tick);
