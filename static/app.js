// Frontend dashboard script
// Modular functions, clean structure, keep backend API unchanged (/api/distance)

const speedEl = document.getElementById('speedValue');
const directionEl = document.getElementById('directionValue');
const lastUpdateEl = document.getElementById('lastUpdateValue');
const avgSpeedEl = document.getElementById('avgSpeedValue');
const maxSpeedEl = document.getElementById('maxSpeedValue');
const connectionStatusEl = document.getElementById('connectionStatus');
// Buttons will be queried inside init() to ensure DOM is ready
let startBtn = null;
let stopBtn = null;
let reloadBtn = null;
const toastArea = document.getElementById('toastArea');
const loadingOverlay = document.getElementById('loadingOverlay');

const ctx = document.getElementById('chart').getContext('2d');

// EMA smoothing & settings
let prevSmoothed = null;
let EMA_ALPHA = 0.16; // smaller => smoother curve

// Chart.js setup: single dataset (speed in m/s) with smooth curve
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Speed (m/s)',
      data: [],
      borderColor: 'rgba(64,196,255,0.98)',
      backgroundColor: ctx.createLinearGradient(0,0,0,300),
      tension: 0.6,
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      borderWidth: 3,
      fill: 'start'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutCubic' },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { display: false },
      y: {
        display: true,
        min: 0.05,
        max: 0.10,
        title: { display: true, text: 'm/s' },
        grid: { color: 'rgba(255,255,255,0.03)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#061122',
        titleColor: '#fff',
        bodyColor: '#cfefff',
        borderColor: 'rgba(64,196,255,0.18)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context){
            const v = context.parsed.y;
            return ` ${v ? v.toFixed(3) : '--'} m/s`;
          }
        }
      },
      zoom: {
        pan: { enabled: true, mode: 'x', modifierKey: 'ctrl' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
      }
    }
  }
});

// Prepare gradient for chart fill (after chart created)
const grad = ctx.createLinearGradient(0,0,0,400);
grad.addColorStop(0, 'rgba(64,196,255,0.16)');
grad.addColorStop(0.6, 'rgba(64,196,255,0.06)');
grad.addColorStop(1, 'rgba(64,196,255,0.02)');
chart.data.datasets[0].backgroundColor = grad;

let pollInterval = null;
let simInterval = null;

// ------------------------- Utility functions -------------------------
function formatTime(ts){
  if(!ts) return '--';
  const d = new Date(ts*1000);
  return d.toLocaleString();
}

function setConnectionStatus(online){
  if(online){
    connectionStatusEl.classList.remove('offline');
    connectionStatusEl.classList.add('online');
    connectionStatusEl.innerHTML = '<i class="fa-solid fa-circle"></i> Online';
  } else {
    connectionStatusEl.classList.remove('online');
    connectionStatusEl.classList.add('offline');
    connectionStatusEl.innerHTML = '<i class="fa-solid fa-circle"></i> Offline';
  }
}

function showLoading(){ loadingOverlay.classList.remove('hidden'); }
function hideLoading(){ loadingOverlay.classList.add('hidden'); }

function showToast(message, type='info'){
  const el = document.createElement('div');
  el.className = 'toast ' + (type==='success'? 'success' : type==='error'? 'error' : type==='warn'? 'warn' : '');
  el.innerHTML = `<div class="t-msg">${message}</div>`;
  toastArea.prepend(el);
  setTimeout(()=>{ el.style.opacity = '0'; el.style.transform = 'translateY(-8px)'; setTimeout(()=>el.remove(),400); }, 4200);
}

// ------------------------- API functions -------------------------
// GET current distance and speed
async function fetchState(){
  try{
    const res = await fetch('/api/distance');
    if(!res.ok) throw new Error('Network');
    const json = await res.json();
    setConnectionStatus(true);
    updateFromServer(json);
  }catch(err){
    setConnectionStatus(false);
    console.error('Fetch state error', err);
  }
}

