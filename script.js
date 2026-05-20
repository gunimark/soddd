const STORAGE_KEY = "contact-dashboard-people";
const BLOCKED_IMAGE_WORDS = [
  "porn",
  "nude",
  "naked",
  "sex",
  "xxx",
  "onlyfans",
  "18+",
  "โป๊",
  "อนาจาร",
  "เปลือย",
];

const form = document.querySelector("#contact-form");
const error = document.querySelector("#form-error");
const photoInput = document.querySelector("#photo");
const photoPreview = document.querySelector("#photo-preview");

let selectedPhoto = "";

function loadPeople() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePeople(people) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    return true;
  } catch {
    return false;
  }
}

function isBlockedImageName(fileName) {
  const normalizedName = fileName.toLowerCase();
  return BLOCKED_IMAGE_WORDS.some((word) => normalizedName.includes(word));
}

function clearPhoto(message) {
  selectedPhoto = "";
  photoInput.value = "";
  photoPreview.innerHTML = "<span>รูปที่เลือกจะแสดงตรงนี้</span>";
  if (message) {
    error.textContent = message;
  }
}

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        const maxSize = 900;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });
      image.addEventListener("error", () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ")));
      image.src = String(reader.result);
    });
    reader.addEventListener("error", () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ")));
    reader.readAsDataURL(file);
  });
}

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  error.textContent = "";

  if (!file) {
    clearPhoto("");
    return;
  }

  if (!file.type.startsWith("image/")) {
    clearPhoto("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    clearPhoto("รูปภาพต้องมีขนาดไม่เกิน 2MB");
    return;
  }

  if (isBlockedImageName(file.name)) {
    clearPhoto("ระบบลบรูปนี้อัตโนมัติ เพราะชื่อไฟล์เข้าข่ายไม่เหมาะสม");
    return;
  }

  try {
    selectedPhoto = await resizePhoto(file);
    photoPreview.innerHTML = `<img src="${selectedPhoto}" alt="ตัวอย่างรูปที่เลือก" />`;
  } catch {
    clearPhoto("อ่านไฟล์รูปไม่สำเร็จ กรุณาเลือกไฟล์ใหม่");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const relationshipStatus = String(formData.get("relationshipStatus") || "").trim();
  const contactPlatform = String(formData.get("contactPlatform") || "").trim();
  const contactLink = String(formData.get("contactLink") || "").trim();

  if (!name || !gender || !relationshipStatus || !contactPlatform || !contactLink || !selectedPhoto) {
    error.textContent = "กรุณากรอกข้อมูลให้ครบ รวมถึงเลือกสถานะ ช่องทาง และรูปภาพ";
    return;
  }

  if (!form.contactLink.checkValidity()) {
    error.textContent = "กรุณากรอกลิ้งช่องทางติดต่อให้ถูกต้อง เช่น https://example.com";
    return;
  }

  const person = {
    id: createId(),
    name,
    gender,
    relationshipStatus,
    contactPlatform,
    contactLink,
    photo: selectedPhoto,
  };
  const people = loadPeople();

  people.unshift(person);
  if (!savePeople(people)) {
    error.textContent = "พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม กรุณาแจ้งผู้ดูแลให้ลบข้อมูลบางรายการก่อน";
    return;
  }

  error.textContent = "";
  window.location.href = "dashboard.html";
});
