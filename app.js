const STORAGE_KEYS = {
  users: "ft_users",
  licenses: "ft_licenses",
  session: "ft_session",
};

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const resetForm = document.getElementById("reset-form");
const authMessage = document.getElementById("auth-message");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const createAccountLink = document.getElementById("create-account-link");
const backToLoginLink = document.getElementById("back-to-login");
const forgotPasswordLink = document.getElementById("forgot-password");
const resetBackLink = document.getElementById("reset-back-link");
const signinCard = document.querySelector(".signin-card");
const authShell = document.getElementById("auth-shell");
const licenseSection = document.getElementById("license-section");
const licenseForm = document.getElementById("license-form");
const licenseMessage = document.getElementById("license-message");
const welcomeMessage = document.getElementById("welcome-message");
const licenseList = document.getElementById("license-list");
const logoutButton = document.getElementById("logout-button");
const monthSelect = document.getElementById("register-birth-month");
const daySelect = document.getElementById("register-birth-day");
const yearSelect = document.getElementById("register-birth-year");
const captchaInput = document.getElementById("register-captcha");
const captchaDisplay = document.getElementById("captcha-display");
const refreshCaptchaButton = document.getElementById("refresh-captcha");
const assistiveCaptchaButton = document.getElementById("assistive-captcha");
const resetIdentifierInput = document.getElementById("reset-identifier");
const resetCaptchaInput = document.getElementById("reset-captcha-input");
const resetCaptchaDisplay = document.getElementById("reset-captcha-display");
const resetRefreshCaptchaButton = document.getElementById("reset-refresh-captcha");
const resetAssistiveCaptchaButton = document.getElementById(
  "reset-assistive-captcha"
);

let currentUser = null;
const captchaState = {
  register: "469P",
  reset: "469P",
};

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
  } catch (error) {
    console.warn("读取用户数据失败", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function readLicenses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.licenses)) || {};
  } catch (error) {
    console.warn("读取车牌数据失败", error);
    return {};
  }
}

function saveLicenses(licenses) {
  localStorage.setItem(STORAGE_KEYS.licenses, JSON.stringify(licenses));
@@ -166,112 +178,163 @@ function populateBirthSelects() {
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }

  updateBirthDayOptions(false);

  monthSelect.addEventListener("change", () => updateBirthDayOptions());
  yearSelect.addEventListener("change", () => updateBirthDayOptions());
}

function resetRegisterForm() {
  if (registerForm) {
    registerForm.reset();
  }

  if (monthSelect) {
    monthSelect.selectedIndex = 0;
  }

  if (yearSelect) {
    yearSelect.selectedIndex = 0;
  }

  updateBirthDayOptions(false);
  generateCaptcha("register");
}

function updateCaptchaDisplay(context, code) {
  if (context === "register" && captchaDisplay) {
    captchaDisplay.textContent = code;
    return;
  }

  if (context === "reset" && resetCaptchaDisplay) {
    resetCaptchaDisplay.textContent = code;
  }
}

function clearCaptchaInput(context) {
  if (context === "register" && captchaInput) {
    captchaInput.value = "";
    return;
  }

  if (context === "reset" && resetCaptchaInput) {
    resetCaptchaInput.value = "";
  }
}

function generateCaptcha(context = "register") {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 4; index += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  captchaState[context] = code;
  updateCaptchaDisplay(context, code);
  clearCaptchaInput(context);
}

function setupCaptchaControls() {
  const controls = [
    {
      refresh: refreshCaptchaButton,
      assistive: assistiveCaptchaButton,
      context: "register",
    },
    {
      refresh: resetRefreshCaptchaButton,
      assistive: resetAssistiveCaptchaButton,
      context: "reset",
    },
  ];

  controls.forEach(({ refresh, assistive, context }) => {
    if (refresh) {
      refresh.addEventListener("click", () => {
        generateCaptcha(context);
      });
    }

    if (assistive) {
      assistive.addEventListener("click", () => {
        showMessage(
          authMessage,
          "Audio support is not available in this demo interface.",
          "error"
        );
      });
    }
  });
}

