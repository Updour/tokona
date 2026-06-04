import { create } from 'zustand';

interface AttendanceState {
    isClockInOpen: boolean;
    isClockOutOpen: boolean;
    selectedAttendance: any | null;

    openClockIn: () => void;
    closeClockIn: () => void;
    openClockOut: () => void;
    closeClockOut: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
    isClockInOpen: false,
    isClockOutOpen: false,
    selectedAttendance: null,

    openClockIn: () => set({ isClockInOpen: true }),
    closeClockIn: () => set({ isClockInOpen: false }),
    openClockOut: () => set({ isClockOutOpen: true }),
    closeClockOut: () => set({ isClockOutOpen: false }),
}));
