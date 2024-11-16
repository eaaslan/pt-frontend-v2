import { auth } from "../utils/auth.js";
import { api } from "../utils/api.js";
import { validate } from "../utils/validation.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate inputs
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validate.email(email)) {
      showError(emailInput, "Please enter a valid email address");
      return;
    }

    if (!validate.password(password)) {
      showError(passwordInput, "Password must be at least 6 characters");
      return;
    }

    try {
      // Show loading state
      const loginButton = loginForm.querySelector("button");
      loginButton.disabled = true;
      loginButton.textContent = "Logging in...";

      // Attempt login
      const response = await api.post("/auth/login", { email, password });

      if (response.token) {
        // Store auth token
        auth.setToken(response.token);

        // Redirect to dashboard
        window.location.href = "/pages/member/dashboard.html";
      } else {
        showError(emailInput, "Invalid email or password");
      }
    } catch (error) {
      showError(emailInput, "Login failed. Please try again.");
    } finally {
      // Reset button state
      loginButton.disabled = false;
      loginButton.textContent = "LOGIN";
    }
  });
});

function showError(input, message) {
  const errorDiv =
    input.parentElement.querySelector(".error-message") ||
    document.createElement("div");

  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.color = "var(--color-error)";
  errorDiv.style.fontSize = "var(--font-size-sm)";
  errorDiv.style.marginTop = "var(--spacing-xs)";

  if (!input.parentElement.querySelector(".error-message")) {
    input.parentElement.appendChild(errorDiv);
  }

  input.style.borderColor = "var(--color-error)";

  // Clear error after 3 seconds
  setTimeout(() => {
    errorDiv.remove();
    input.style.borderColor = "";
  }, 3000);
}
