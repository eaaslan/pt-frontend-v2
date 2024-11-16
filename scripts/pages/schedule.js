//import { auth } from "../utils/auth.js";
import { ScheduleDataService } from "../utils/scheduleData.js";

class SchedulePage {
  constructor() {
    this.dataService = new ScheduleDataService();

    // Available time slots (9AM to 5PM)
    this.timeSlots = Array.from({ length: 9 }, (_, i) => i + 9);

    this.currentDate = new Date();
    this.appointments = [];
    this.isLoading = false;

    // DOM Elements
    this.timeSlotsContainer = document.getElementById("timeSlots");
    this.currentDateElement = document.getElementById("currentDate");
    this.modal = document.getElementById("appointmentModal");
    this.modalBody = document.getElementById("modalBody");

    this.init();
  }

  async init() {
    try {
      // if (!auth.isAuthenticated()) {
      //   window.location.href = "/pages/auth/login.html";
      //   return;
      // }

      // Add event listeners
      document
        .getElementById("prevDate")
        .addEventListener("click", () => this.changeDate(-1));
      document
        .getElementById("nextDate")
        .addEventListener("click", () => this.changeDate(1));
      document
        .getElementById("closeModal")
        .addEventListener("click", () => this.closeModal());

      await this.loadAppointments();
      this.render();
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError("Failed to initialize schedule");
    }
  }

  async loadAppointments() {
    try {
      this.setLoading(true);
      const response = await this.dataService.getAppointments(this.currentDate);

      if (response.success) {
        this.appointments = response.appointments;
      } else {
        throw new Error(response.error || "Failed to load appointments");
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      this.showError("Failed to load appointments");
      this.appointments = [];
    } finally {
      this.setLoading(false);
    }
  }

  render() {
    this.currentDateElement.textContent = this.formatDateForDisplay(
      this.currentDate
    );
    this.timeSlotsContainer.innerHTML = "";

    this.timeSlots.forEach((hour) => {
      const appointment = this.appointments.find((apt) => apt.time === hour);
      const timeSlot = this.createTimeSlotElement(hour, appointment);
      this.timeSlotsContainer.appendChild(timeSlot);
    });
  }

  createTimeSlotElement(hour, appointment) {
    const div = document.createElement("div");

    let status = "available";
    if (appointment) {
      status = appointment.isOwnAppointment
        ? "your-appointment"
        : "unavailable";
    }

    div.className = `time-slot ${status}`;

    div.innerHTML = `
            <span class="time">${this.formatTime(hour)}</span>
            <span class="status">
                ${this.getStatusText(status)}
            </span>
        `;

    if (appointment?.isOwnAppointment) {
      div.addEventListener("click", () =>
        this.showAppointmentDetails(appointment)
      );
    }

    return div;
  }

  getStatusText(status) {
    switch (status) {
      case "your-appointment":
        return "Your Appointment";
      case "unavailable":
        return "Unavailable";
      default:
        return "Available";
    }
  }

  showAppointmentDetails(appointment) {
    this.modalBody.innerHTML = `
            <div class="appointment-details">
                <p><strong>Time:</strong> ${this.formatTime(
                  appointment.time
                )}</p>
                <p><strong>Trainer:</strong> ${appointment.ptName}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
            </div>
        `;

    this.modal.classList.add("active");
  }

  closeModal() {
    this.modal.classList.remove("active");
  }

  async changeDate(offset) {
    this.currentDate.setDate(this.currentDate.getDate() + offset);
    await this.loadAppointments();
    this.render();
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    const loadingClass = "is-loading";

    if (isLoading) {
      this.timeSlotsContainer.classList.add(loadingClass);
    } else {
      this.timeSlotsContainer.classList.remove(loadingClass);
    }
  }

  formatDateForDisplay(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatTime(hour) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const schedulePage = new SchedulePage();
});
