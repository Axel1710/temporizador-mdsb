// ====== Lógica del temporizador ======
(function(){
  const $ = (id)=>document.getElementById(id);
  const display = $("display");
  const minInput = $("minInput");
  const secInput = $("secInput");
  const startBtn = $("startBtn");
  const stopBtn = $("stopBtn");
  const resetBtn = $("resetBtn");
  const beep = $("beep");

  let running = false;
  let endAt = 0;           // timestamp cuando termina
  let remaining = 0;       // ms restantes cuando no corre
  let tickId = null;

  function clampSec(v){
    v = isNaN(v) ? 0 : Math.max(0, Math.min(59, v));
    return v;
  }

  function configMs(){
    const m = parseInt(minInput.value,10) || 0;
    const s = clampSec(parseInt(secInput.value,10) || 0);
    secInput.value = s; // normaliza
    return (m*60 + s)*1000;
  }

  function fmt(ms){
    ms = Math.max(0, Math.round(ms/1000));
    const mm = String(Math.floor(ms/60)).padStart(2,"0");
    const ss = String(ms%60).padStart(2,"0");
    return mm + ":" + ss;
  }

  function setDisplay(ms){ display.textContent = fmt(ms); }

  function setUI(isRunning){
    running = isRunning;
    startBtn.disabled = isRunning;
    stopBtn.disabled = !isRunning;
    resetBtn.disabled = false;
    minInput.disabled = isRunning;
    secInput.disabled = isRunning;
  }

  function start(){
    if(running) return;
    if(remaining <= 0){
      remaining = configMs();
    }
    endAt = Date.now() + remaining;
    setUI(true);
    tickId = setInterval(tick, 100);
  }

  function stop(){
    if(!running) return;
    clearInterval(tickId);
    tickId = null;
    remaining = Math.max(0, endAt - Date.now());
    setUI(false);
  }

  function reset(){
    clearInterval(tickId);
    tickId = null;
    remaining = configMs();
    setDisplay(remaining);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    minInput.disabled = false;
    secInput.disabled = false;
    running = false;
  }

  function tick(){
    const left = endAt - Date.now();
    if(left <= 0){
      clearInterval(tickId);
      tickId = null;
      setDisplay(0);
      try{ beep.currentTime = 0; beep.play(); }catch(e){}
      startBtn.disabled = true; // ya terminó
      stopBtn.disabled = true;
      resetBtn.disabled = false;
      running = false;
      remaining = 0;
      return;
    }
    setDisplay(left);
  }

  // Eventos
  startBtn.addEventListener("click", start);
  stopBtn.addEventListener("click", stop);
  resetBtn.addEventListener("click", reset);

  // Cambios en inputs mientras está detenido -> actualiza pantalla
  [minInput, secInput].forEach(inp => {
    inp.addEventListener("input", () => {
      if(!running){
        remaining = configMs();
        setDisplay(remaining);
      }
    });
  });

  // Atajos
  window.addEventListener("keydown", (e)=>{
    if(e.code === "Space"){ e.preventDefault(); running ? stop() : start(); }
    if(e.key === "r" || e.key === "R"){ e.preventDefault(); reset(); }
  });

  // Estado inicial
  remaining = configMs();
  setDisplay(remaining);
})();
