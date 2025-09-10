const GOOGLE_CLIENT_ID = "REPLACE_WITH_GOOGLE_CLIENT_ID";

let adminEmail = null;
let user = null;

const batScripts = {
  gaming_boost: `@echo off\r\n:: Gaming Boost\r\npowercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c\r\nnet stop "SysMain" >nul 2>&1\r\nsc config "SysMain" start=disabled >nul 2>&1\r\nipconfig /flushdns >nul 2>&1\r\nnetsh winsock reset >nul 2>&1\r\nnetsh interface tcp set global autotuning=normal >nul 2>&1\r\nnetsh interface tcp set global congestionprovider=ctcp >nul 2>&1\r\necho DONE & pause`,
  clean_temp: `@echo off\r\n:: Clean Temp\r\ndel /q/f/s "%temp%\\*.*" >nul 2>&1\nfor /d %%p in ("%temp%\\*.*") do rd /s /q "%%p" >nul 2>&1\ndel /q/f/s "C:\\Windows\\Temp\\*.*" >nul 2>&1\nfor /d %%p in ("C:\\Windows\\Temp\\*.*") do rd /s /q "%%p" >nul 2>&1\necho DONE & pause`,
  network_reset: `@echo off\r\n:: Network Reset\r\nipconfig /flushdns >nul 2>&1\nnetsh winsock reset >nul 2>&1\nnetsh int ip reset >nul 2>&1\necho DONE & pause`,
};

function initGSI() {
  if (!window.google || !window.google.accounts) {
    document.getElementById("error").style.display = "block";
    document.getElementById("error").innerText = "تعذر تحميل خدمة Google Identity.";
    return;
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
    ux_mode: "popup",
  });
  window.google.accounts.id.renderButton(
    document.getElementById("gsi-button"),
    { theme: "outline", size: "large" }
  );
}

function handleCredentialResponse(response) {
  const base64Url = response.credential.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  const payload = JSON.parse(jsonPayload);
  user = { name: payload.name, email: payload.email, picture: payload.picture };
  if (!adminEmail) {
    adminEmail = user.email;
  }
  renderUser();
  renderCards();
}

function renderUser() {
  const infoDiv = document.getElementById("user-info");
  if (user) {
    infoDiv.style.display = "block";
    infoDiv.innerHTML = `<img src="${user.picture}" class="avatar"/> <b>${user.name}</b> (${user.email})`;
  } else {
    infoDiv.style.display = "none";
  }
}

function renderCards() {
  const cardsDiv = document.getElementById("cards");
  cardsDiv.innerHTML = "";
  Object.keys(batScripts).forEach(key => {
    const div = document.createElement("div");
    div.className = "card";
    let title = "";
    let desc = "";
    if (key === "gaming_boost") { title="Gaming Boost"; desc="تسريع للألعاب وتعطيل خدمات غير ضرورية."; }
    if (key === "clean_temp") { title="Clean Temp"; desc="تفريغ ملفات النظام المؤقتة لزيادة الأداء."; }
    if (key === "network_reset") { title="Network Reset"; desc="إعادة تهيئة إعدادات الشبكة."; }
    div.innerHTML = `<h3>${title}</h3><p>${desc}</p><button class="btn" onclick="downloadScript('${key}')">تحميل .bat</button>`;
    cardsDiv.appendChild(div);
  });
}

function downloadScript(name) {
  const content = batScripts[name];
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.bat`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

window.onload = () => {
  if (window.google) {
    initGSI();
  } else {
    setTimeout(initGSI, 1000);
  }
};