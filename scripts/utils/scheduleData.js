// Mock data service with simplified view
export class ScheduleDataService {
  constructor() {
    // Current member ID (in real app, get from auth)
    this.currentMemberId = 20;

    // Mock appointments for next week
    const today = new Date();
    this.mockAppointments = [
      // Member's own appointments
      {
        id: 76,
        appointmentTime: "2024-11-16T11:00:00",
        checkInTime: null,
        status: "SCHEDULED",
        memberId: 20,
        memberName: "John Garcia",
        ptId: 4,
        ptName: "Personal Trainer",
      },
      {
        id: 77,
        appointmentTime: "2024-11-18T13:00:00",
        checkInTime: null,
        status: "SCHEDULED",
        memberId: 20,
        memberName: "John Garcia",
        ptId: 4,
        ptName: "Personal Trainer",
      },
      // Other appointments (just to mark slots as unavailable)
      {
        id: 78,
        appointmentTime: "2024-11-16T09:00:00",
        memberId: 21,
      },
      {
        id: 79,
        appointmentTime: "2024-11-17T14:00:00",
        memberId: 22,
      },
      {
        id: 80,
        appointmentTime: "2024-11-19T10:00:00",
        memberId: 23,
      },
    ];
  }

  // Get appointments for a specific date
  async getAppointments(date) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dateStr = this.formatDate(date);

    // Get all appointments for this date
    const appointments = this.mockAppointments.filter((apt) =>
      apt.appointmentTime.startsWith(dateStr)
    );

    // Transform data to just show availability and member's own appointments
    const transformedAppointments = appointments.map((apt) => ({
      time: new Date(apt.appointmentTime).getHours(),
      isOwnAppointment: apt.memberId === this.currentMemberId,
      ...(apt.memberId === this.currentMemberId
        ? {
            id: apt.id,
            ptName: apt.ptName,
            status: apt.status,
          }
        : {}),
    }));

    return {
      success: true,
      appointments: transformedAppointments,
    };
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }
}