function showLoginView() {
  if (signinCard) {
    signinCard.classList.remove("register-mode", "reset-mode");
  }
  formTitle.textContent = "Sign in to Parallax";
  formSubtitle.textContent = "Enter your email or phone number to continue.";
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  resetForm?.classList.remove("active");
  showMessage(authMessage, "");
}

function showRegisterView() {
  if (signinCard) {
    signinCard.classList.add("register-mode");
    signinCard.classList.remove("reset-mode");
  }
  formTitle.textContent = "";
  formSubtitle.textContent = "";
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
  resetForm?.classList.remove("active");
  generateCaptcha("register");
  showMessage(authMessage, "");
}

function showResetView() {
  if (signinCard) {
    signinCard.classList.add("reset-mode");
    signinCard.classList.remove("register-mode");
  }
  formTitle.textContent = "Reset your password";
  formSubtitle.textContent =
    "Enter your email address or phone number that you use with your account to continue.";
  loginForm.classList.remove("active");
  registerForm.classList.remove("active");
  resetForm?.classList.add("active");
  generateCaptcha("reset");
  showMessage(authMessage, "");
  resetForm?.reset();
  if (resetIdentifierInput) {
    resetIdentifierInput.focus();
  }
}

function handleRegister(event) {
  event.preventDefault();

  const country = document.getElementById("register-country")?.value;
  const firstName = document
    .getElementById("register-first-name")
    ?.value.trim();
  const lastName = document
    .getElementById("register-last-name")
    ?.value.trim();
  const month = monthSelect?.value || "";
  const day = daySelect?.value || "";
  const year = yearSelect?.value || "";
  const email = document.getElementById("register-email")?.value.trim();
  const password = document
    .getElementById("register-password")
    ?.value.trim();
  const confirmPassword = document
    .getElementById("register-confirm-password")
    ?.value.trim();
  const phoneCountry = document
    .getElementById("register-phone-country")
    ?.value;
@@ -296,101 +359,158 @@ function handleRegister(event) {
    showMessage(authMessage, "请输入有效的邮箱地址。", "error");
    return;
  }

  if (!password || password.length < 8) {
    showMessage(authMessage, "密码至少需要 8 个字符。", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage(authMessage, "两次输入的密码不一致。", "error");
    return;
  }

  const phoneDigits = (phoneRaw || "").replace(/\D/g, "");
  if (!phoneCountry || phoneDigits.length < 5) {
    showMessage(authMessage, "请输入有效的手机号和区号。", "error");
    return;
  }

  if (!captchaValue) {
    showMessage(authMessage, "请输入验证码。", "error");
    return;
  }

  if (captchaValue.toUpperCase() !== (captchaState.register || "")) {
    showMessage(authMessage, "验证码不正确，请重试。", "error");
    generateCaptcha("register");
    return;
  }

  const users = readUsers();
  const lowerEmail = (email || "").toLowerCase();
  if (users.some((user) => user.email?.toLowerCase() === lowerEmail)) {
    showMessage(authMessage, "该邮箱已注册，请直接登录。", "error");
    return;
  }

  const phoneSignature = `${(phoneCountry || "").replace(/\D/g, "")}${
    phoneDigits || ""
  }`;
  if (
    phoneDigits &&
    users.some((user) => {
      const storedDigits = String(user.phone || "").replace(/\D/g, "");
      const storedCountry = String(user.phoneCountry || "").replace(/\D/g, "");
      return storedDigits && storedCountry + storedDigits === phoneSignature;
    })
  ) {
    showMessage(authMessage, "该手机号已注册，请直接登录。", "error");
    return;
  }

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || lowerEmail;
  const newUser = {
    username: lowerEmail,
    email: lowerEmail,
    password,
    firstName,
    lastName,
    displayName,
    country,
    birthDate: { month, day, year },
    phoneCountry,
    phone: phoneDigits,
    contactMethod,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  resetRegisterForm();
  showLoginView();
  showMessage(authMessage, "注册成功！请登录以继续。", "success");
}

function handleReset(event) {
  event.preventDefault();

  const identifier = resetIdentifierInput?.value.trim();
  const captchaValue = resetCaptchaInput?.value.trim();

  if (!identifier) {
    showMessage(authMessage, "请输入用于登录的邮箱或手机号。", "error");
    return;
  }

  if (!captchaValue) {
    showMessage(authMessage, "请输入验证码。", "error");
    return;
  }

  if (captchaValue.toUpperCase() !== (captchaState.reset || "")) {
    showMessage(authMessage, "验证码不正确，请重试。", "error");
    generateCaptcha("reset");
    return;
  }

  const users = readUsers();
  const normalizedIdentifier = (identifier || "").toLowerCase();
  const digits = (identifier || "").replace(/\D/g, "");

  const match = users.some((user) => {
    const emailMatch = user.email?.toLowerCase() === normalizedIdentifier;
    const usernameMatch = user.username?.toLowerCase() === normalizedIdentifier;
    const storedDigits = String(user.phone || "").replace(/\D/g, "");
    const storedCountry = String(user.phoneCountry || "").replace(/\D/g, "");
    const combined = storedCountry + storedDigits;
    const phoneMatch =
      digits &&
      ((storedDigits && storedDigits === digits) ||
        (combined && combined === digits));
    return emailMatch || usernameMatch || phoneMatch;
  });

  resetForm?.reset();
  generateCaptcha("reset");

  if (match) {
    showMessage(
      authMessage,
      "我们已向您的联系方式发送重置密码的相关说明，请注意查收。",
      "success"
    );
  } else {
    showMessage(
      authMessage,
      "如果该信息关联 Parallax 账号，我们会发送密码重置信息。",
      "success"
    );
  }
}

function handleLogin(event) {
  event.preventDefault();
  const identifier = document.getElementById("login-username")?.value.trim();
  const password = document.getElementById("login-password")?.value.trim();
  const users = readUsers();
  const normalizedIdentifier = (identifier || "").toLowerCase();
  const phoneDigits = (identifier || "").replace(/\D/g, "");

  const user = users.find((item) => {
    if (item.password !== password) {
      return false;
    }

    const usernameMatch =
      item.username && item.username.toLowerCase() === normalizedIdentifier;
    const emailMatch =
      item.email && item.email.toLowerCase() === normalizedIdentifier;
    const storedDigits = String(item.phone || "").replace(/\D/g, "");
    const storedCountry = String(item.phoneCountry || "").replace(/\D/g, "");
    const combinedPhone = storedCountry + storedDigits;
    const phoneMatch =
      phoneDigits &&
      ((storedDigits && storedDigits === phoneDigits) ||
        (combinedPhone && combinedPhone === phoneDigits));

@@ -494,54 +614,63 @@ function refreshLicenseList() {
}

function removeLicense(licenseNumber) {
  const licenses = readLicenses();
  const userLicenses = licenses[currentUser.username] || [];
  const updated = userLicenses.filter((item) => item.licenseNumber !== licenseNumber);
  licenses[currentUser.username] = updated;
  saveLicenses(licenses);
  refreshLicenseList();
  showMessage(licenseMessage, "车牌已删除。", "success");
}

createAccountLink.addEventListener("click", (event) => {
  event.preventDefault();
  showRegisterView();
});

backToLoginLink.addEventListener("click", (event) => {
  event.preventDefault();
  showLoginView();
});

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (event) => {
    event.preventDefault();
    showResetView();
  });
}

if (resetBackLink) {
  resetBackLink.addEventListener("click", (event) => {
    event.preventDefault();
    showLoginView();
  });
}

registerForm.addEventListener("submit", handleRegister);
loginForm.addEventListener("submit", handleLogin);
resetForm?.addEventListener("submit", handleReset);
licenseForm.addEventListener("submit", handleLicenseSubmit);
logoutButton.addEventListener("click", exitLicenseMode);

document.addEventListener("DOMContentLoaded", () => {
  populateBirthSelects();
  setupCaptchaControls();
  generateCaptcha("register");
  generateCaptcha("reset");
  showLoginView();

  const username = getSession();
  if (!username) {
    return;
  }

  const users = readUsers();
  const user = users.find((item) => item.username === username);
  if (user) {
    currentUser = user;
    enterLicenseMode();
  } else {
    setSession(null);
  }
});