// POST a distance reading (for simulation)
async function postDistance(distance){
  try{
    await fetch('/api/distance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({distance}) });
  }catch(err){ console.error('Post distance error', err); }
}

// ------------------------- UI update functions -------------------------
function updateFromServer(data){
  // data expected: { distance, ts, speed_m_s, speed_kmh, direction, history }
  const s = data.speed_m_s;
  const dir = data.direction || '--';
  const ts = data.ts || null;

  // distanceEl was removed from UI; do not reference it to avoid runtime errors
  if(speedEl) speedEl.innerHTML = (isFinite(s) && s!=null) ? `${Number(s).toFixed(3)} <span class="unit">m/s</span>` : '--';
  if(directionEl) directionEl.textContent = dir || '--';
  if(lastUpdateEl) lastUpdateEl.textContent = formatTime(ts);

  // update chart with EMA-smoothed speed
  addSpeedPoint(s);

  // compute average and max speed from history if available
  // Prefer server-provided aggregate values when available
  if(data.avg_speed_m_s != null || data.max_speed_m_s != null){
    if(avgSpeedEl) avgSpeedEl.innerHTML = (data.avg_speed_m_s != null) ? `${Number(data.avg_speed_m_s).toFixed(3)} <span class="unit">m/s</span>` : '--';
    if(maxSpeedEl) maxSpeedEl.innerHTML = (data.max_speed_m_s != null) ? `${Number(data.max_speed_m_s).toFixed(3)} <span class="unit">m/s</span>` : '--';
  } else if(data.history && Array.isArray(data.history) && data.history.length>0){
    const speeds = data.history.map(h=> (h && isFinite(h.speed_m_s) ? Number(h.speed_m_s) : null)).filter(v=> v!==null);
    if(speeds.length>0){
      const sum = speeds.reduce((a,b)=>a+b,0);
      const avg = sum / speeds.length;
      const max = Math.max(...speeds);
      if(avgSpeedEl) avgSpeedEl.innerHTML = `${avg.toFixed(3)} <span class="unit">m/s</span>`;
      if(maxSpeedEl) maxSpeedEl.innerHTML = `${max.toFixed(3)} <span class="unit">m/s</span>`;
    } else {
      if(avgSpeedEl) avgSpeedEl.textContent = '--';
      if(maxSpeedEl) maxSpeedEl.textContent = '--';
    }
  } else {
    if(avgSpeedEl) avgSpeedEl.textContent = '--';
    if(maxSpeedEl) maxSpeedEl.textContent = '--';
  }
}

function addSpeedPoint(speed){
  // speed in m/s
  let value = null;
  if(isFinite(speed) && speed!=null){
    if(prevSmoothed===null) prevSmoothed = speed;
    const sm = EMA_ALPHA * speed + (1-EMA_ALPHA) * prevSmoothed;
    prevSmoothed = sm;
    value = Number(sm.toFixed(2));
  } else {
    value = prevSmoothed !== null ? Number(prevSmoothed.toFixed(2)) : null;
  }

  const time = new Date().toLocaleTimeString();
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);
  if(chart.data.labels.length > 180){ chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
  chart.update('active');
}

// ------------------------- Simulation control -------------------------
function startSimulation(){
  // Request server to start simulation
  showToast('Starting server simulation...', 'info');
  fetch('/api/distance', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action: 'start_sim'}) })
    .then(r => r.json())
    .then(j => {
      if(j && (j.status==='sim_started' || j.status==='started')){
        showToast('Simulation started on server', 'success');
        if(startBtn) startBtn.disabled = true;
        if(stopBtn) stopBtn.disabled = false;
        // fetch state immediately to reflect first sample
        setTimeout(fetchState, 200);
      } else {
        showToast('Failed to start simulation', 'error');
        console.warn('start_sim response', j);
      }
    }).catch(e=>{ showToast('Start request failed', 'error'); console.error(e); });
}

function stopSimulation(){
  // Request server to stop simulation
  showToast('Stopping server simulation...', 'info');
  fetch('/api/distance', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action: 'stop_sim'}) })
    .then(r=>r.json())
    .then(j=>{
      if(j && (j.status==='sim_stopped' || j.status==='stopped')){
        showToast('Simulation stopped on server', 'warn');
        if(startBtn) startBtn.disabled = false;
        if(stopBtn) stopBtn.disabled = true;
      } else {
        showToast('Failed to stop simulation', 'error');
        console.warn('stop_sim response', j);
      }
    }).catch(e=>{ showToast('Stop request failed', 'error'); console.error(e); });
}

// ------------------------- Chart controls -------------------------
function zoomIn(){
  try{ chart.zoom(1.2); }catch(e){}
}
function zoomOut(){
  try{ chart.zoom(0.8); }catch(e){}
}
function resetZoom(){
  try{ chart.resetZoom(); }catch(e){}
}

// ------------------------- Initialization -------------------------
function init(){
  // clock
  setInterval(()=>{ document.getElementById('clock').textContent = new Date().toLocaleTimeString(); }, 1000);

  // attach buttons (guarded)
  startBtn = document.getElementById('startSimBtn');
  stopBtn = document.getElementById('stopSimBtn');
  reloadBtn = document.getElementById('reloadBtn');
  if(startBtn) startBtn.addEventListener('click', startSimulation);
  if(stopBtn) stopBtn.addEventListener('click', stopSimulation);
  if(reloadBtn) reloadBtn.addEventListener('click', ()=>{ showToast('Refreshing data'); fetchState(); });
  // initialize button states
  if(startBtn) startBtn.disabled = false;
  if(stopBtn) stopBtn.disabled = true;
  document.getElementById('zoomIn').addEventListener('click', zoomIn);
  document.getElementById('zoomOut').addEventListener('click', zoomOut);
  document.getElementById('resetZoom').addEventListener('click', resetZoom);

  // start polling
  fetchState();
  pollInterval = setInterval(fetchState, 700);

  // initial UI
  setConnectionStatus(false);
  hideLoading();
}

// start
window.addEventListener('DOMContentLoaded', ()=>{ init(); });

