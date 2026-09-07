const moduleID = Number(location.pathname.match(/^\/modules\/(\d+)\//)?.[1]);
const state = { monitors: [], selectedId: null, running: new Set() };
const elements = {
  form: document.querySelector("#monitor-form"), name: document.querySelector("#monitor-name"), url: document.querySelector("#monitor-url"), interval: document.querySelector("#monitor-interval"), list: document.querySelector("#monitor-list"), count: document.querySelector("#monitor-count"), empty: document.querySelector("#empty-state"), dashboard: document.querySelector("#dashboard"), selectedName: document.querySelector("#selected-name"), selectedURL: document.querySelector("#selected-url"), check: document.querySelector("#check-now"), remove: document.querySelector("#delete-monitor"), status: document.querySelector("#metric-status"), statusDetail: document.querySelector("#metric-status-detail"), latency: document.querySelector("#metric-latency"), availability: document.querySelector("#metric-availability"), history: document.querySelector("#history-list"), clear: document.querySelector("#clear-history"), chart: document.querySelector("#latency-chart"), indicator: document.querySelector("#run-indicator"), runState: document.querySelector("#run-state")
};

async function request(path, options) {
  const response = await fetch(path, { cache: "no-store", ...options });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Hub-Fehler ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function apiURL(path, parameters = {}) {
  return `${path}?${new URLSearchParams({ module_id: moduleID, ...parameters })}`;
}

function toResult(result) {
  return { at: result.checked_at, ok: result.ok, latency: result.latency_ms, message: result.message };
}

async function loadMonitors() {
  if (!Number.isInteger(moduleID) || moduleID <= 0) {
    elements.runState.textContent = "NetzWache muss als Hub-Modul geöffnet werden.";
    elements.indicator.className = "indicator error";
    return;
  }
  try {
    const targets = await request(apiURL("/api/http-monitors"));
    state.monitors = await Promise.all(targets.map(async (target) => ({
      ...target,
      history: (await request(apiURL("/api/http-monitor-results", { target_id: target.id }))).map(toResult),
      lastCheck: target.last_checked_at ? new Date(target.last_checked_at).getTime() : 0
    })));
    if (!selectedMonitor()) state.selectedId = state.monitors[0]?.id || null;
    render();
  } catch (error) {
    elements.runState.textContent = error.message;
    elements.indicator.className = "indicator error";
  }
}
function selectedMonitor() { return state.monitors.find((monitor) => monitor.id === state.selectedId); }
function lastResult(monitor) { return monitor?.history.at(-1); }
function formatTime(value) { return new Date(value).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "medium" }); }

function render() {
  elements.count.textContent = state.monitors.length;
  elements.list.innerHTML = state.monitors.map((monitor) => {
    const latest = lastResult(monitor); const resultClass = latest ? (latest.ok ? "ok" : "error") : "pending";
    return `<button class="monitor-item ${monitor.id === state.selectedId ? "active" : ""}" data-monitor-id="${monitor.id}" type="button"><i class="state-dot ${resultClass}"></i><span><strong>${escapeHTML(monitor.name)}</strong><small>${latest ? `${latest.ok ? "Erreichbar" : latest.message} · ${formatTime(latest.at)}` : "Noch nicht geprüft"}</small></span></button>`;
  }).join("");
  const monitor = selectedMonitor(); elements.empty.classList.toggle("hidden", Boolean(monitor)); elements.dashboard.classList.toggle("hidden", !monitor);
  if (!monitor) { updateRunState(); return; }
  const latest = lastResult(monitor); const recent = monitor.history.slice(-30); const successful = recent.filter((result) => result.ok);
  elements.selectedName.textContent = monitor.name; elements.selectedURL.textContent = monitor.url;
  elements.status.textContent = latest ? (latest.ok ? "ERREICHBAR" : "FEHLER") : "–"; elements.status.style.color = latest ? (latest.ok ? "var(--mint)" : "var(--red)") : ""; elements.statusDetail.textContent = latest ? `${latest.message} · ${formatTime(latest.at)}` : "Noch keine Prüfung";
  elements.latency.textContent = latest?.ok ? `${latest.latency} ms` : "–"; elements.availability.textContent = recent.length ? `${Math.round(successful.length / recent.length * 100)} %` : "–";
  elements.history.innerHTML = monitor.history.slice(-20).reverse().map((result) => `<div class="history-row"><i class="state-dot ${result.ok ? "ok" : "error"}"></i><strong class="status-code ${result.ok ? "ok" : "error"}">${result.message}</strong><span>${result.ok ? `${result.latency} ms` : "–"}</span><time>${formatTime(result.at)}</time></div>`).join("") || "<p class=\"browser-note\">Noch keine Messwerte vorhanden.</p>";
  drawChart(monitor.history.slice(-30)); updateRunState();
}

async function checkMonitor(monitor) {
  if (state.running.has(monitor.id)) return;
  state.running.add(monitor.id); updateRunState();
  try {
    const result = await request(apiURL(`/api/http-monitors/${monitor.id}/check`), { method: "POST" });
    monitor.history = [...monitor.history, toResult(result)].slice(-200);
    monitor.lastCheck = new Date(result.checked_at).getTime();
  } catch (error) {
    monitor.history = [...monitor.history, { at: Date.now(), ok: false, latency: null, message: error.message }].slice(-200);
  }
  state.running.delete(monitor.id); render();
}

function drawChart(history) {
  const canvas = elements.chart; const context = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio); context.setTransform(ratio, 0, 0, ratio, 0, 0); context.clearRect(0, 0, rect.width, rect.height);
  const width = rect.width; const height = rect.height; const pad = { top: 24, right: 22, bottom: 30, left: 54 }; const plotWidth = width - pad.left - pad.right; const plotHeight = height - pad.top - pad.bottom;
  context.font = "12px Cascadia Mono, Consolas, monospace"; context.lineWidth = 1; context.strokeStyle = "rgba(164,183,172,.18)"; context.fillStyle = "#a4b7ac";
  for (let index = 0; index <= 4; index += 1) { const y = pad.top + plotHeight * index / 4; context.beginPath(); context.moveTo(pad.left, y); context.lineTo(width - pad.right, y); context.stroke(); }
  const successful = history.filter((result) => result.ok); if (!successful.length) { context.textAlign = "center"; context.fillText("Noch keine erfolgreichen Messwerte", width / 2, height / 2); return; }
  const values = successful.map((result) => result.latency); const lower = Math.max(0, Math.min(...values) - 10); const upper = Math.max(...values) + Math.max(15, (Math.max(...values) - lower) * .14); const point = (result, index) => ({ x: pad.left + (history.length === 1 ? plotWidth / 2 : index * plotWidth / Math.max(1, history.length - 1)), y: pad.top + (upper - result.latency) * plotHeight / (upper - lower) });
  context.textAlign = "right"; for (let index = 0; index <= 4; index += 1) { const value = upper - (upper - lower) * index / 4; context.fillText(`${Math.round(value)} ms`, pad.left - 8, pad.top + plotHeight * index / 4 + 4); }
  context.strokeStyle = "#52d6c1"; context.lineWidth = 2.5; context.beginPath(); let drawing = false; history.forEach((result, index) => { if (!result.ok) { drawing = false; return; } const pointValue = point(result, index); if (drawing) context.lineTo(pointValue.x, pointValue.y); else { context.moveTo(pointValue.x, pointValue.y); drawing = true; } }); context.stroke();
  history.forEach((result, index) => { const x = pad.left + (history.length === 1 ? plotWidth / 2 : index * plotWidth / Math.max(1, history.length - 1)); if (!result.ok) { context.fillStyle = "#ff8178"; context.fillRect(x - 3, height - pad.bottom - 3, 6, 6); return; } const pointValue = point(result, index); context.fillStyle = "#52d6c1"; context.beginPath(); context.arc(pointValue.x, pointValue.y, 3, 0, Math.PI * 2); context.fill(); });
}

