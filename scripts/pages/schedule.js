import { ScheduleDataService } from "../utils/scheduleData.js";

class SchedulePage {
  constructor() {
    this.dataService = new ScheduleDataService();
    this.daysToShow = 5;
    this.timeSlots = Array.from({ length: 13 }, (_, i) => i + 9); // 9:00 to 21:00

    this.startDate = new Date();
    this.appointments = {};

    // DOM Elements
    this.slotsGrid = document.querySelector(".slots-grid");
    this.timeColumn = document.querySelector(".time-column");
    this.currentDateRange = document.querySelector(".date-range");
    this.modal = document.querySelector(".modal");
    this.pageTitle = document.querySelector(".schedule-header h1");

    this.init();
  }

  async init() {
    try {
      if (this.pageTitle) {
        this.pageTitle.textContent = "Program";
      }

      document
        .querySelector("#prevDays")
        ?.addEventListener("click", () => this.changeDays(-this.daysToShow));
      document
        .querySelector("#nextDays")
        ?.addEventListener("click", () => this.changeDays(this.daysToShow));
      document
        .querySelector("#closeModal")
        ?.addEventListener("click", () => this.closeModal());

      this.renderTimeColumn();
      await this.loadAppointments();
      this.render();
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  renderTimeColumn() {
    if (!this.timeColumn) return;

    this.timeColumn.innerHTML = this.timeSlots
      .map(
        (hour) => `
          <div class="time-slot">
            <span>${this.formatTime(hour)}</span>
          </div>
        `
      )
      .join("");
  }

  getDatesRange() {
    return Array.from({ length: this.daysToShow }, (_, i) => {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  }

  async loadAppointments() {
    try {
      const dates = this.getDatesRange();
      const promises = dates.map((date) =>
        this.dataService.getAppointments(date)
      );

      const results = await Promise.all(promises);

      this.appointments = {};
      results.forEach((result, index) => {
        if (result.success) {
          const dateStr = this.formatDate(dates[index]);
          this.appointments[dateStr] = result.appointments;
        }
      });
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  }

  render() {
    this.renderGrid();
    this.updateDateRange();
  }

  renderGrid() {
    if (!this.slotsGrid) return;

    const dates = this.getDatesRange();

    // Render day headers
    const headers = dates
      .map(
        (date) => `
            <div class="day-header">
                ${date.toLocaleDateString("tr-TR", {
                  weekday: "short",
                })} ${date.getDate()}
            </div>
        `
      )
      .join("");

    // Render time slots
    const timeSlots = this.timeSlots
      .map((hour) => {
        const rowSlots = dates
          .map((date) => {
            const dateStr = this.formatDate(date);
            const dayAppointments = this.appointments[dateStr] || [];
            const appointment = dayAppointments.find(
              (apt) => apt.time === hour
            );
            return this.createSlot(hour, appointment);
          })
          .join("");

        return `<div class="slot-row">${rowSlots}</div>`;
      })
      .join("");

    this.slotsGrid.innerHTML = headers + timeSlots;

    // Add click handlers
    this.slotsGrid.querySelectorAll(".appointment-slot").forEach((slot) => {
      slot.addEventListener("click", (e) => {
        const appointmentData = e.currentTarget.dataset.appointment;
        if (appointmentData) {
          this.showAppointmentDetails(JSON.parse(appointmentData));
        }
      });
    });
  }

  createSlot(hour, appointment) {
    let status = "available";
    if (appointment) {
      status = appointment.isOwnAppointment
        ? "your-appointment"
        : "unavailable";
    }

    return `
            <div class="appointment-slot ${status}"
                 ${
                   appointment?.isOwnAppointment
                     ? `data-appointment='${JSON.stringify(appointment)}'`
                     : ""
                 }>
            </div>
        `;
  }

  updateDateRange() {
    if (!this.currentDateRange) return;

    const dates = this.getDatesRange();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    this.currentDateRange.textContent = `${startDate.toLocaleDateString(
      "tr-TR",
      {
        day: "numeric",
        month: "short",
      }
    )} - ${endDate.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    })}`;
  }

  async changeDays(offset) {
    this.startDate.setDate(this.startDate.getDate() + offset);
    await this.loadAppointments();
    this.render();
  }

  showAppointmentDetails(appointment) {
    if (!this.modal) return;

    const modalBody = this.modal.querySelector(".modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
            <div class="appointment-details">
                <p><strong>Saat:</strong> ${this.formatTime(
                  appointment.time
                )}</p>
                <p><strong>Durum:</strong> ${this.getStatusText(
                  appointment.status
                )}</p>
                ${
                  appointment.ptName
                    ? `<p><strong>Eğitmen:</strong> ${appointment.ptName}</p>`
                    : ""
                }
            </div>
        `;

    this.modal.classList.add("active");
  }

  getStatusText(status) {
    switch (status) {
      case "SCHEDULED":
        return "Planlandı";
      case "COMPLETED":
        return "Tamamlandı";
      case "CANCELLED":
        return "İptal Edildi";
      default:
        return status;
    }
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove("active");
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  formatTime(hour) {
    return `${hour}:00`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SchedulePage();
});
