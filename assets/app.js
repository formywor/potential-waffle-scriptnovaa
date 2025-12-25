 import { burstConfetti } from "./confetti.js";

/* =========================
   ScriptNovaA "state" (front-end demo)
   ========================= */

const DEFAULT_USERS = [
  { username: "iii_dev", pin: "1234", role: "founder" },
  { username: "Kaysofs", pin: "1234", role: "admin" },
  { username: "uliseskeepklickin", pin: "1234", role: "admin" },
  { username: "n.sakks", pin: "1234", role: "admin" },
];

const LS = {
  users: "sn_users",
  session: "sn_session",
  serverDown: "sn_server_down",
  appDown: "sn_app_down" // simulated "app status" (we keep WORKING by default)
};

export function initState(){
  // Initialize users if missing
  if(!localStorage.getItem(LS.users)){
    localStorage.setItem(LS.users, JSON.stringify(DEFAULT_USERS));
  }
  // Initialize statuses if missing
  if(localStorage.getItem(LS.serverDown) === null) localStorage.setItem(LS.serverDown, "false");
  if(localStorage.getItem(LS.appDown) === null) localStorage.setItem(LS.appDown, "false");
}

export function getUsers(){
  return JSON.parse(localStorage.getItem(LS.users) || "[]");
}
export function setUsers(users){
  localStorage.setItem(LS.users, JSON.stringify(users));
}
export function getSession(){
  return JSON.parse(localStorage.getItem(LS.session) || "null");
}
export function setSession(sess){
  localStorage.setItem(LS.session, JSON.stringify(sess));
}
export function clearSession(){
  localStorage.removeItem(LS.session);
}

export function isServerDown(){
  return (localStorage.getItem(LS.serverDown) || "false") === "true";
}
export function setServerDown(v){
  localStorage.setItem(LS.serverDown, v ? "true" : "false");
}

export function isAppDown(){
  return (localStorage.getItem(LS.appDown) || "false") === "true";
}
export function setAppDown(v){
  localStorage.setItem(LS.appDown, v ? "true" : "false");
}

/* =========================
   UI helpers
   ========================= */
export function toast(msg){
  const t = document.querySelector(".toast");
  if(!t) return alert(msg);
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 2400);
}

export function ensureMaintenanceOverlay(){
  // On public pages, if server is down, block everything
  const overlay = document.querySelector("#maintenanceOverlay");
  if(!overlay) return;
  if(isServerDown()){
    overlay.classList.add("show");
    const box = overlay.querySelector("[data-codebox]");
    if(box){
      box.textContent =
`server status: DOWN
EVERYTHING IS BLOCKED
app status: WORKING`;
    }
  }else{
    overlay.classList.remove("show");
  }
}

export function requireAdmin(){
  const s = getSession();
  if(!s){
    window.location.href = "./login.html";
    return null;
  }
  return s;
}

export function renderAdminHeader(session){
  const holder = document.querySelector("[data-admin-header]");
  if(!holder) return;

  const isFounder = session?.username === "iii_dev";
  holder.innerHTML = `
    <div class="admin-head">
      <div class="row">
        <div class="logo float"></div>
        <div>
          <div class="kicker">Admin Console</div>
          <div style="font-size:16px; letter-spacing:.06em; margin-top:2px;">
            ScriptNovaa Control
          </div>
        </div>
      </div>
      <div class="row">
        <span class="chip ${isFounder ? "founder" : ""}">
          Logged in: <b>${escapeHtml(session.username)}</b>${isFounder ? " · Founder" : ""}
        </span>
        <button class="btn" id="logoutBtn">Logout</button>
      </div>
    </div>
  `;

  document.querySelector("#logoutBtn")?.addEventListener("click", ()=>{
    clearSession();
    toast("Logged out.");
    setTimeout(()=>window.location.href="./login.html", 450);
  });
}

export function welcomeAnimation(name){
  const el = document.querySelector("[data-welcome-name]");
  if(el) el.textContent = name;

  // stagger in
  const items = document.querySelectorAll("[data-pop]");
  items.forEach((node, i)=>{
    node.animate(
      [
        { transform:"translateY(16px)", opacity:0, filter:"blur(6px)" },
        { transform:"translateY(0)", opacity:1, filter:"blur(0)" }
      ],
      { duration: 520 + i*110, easing:"cubic-bezier(.2,.9,.2,1)", fill:"forwards", delay: 70 + i*70 }
    );
  });

  burstConfetti(1400);
}

/* =========================
   Auth
   ========================= */
export function login(username, pin){
  const users = getUsers();
  const u = users.find(x => x.username.toLowerCase() === String(username).toLowerCase());
  if(!u) return { ok:false, msg:"User not found." };
  if(String(u.pin) !== String(pin)) return { ok:false, msg:"Wrong PIN." };

  setSession({ username: u.username, role: u.role, loggedInAt: Date.now() });
  return { ok:true, user:u };
}

export function changePin(username, newPin){
  if(!/^\d{4,8}$/.test(String(newPin))){
    return { ok:false, msg:"PIN must be 4–8 digits." };
  }
  const users = getUsers();
  const idx = users.findIndex(x => x.username === username);
  if(idx === -1) return { ok:false, msg:"User missing." };
  users[idx].pin = String(newPin);
  setUsers(users);
  return { ok:true };
}

/* =========================
   Actions (simulated)
   ========================= */
export function emergencyShutdownToggle(){
  const down = isServerDown();
  setServerDown(!down);
  return !down;
}

export function shutdownAppFounderOnly(session){
  if(session?.username !== "iii_dev"){
    return { ok:false, msg:"must be logged in as iii_dev" };
  }
  // We keep "app status: WORKING" by default, but allow founder to toggle it for demo
  const down = isAppDown();
  setAppDown(!down);
  return { ok:true, newState: !down };
}

/* =========================
   Utils
   ========================= */
function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* Boot */
initState();
window.SN = {
  initState,
  getUsers, setUsers,
  getSession, setSession, clearSession,
  isServerDown, setServerDown,
  isAppDown, setAppDown,
  toast,
  ensureMaintenanceOverlay,
  requireAdmin,
  renderAdminHeader,
  welcomeAnimation,
  login,
  changePin,
  emergencyShutdownToggle,
  shutdownAppFounderOnly
};
