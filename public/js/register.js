// public/js/register.js
document.addEventListener("DOMContentLoaded", function () {
    const pswdBtn = document.querySelector("#pswdBtn");
    const pswdInput = document.getElementById("account_password");
  
    pswdBtn.addEventListener("click", function () {
      const type = pswdInput.getAttribute("type");
      if (type === "password") {
        pswdInput.setAttribute("type", "text");
        pswdBtn.textContent = "Hide Password";
      } else {
        pswdInput.setAttribute("type", "password");
        pswdBtn.textContent = "Show Password";
      }
    });
  });