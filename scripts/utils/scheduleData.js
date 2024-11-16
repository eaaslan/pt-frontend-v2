// Mock data service with your API's data structure
export class ScheduleDataService {
  constructor() {
    // Mock appointments using your API's format
    this.mockAppointments = [
      {
        id: 76,
        appointmentTime: "2024-11-14T11:00:00",
        checkInTime: null,
        status: "SCHEDULED",
        memberId: 20,
        memberName: "John Garcia",
        ptId: 4,
        ptName: "Personal Trainer",
      },
      {
        id: 81,
        appointmentTime: "2024-11-15T10:00:00",
        checkInTime: null,
        status: "SCHEDULED",
        memberId: 21,
        memberName: "Alexander Martinez",
        ptId: 4,
        ptName: "Personal Trainer",
      },
      {
        id: 82,
        appointmentTime: "2024-11-16T14:00:00",
        checkInTime: null,
        status: "SCHEDULED",
        memberId: 21,
        memberName: "Alexander Martinez",
        ptId: 4,
        ptName: "Personal Trainer",
      },
      // Add more mock appointments as needed
    ];
  }

  // Mock API call to get appointments for a specific date
  async getAppointments(date) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dateStr = this.formatDate(date);

    // Filter appointments for the given date
    const appointments = this.mockAppointments.filter((apt) =>
      apt.appointmentTime.startsWith(dateStr)
    );

    return {
      success: true,
      appointments,
    };
  }

  // Helper method to format date to YYYY-MM-DD
  formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  // Real API implementation (uncomment and modify when ready)
  /*
    async getAppointments(date) {
        try {
            const dateStr = this.formatDate(date);
            const response = await fetch(`/api/appointments?date=${dateStr}`);
            const data = await response.json();
            return {
                success: true,
                appointments: data
            };
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return {
                success: false,
                error: 'Failed to fetch appointments'
            };
        }
    }
    */
}
