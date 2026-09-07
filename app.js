const storageKey = "career-command-center-roles";
const goalKey = "career-command-center-weekly-goal";
const list = document.querySelector("#role-list");
const empty = document.querySelector("#empty-state");
const dialog = document.querySelector("#role-dialog");
const form = document.querySelector("#role-form");
const toast = document.querySelector("#toast");
let activeFilter = "all";
let roles = loadRoles();

function save() { localStorage.setItem(storageKey, JSON.stringify(roles)); }
function loadRoles() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch { return []; }
}
function announce(message) {
  toast.textContent = message;
  window.setTimeout(() => { if (toast.textContent === message) toast.textContent = ""; }, 2800);
}
function render() {
  const visible = roles.filter(role => activeFilter === "all" || role.stage === activeFilter);
  list.innerHTML = visible.map(role => `<article class="role"><div><h3>${escapeHtml(role.title)} <span aria-hidden="true">·</span> ${escapeHtml(role.company)}</h3><p>${escapeHtml(role.note || "No note yet")}</p></div><div class="role-meta"><span class="pill ${role.stage}">${role.stage}</span>${role.followup ? `<span class="date" title="Follow-up ${formatDate(role.followup)}">${formatDate(role.followup)}</span>` : ""}<button class="delete" aria-label="Remove ${escapeHtml(role.title)}" data-delete="${role.id}">×</button></div></article>`).join("");
  empty.hidden = roles.length > 0 && visible.length > 0;
  empty.querySelector("h3").textContent = roles.length ? "Nothing in this view" : "Your pipeline starts here";
  empty.querySelector("p").textContent = roles.length ? "Try a different stage, or add a new opportunity." : "Add the roles you care about, then keep every next step visible.";
  empty.querySelector("button").textContent = roles.length ? "Add another role" : "Add your first role";
  document.querySelector("#role-count").textContent = roles.length;
  document.querySelector("#followup-count").textContent = roles.filter(role => role.followup && new Date(`${role.followup}T23:59:59`) >= new Date()).length;
  document.querySelector("#interview-count").textContent = roles.filter(role => role.stage === "interview").length;
}
function escapeHtml(text) { const node = document.createElement("span"); node.textContent = text; return node.innerHTML; }
function formatDate(date) { return new Intl.DateTimeFormat(undefined, { month:"short", day:"numeric" }).format(new Date(`${date}T12:00:00`)); }
function openDialog() { form.reset(); dialog.showModal(); form.elements.company.focus(); }
function closeDialog() { form.reset(); dialog.close(); }
document.querySelectorAll("#add-role, .add-role-copy").forEach(button => button.addEventListener("click", openDialog));
form.addEventListener("submit", event => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); roles.unshift({ ...data, id: crypto.randomUUID() }); save(); render(); closeDialog(); announce("Opportunity saved."); });
document.querySelectorAll("#cancel-role, .close-dialog").forEach(button => button.addEventListener("click", closeDialog));
list.addEventListener("click", event => { const id = event.target.dataset.delete; if (!id) return; const removed = roles.find(role => role.id === id); roles = roles.filter(role => role.id !== id); save(); render(); announce(`${removed?.title || "Opportunity"} removed.`); });
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { activeFilter = button.dataset.filter; document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button)); render(); }));
const weeklyGoal = document.querySelector("#weekly-goal"); weeklyGoal.value = localStorage.getItem(goalKey) || ""; weeklyGoal.addEventListener("input", () => localStorage.setItem(goalKey, weeklyGoal.value));
render();
