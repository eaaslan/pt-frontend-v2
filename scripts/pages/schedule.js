// import { auth } from "../utils/auth.js";
// import { api } from "../utils/api.js";

// class SchedulePage {
//   constructor() {
//     this.currentDate = new Date();
//     this.timeSlots = [6, 8, 10, 12, 14, 16, 18, 20]; // Available time slots
//     this.appointments = [];

//     // DOM Elements
//     this.timeSlotsContainer = document.getElementById("timeSlots");
//     this.currentDateElement = document.getElementById("currentDate");
//     this.modal = document.getElementById("appointmentModal");
//     this.modalBody = document.getElementById("modalBody");

//     this.init();
//   }

//   async init() {
//     try {
//       // Check authentication
//       if (!auth.isAuthenticated()) {
//         window.location.href = "/pages/auth/login.html";
//         return;
//       }

//       // Add event listeners
//       document
//         .getElementById("prevDate")
//         .addEventListener("click", () => this.changeDate(-1));
//       document
//         .getElementById("nextDate")
//         .addEventListener("click", () => this.changeDate(1));
//       document
//         .getElementById("closeModal")
//         .addEventListener("click", () => this.closeModal());

//       // Initial load
//       await this.loadAppointments();
//       this.render();
//     } catch (error) {
//       console.error("Initialization error:", error);
//     }
//   }

//   async loadAppointments() {
//     try {
//       const dateStr = this.formatDate(this.currentDate);
//       const response = await api.get(`/appointments/${dateStr}`);
//       this.appointments = response.appointments || [];
//     } catch (error) {
//       console.error("Error loading appointments:", error);
//       this.appointments = [];
//     }
//   }

//   async render() {
//     // Update date display
//     this.currentDateElement.textContent = this.formatDateForDisplay(
//       this.currentDate
//     );

//     // Clear existing time slots
//     this.timeSlotsContainer.innerHTML = "";

//     // Create time slots
//     this.timeSlots.forEach((hour) => {
//       const appointment = this.appointments.find((app) => app.time === hour);
//       const timeSlot = this.createTimeSlotElement(hour, appointment);
//       this.timeSlotsContainer.appendChild(timeSlot);
//     });
//   }

//   createTimeSlotElement(hour, appointment) {
//     const div = document.createElement("div");
//     div.className = `time-slot ${appointment ? "booked" : "available"}`;

//     const timeStr = this.formatTime(hour);

//     div.innerHTML = `
//             <span class="time">${timeStr}</span>
//             <span class="status">${appointment ? "Booked" : "Available"}</span>
//         `;

//     if (appointment) {
//       div.addEventListener("click", () =>
//         this.showAppointmentDetails(appointment)
//       );
//     }

//     return div;
//   }

//   showAppointmentDetails(appointment) {
//     this.modalBody.innerHTML = `
//             <div class="appointment-details">
//                 <p><strong>Time:</strong> ${this.formatTime(
//                   appointment.time
//                 )}</p>
//                 <p><strong>Type:</strong> ${appointment.type}</p>
//                 <p><strong>Trainer:</strong> ${appointment.trainer}</p>
//                 ${
//                   appointment.notes
//                     ? `<p><strong>Notes:</strong> ${appointment.notes}</p>`
//                     : ""
//                 }
//             </div>
//         `;

//     this.modal.classList.add("active");
//   }

//   closeModal() {
//     this.modal.classList.remove("active");
//   }

//   async changeDate(offset) {
//     this.currentDate.setDate(this.currentDate.getDate() + offset);
//     await this.loadAppointments();
//     this.render();
//   }

//   formatDate(date) {
//     return date.toISOString().split("T")[0];
//   }

//   formatDateForDisplay(date) {
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//     });
//   }

//   formatTime(hour) {
//     const period = hour >= 12 ? "PM" : "AM";
//     const displayHour = hour > 12 ? hour - 12 : hour;
//     return `${displayHour}:00 ${period}`;
//   }
// }

// // Initialize schedule page when document loads
// document.addEventListener("DOMContentLoaded", () => {
//   const schedulePage = new SchedulePage();
// });
import { auth } from "../utils/auth.js";
import { ScheduleDataService } from "../utils/scheduleData.js";

class SchedulePage {
  constructor() {
    // Initialize data service
    this.dataService = new ScheduleDataService();

    // Available time slots (9AM to 4PM)
    this.timeSlots = Array.from({ length: 8 }, (_, i) => i + 9);

    // State
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
      // Check authentication
      if (!auth.isAuthenticated()) {
        window.location.href = "/pages/auth/login.html";
        return;
      }

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

      // Initial load
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
    // Update date display
    this.currentDateElement.textContent = this.formatDateForDisplay(
      this.currentDate
    );

    // Clear existing time slots
    this.timeSlotsContainer.innerHTML = "";

    // Create time slots
    this.timeSlots.forEach((hour) => {
      const appointment = this.findAppointmentForHour(hour);
      const timeSlot = this.createTimeSlotElement(hour, appointment);
      this.timeSlotsContainer.appendChild(timeSlot);
    });
  }

  findAppointmentForHour(hour) {
    return this.appointments.find((apt) => {
      const aptHour = new Date(apt.appointmentTime).getHours();
      return aptHour === hour;
    });
  }

  createTimeSlotElement(hour, appointment) {
    const div = document.createElement("div");
    div.className = `time-slot ${appointment ? "booked" : "available"}`;

    div.innerHTML = `
            <span class="time">${this.formatTime(hour)}</span>
            ${
              appointment
                ? `
                <div class="appointment-info">
                    <span class="member-name">${appointment.memberName}</span>
                    <span class="trainer-name">${appointment.ptName}</span>
                </div>
            `
                : '<span class="status">Available</span>'
            }
        `;

    if (appointment) {
      div.addEventListener("click", () =>
        this.showAppointmentDetails(appointment)
      );
    }

    return div;
  }

  showAppointmentDetails(appointment) {
    const appointmentTime = new Date(appointment.appointmentTime);

    this.modalBody.innerHTML = `
            <div class="appointment-details">
                <p><strong>Time:</strong> ${this.formatTime(
                  appointmentTime.getHours()
                )}</p>
                <p><strong>Member:</strong> ${appointment.memberName}</p>
                <p><strong>Trainer:</strong> ${appointment.ptName}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
                <p><strong>Appointment ID:</strong> ${appointment.id}</p>
                ${
                  appointment.checkInTime
                    ? `<p><strong>Checked In:</strong> ${new Date(
                        appointment.checkInTime
                      ).toLocaleTimeString()}</p>`
                    : ""
                }
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

  showError(message) {
    // Implement error display logic
    console.error(message);
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

// Initialize schedule page when document loads
document.addEventListener("DOMContentLoaded", () => {
  const schedulePage = new SchedulePage();
});
