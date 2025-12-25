// Simple confetti burst (no libs)
export function burstConfetti(durationMs = 1400){
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.zIndex = "250";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize(){
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
  }
  resize();
  window.addEventListener("resize", resize, {passive:true});

  const colors = ["#34d3ff","#7c5cff","#ff3b5c","#34ff9a","#ffffff"];
  const pieces = [];
  const count = 160;
  const w = () => canvas.width;
  const h = () => canvas.height;

  for(let i=0;i<count;i++){
    const angle = (Math.random()*Math.PI) + (Math.PI); // mostly upward
    const speed = 10 + Math.random()*18;
    pieces.push({
      x: w()/2 + (Math.random()*120 - 60) * DPR,
      y: h()*0.30 + (Math.random()*40 - 20) * DPR,
      vx: Math.cos(angle)*speed*DPR*0.6 + (Math.random()*2-1)*DPR*2,
      vy: Math.sin(angle)*speed*DPR*0.6 - (Math.random()*DPR*8),
      g: 0.55*DPR,
      r: (3 + Math.random()*4)*DPR,
      c: colors[(Math.random()*colors.length)|0],
      rot: Math.random()*Math.PI,
      vr: (Math.random()*0.24 - 0.12)
    });
  }

  const start = performance.now();
  function tick(now){
    const t = now - start;
    ctx.clearRect(0,0,w(),h());

    for(const p of pieces){
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.max(0, 1 - t/durationMs);
      ctx.fillRect(-p.r, -p.r, p.r*2.2, p.r*1.2);
      ctx.restore();
    }

    if(t < durationMs) requestAnimationFrame(tick);
    else{
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }
  requestAnimationFrame(tick);
}
