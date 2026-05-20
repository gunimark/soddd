const STORAGE_KEY = "contact-dashboard-people";
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "1234";
const SESSION_KEY = "contact-admin-session";

const loginPanel = document.querySelector("#admin-login-panel");
const adminPanel = document.querySelector("#admin-panel");
const loginForm = document.querySelector("#admin-login-form");
const loginError = document.querySelector("#admin-login-error");
const logoutButton = document.querySelector("#admin-logout-button");
const adminList = document.querySelector("#admin-list");

let people = loadPeople();

function loadPeople() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePeople() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function showLogin() {
  loginPanel.hidden = false;
  adminPanel.hidden = true;
  sessionStorage.removeItem(SESSION_KEY);
}

function showAdminPanel() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  people = loadPeople();
  renderAdminList();
}

function renderAdminList() {
  if (people.length === 0) {
    adminList.innerHTML = '<p class="empty-state">ยังไม่มีข้อมูลให้ลบ</p>';
    return;
  }

  adminList.innerHTML = people
    .map((person) => {
      const safeName = escapeHtml(person.name);
      const safeGender = escapeHtml(person.gender);
      const safeStatus = escapeHtml(person.relationshipStatus || "โสด");
      const safePlatform = escapeHtml(person.contactPlatform || "IG");
      const safeContact = escapeHtml(person.contactLink);

      return `
        <article class="admin-card">
          <img src="${person.photo}" alt="รูปของ ${safeName}" />
          <div class="admin-card-info">
            <h2>${safeName}</h2>
            <p>เพศ: ${safeGender}</p>
            <p>สถานะ: ${safeStatus}</p>
            <p>${safePlatform}: ${safeContact}</p>
          </div>
          <button class="delete-button" type="button" data-id="${person.id}">ลบรายการนี้</button>
        </article>
      `;
    })
    .join("");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = String(formData.get("adminUser") || "").trim();
  const password = String(formData.get("adminPassword") || "").trim();

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    loginError.textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    return;
  }

  loginError.textContent = "";
  sessionStorage.setItem(SESSION_KEY, "true");
  loginForm.reset();
  showAdminPanel();
});

logoutButton.addEventListener("click", showLogin);

adminList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");
  if (!deleteButton || !isLoggedIn()) {
    return;
  }

  people = people.filter((person) => person.id !== deleteButton.dataset.id);
  savePeople();
  renderAdminList();
});

if (isLoggedIn()) {
  showAdminPanel();
} else {
  showLogin();
}
