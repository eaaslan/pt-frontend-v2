import { auth } from "../utils/auth.js";
import { api } from "../utils/api.js";

class QRScanner {
  constructor() {
    this.video = document.getElementById("video");
    this.scanStatus = document.getElementById("scanStatus");
    this.historyList = document.getElementById("historyList");
    this.manualCheckInBtn = document.getElementById("manualCheckIn");

    this.isScanning = false;
    this.stream = null;

    this.init();
  }

  async init() {
    try {
      // Check if user is authenticated
      if (!auth.isAuthenticated()) {
        window.location.href = "/pages/auth/login.html";
        return;
      }

      // Initialize camera
      await this.startCamera();

      // Add event listeners
      this.manualCheckInBtn.addEventListener("click", () =>
        this.showManualCheckIn()
      );

      // Load check-in history
      await this.loadHistory();

      // Start QR scanning
      this.startScanning();
    } catch (error) {
      console.error("Initialization error:", error);
      this.updateStatus("Error initializing camera", "error");
    }
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      this.video.srcObject = this.stream;
      await this.video.play();
    } catch (error) {
      throw new Error("Camera access denied");
    }
  }

  startScanning() {
    this.isScanning = true;

    // In a real implementation, you would use a QR library like jsQR
    // This is a simplified example
    this.scanInterval = setInterval(async () => {
      if (this.isScanning) {
        try {
          // Simulate QR code scanning
          const qrCode = await this.processVideoFrame();
          if (qrCode) {
            await this.handleSuccessfulScan(qrCode);
          }
        } catch (error) {
          console.error("Scanning error:", error);
        }
      }
    }, 500);
  }

  async processVideoFrame() {
    // This is where you would implement actual QR code detection
    // Using a library like jsQR
    // For demo purposes, we'll simulate a successful scan occasionally
    if (Math.random() < 0.01) {
      // 1% chance of "detecting" a QR code
      return "GYM_LOCATION_001";
    }
    return null;
  }

  async handleSuccessfulScan(qrCode) {
    this.isScanning = false;
    clearInterval(this.scanInterval);

    try {
      this.updateStatus("Processing check-in...", "processing");

      const response = await api.post("/check-in", { qrCode });

      if (response.success) {
        this.updateStatus("Successfully checked in!", "success");
        await this.loadHistory(); // Refresh history

        // Show success animation
        this.showSuccessAnimation();

        // Resume scanning after 3 seconds
        setTimeout(() => {
          this.isScanning = true;
          this.startScanning();
          this.updateStatus("Scan QR code to check in", "ready");
        }, 3000);
      }
    } catch (error) {
      this.updateStatus("Check-in failed. Please try again.", "error");
      setTimeout(() => {
        this.isScanning = true;
        this.startScanning();
      }, 2000);
    }
  }

  updateStatus(message, status = "ready") {
    this.scanStatus.textContent = message;
    this.scanStatus.className = `scan-status status-${status}`;
  }

  async loadHistory() {
    try {
      const history = await api.get("/check-in/history");
      this.historyList.innerHTML = history
        .map((item) => this.createHistoryItem(item))
        .join("");
    } catch (error) {
      console.error("Error loading history:", error);
    }
  }

  createHistoryItem(item) {
    const date = new Date(item.timestamp);
    return `
            <div class="history-item">
                <div class="check-info">
                    <div class="check-time">${date.toLocaleTimeString()}</div>
                    <div class="check-date">${date.toLocaleDateString()}</div>
                </div>
                <div class="check-location">${item.location}</div>
            </div>
        `;
  }

  showManualCheckIn() {
    const code = prompt("Enter check-in code:");
    if (code) {
      this.handleSuccessfulScan(code);
    }
  }

  showSuccessAnimation() {
    // Add success animation to scan area
    const scanArea = document.querySelector(".scan-area");
    scanArea.classList.add("success");
    setTimeout(() => {
      scanArea.classList.remove("success");
    }, 2000);
  }

  stop() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }
}

// Initialize scanner when page loads
document.addEventListener("DOMContentLoaded", () => {
  const scanner = new QRScanner();

  // Clean up when page is unloaded
  window.addEventListener("beforeunload", () => {
    scanner.stop();
  });
});