function updateRunState() { const running = state.running.size; elements.indicator.className = `indicator ${running ? "running" : state.monitors.length ? "idle" : "idle"}`; elements.runState.textContent = running ? `Prüfe ${running} Ziel${running === 1 ? "" : "e"}` : state.monitors.length ? "Hintergrundüberwachung aktiv" : "Bereit"; }
function escapeHTML(value) { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const url = new URL(elements.url.value.trim());
    if (!/^https?:$/.test(url.protocol)) throw new Error("Nur HTTP(S)-Adressen sind erlaubt.");
    const monitor = await request("/api/http-monitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module_id: moduleID, name: elements.name.value.trim(), url: url.href, interval_seconds: Number(elements.interval.value) }) });
    monitor.history = [];
    state.monitors.push(monitor); state.selectedId = monitor.id;
    elements.form.reset(); elements.interval.value = "300"; render(); checkMonitor(monitor);
  } catch (error) { elements.runState.textContent = error.message; elements.indicator.className = "indicator error"; }
});
elements.list.addEventListener("click", (event) => { const button = event.target.closest("[data-monitor-id]"); if (!button) return; state.selectedId = Number(button.dataset.monitorId); render(); });
elements.check.addEventListener("click", () => { const monitor = selectedMonitor(); if (monitor) checkMonitor(monitor); });
elements.remove.addEventListener("click", async () => { const monitor = selectedMonitor(); if (!monitor || !confirm(`„${monitor.name}“ wirklich löschen?`)) return; try { await request(apiURL(`/api/http-monitors/${monitor.id}`), { method: "DELETE" }); state.monitors = state.monitors.filter((item) => item.id !== monitor.id); state.selectedId = state.monitors[0]?.id || null; render(); } catch (error) { elements.runState.textContent = error.message; } });
elements.clear.addEventListener("click", () => { elements.runState.textContent = "Messwerte werden vom Hub verwaltet und automatisch begrenzt."; });
window.addEventListener("resize", () => { const monitor = selectedMonitor(); if (monitor) drawChart(monitor.history.slice(-30)); });
setInterval(loadMonitors, 30_000);
loadMonitors();