document.addEventListener("DOMContentLoaded", function () {
  const pswdBtn = document.querySelector("#pswdBtn");
  const pswdInputs = document.querySelectorAll(".toggle-password");

  // Toggle visibility for both password fields
  pswdBtn?.addEventListener("click", function () {
    pswdInputs.forEach((input) => {
      const type = input.getAttribute("type");
      input.setAttribute("type", type === "password" ? "text" : "password");
    });

    // Toggle button label
    pswdBtn.textContent =
      pswdBtn.textContent === "Show Passwords" ? "Hide Passwords" : "Show Passwords";
  });

  // Confirm passwords match before form submission
  const passwordForm = document.querySelector("#changePassword");
  if (passwordForm) {
    passwordForm.addEventListener("submit", function (e) {
      const pw1 = document.querySelector("#account_password").value;
      const pw2 = document.querySelector("#confirm_password").value;

      if (pw1 !== pw2) {
        e.preventDefault();
        alert("Passwords do not match.");
      }
    });
  }
});
