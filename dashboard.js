const STORAGE_KEY = "contact-dashboard-people";

const dashboardList = document.querySelector("#dashboard-list");

let people = loadPeople();

function loadPeople() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
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

function getContactLabel(contactLink) {
  try {
    const url = new URL(contactLink);
    const pathName = url.pathname.replace(/^\/|\/$/g, "");
    return pathName || url.hostname.replace(/^www\./, "");
  } catch {
    return contactLink;
  }
}

function renderDashboard() {
  if (people.length === 0) {
    dashboardList.innerHTML = '<p class="empty-state">ยังไม่มีข้อมูลใน Dashboard</p>';
    return;
  }

  dashboardList.innerHTML = people
    .map((person) => {
      const safeName = escapeHtml(person.name);
      const safeGender = escapeHtml(person.gender);
      const safeStatus = escapeHtml(person.relationshipStatus || "โสด");
      const safePlatform = escapeHtml(person.contactPlatform || "IG");
      const safeContact = escapeHtml(getContactLabel(person.contactLink));
      const safeHref = escapeHtml(person.contactLink);

      return `
        <article class="person-card">
          <img src="${person.photo}" alt="รูปของ ${safeName}" />
          <div class="person-info">
            <h3>ชื่อ:${safeName}</h3>
            <p>เพศ:${safeGender}</p>
            <p>สถานะ:${safeStatus}</p>
            <div class="card-actions">
              <a class="ig-link" href="${safeHref}" target="_blank" rel="noopener noreferrer">${safePlatform} : ${safeContact}</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

document.body.classList.add("is-dashboard");
renderDashboard();
