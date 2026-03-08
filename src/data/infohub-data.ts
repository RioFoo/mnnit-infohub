// ============================================================
// INFOHUB - COMPLETE EXTRACTED DATA FILE
// Ready to paste directly into your Lovable project
// ============================================================

// ─────────────────────────────────────────────
// SECTION 1: TYPES
// ─────────────────────────────────────────────

export type EventType = 'EXAM' | 'HOLIDAY' | 'ACADEMIC' | 'EVENT' | 'PRACTICAL';

export interface AcademicEvent {
  id: string;
  date: string;
  endDate?: string;
  rawDate: string;
  rawEndDate?: string;
  title: string;
  type: EventType;
  description?: string;
  location?: string;
}

export interface AcademicNotice {
  id: number;
  title: string;
  date: string;
  category: 'RESULT' | 'GENERAL' | 'ACADEMIC' | 'EXAM' | 'ADMISSION' | 'FEE';
  link: string;
  details: string;
}

export interface ContactPerson {
  role: string;
  name: string;
  email: string;
  phone: string;
}

export interface ContactCategory {
  category: string;
  contacts: ContactPerson[];
}

export interface QuickLink {
  title: string;
  url: string;
  category: string;
}

export interface ClassSession {
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
  type: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'WORKSHOP';
  batch?: '1' | '2' | 'ALL';
  combinedInfo?: string;
}

export interface DaySchedule {
  day: string;
  sessions: ClassSession[];
}

export interface SectionData {
  id: string;
  name: string;
  schedule: DaySchedule[];
}


// ─────────────────────────────────────────────
// SECTION 2: ACADEMIC CALENDAR EVENTS
// ─────────────────────────────────────────────

export const ACADEMIC_EVENTS: AcademicEvent[] = [
  // JULY 2025
  { id: 'jul-supp-exam-end', date: 'Jul 03, 2025', rawDate: '2025-07-03', title: 'Supplementary Exam Ends', type: 'EXAM' },
  { id: 'jul-supp-grade', date: 'Jul 10, 2025', rawDate: '2025-07-10', title: 'Submission of Supplementary Grades', type: 'ACADEMIC' },
  { id: 'jul-phy-reg', date: 'Jul 17, 2025', rawDate: '2025-07-17', title: 'Physical Reg. for Odd Sem Starts', type: 'ACADEMIC' },
  { id: 'jul-reg-end', date: 'Jul 18, 2025', rawDate: '2025-07-18', title: 'Online/Physical Registration Ends', type: 'ACADEMIC' },
  { id: 'jul-vac-end', date: 'Jul 19, 2025', rawDate: '2025-07-19', title: 'Summer Vacation Ends', type: 'ACADEMIC' },
  { id: 'jul-class-start', date: 'Jul 23, 2025', rawDate: '2025-07-23', title: 'Start of Classes (Odd Sem)', type: 'ACADEMIC', description: 'Classes begin for all students except 1st Year.' },

  // AUGUST 2025
  { id: 'aug-ind-day', date: 'Aug 15, 2025', rawDate: '2025-08-15', title: 'Independence Day', type: 'HOLIDAY' },
  { id: 'aug-first-yr', date: 'Aug 26, 2025', rawDate: '2025-08-26', title: 'Start of First Year Classes', type: 'ACADEMIC' },

  // SEPTEMBER 2025
  { id: 'sep-research', date: 'Sep 03, 2025', rawDate: '2025-09-03', title: 'Research Day', type: 'EVENT' },
  { id: 'sep-att-1', date: 'Sep 04, 2025', rawDate: '2025-09-04', title: '1st Short Attendance Notification', type: 'ACADEMIC' },
  { id: 'sep-eid', date: 'Sep 05, 2025', rawDate: '2025-09-05', title: 'Id-E-Milad', type: 'HOLIDAY' },
  { id: 'sep-mid-start', date: 'Sep 22, 2025', rawDate: '2025-09-22', endDate: 'Sep 27, 2025', rawEndDate: '2025-09-27', title: 'Mid Sem Exams (Odd)', type: 'EXAM', description: 'Written examinations for Odd Semester.' },
  { id: 'sep-break-start', date: 'Sep 28, 2025', rawDate: '2025-09-28', title: 'Mid Sem Break Starts', type: 'HOLIDAY' },

  // OCTOBER 2025
  { id: 'oct-dussehra-add', date: 'Oct 01, 2025', rawDate: '2025-10-01', title: 'Additional Day for Dussehra', type: 'HOLIDAY' },
  { id: 'oct-gandhi', date: 'Oct 02, 2025', rawDate: '2025-10-02', title: 'Gandhi Jayanti / Dussehra', type: 'HOLIDAY' },
  { id: 'oct-break-end', date: 'Oct 03, 2025', rawDate: '2025-10-03', title: 'Mid Sem Break Ends', type: 'ACADEMIC' },
  { id: 'oct-att-2', date: 'Oct 17, 2025', rawDate: '2025-10-17', title: '2nd Short Attendance Notification', type: 'ACADEMIC' },
  { id: 'oct-diwali', date: 'Oct 20, 2025', rawDate: '2025-10-20', title: 'Diwali', type: 'HOLIDAY' },

  // NOVEMBER 2025
  { id: 'nov-eval-start', date: 'Nov 03, 2025', rawDate: '2025-11-03', title: 'MT/PhD Evaluation Starts', type: 'ACADEMIC' },
  { id: 'nov-guru', date: 'Nov 05, 2025', rawDate: '2025-11-05', title: 'Guru Nanak Jayanti', type: 'HOLIDAY' },
  { id: 'nov-gac', date: 'Nov 15, 2025', rawDate: '2025-11-15', title: 'Global Alumni Convention (GAC 2025)', type: 'EVENT' },
  { id: 'nov-end-class', date: 'Nov 22, 2025', rawDate: '2025-11-22', title: 'End of Classes', type: 'ACADEMIC' },
  { id: 'nov-end-start', date: 'Nov 24, 2025', rawDate: '2025-11-24', endDate: 'Dec 05, 2025', rawEndDate: '2025-12-05', title: 'End Sem Exams (Odd)', type: 'EXAM' },

  // DECEMBER 2025
  { id: 'dec-prac-start', date: 'Dec 10, 2025', rawDate: '2025-12-10', endDate: 'Dec 14, 2025', rawEndDate: '2025-12-14', title: 'Practical Exams', type: 'PRACTICAL' },
  { id: 'dec-fest', date: 'Dec 12, 2025', rawDate: '2025-12-12', title: 'Culrav + Avishkar + Gnosiomania', type: 'EVENT', description: 'Combined Annual Festival.' },
  { id: 'dec-reg-even', date: 'Dec 15, 2025', rawDate: '2025-12-15', title: 'Online Reg. for Even Sem Starts', type: 'ACADEMIC' },
  { id: 'dec-grade', date: 'Dec 19, 2025', rawDate: '2025-12-19', title: 'Submission of Grades', type: 'ACADEMIC' },
  { id: 'dec-vacation', date: 'Dec 22, 2025', rawDate: '2025-12-22', title: 'Winter Vacation Starts', type: 'HOLIDAY' },
  { id: 'dec-christmas', date: 'Dec 25, 2025', rawDate: '2025-12-25', title: 'Christmas Day', type: 'HOLIDAY' },
  { id: 'dec-result', date: 'Dec 29, 2025', rawDate: '2025-12-29', title: 'Declaration of Results', type: 'ACADEMIC' },

  // JANUARY 2026
  { id: 'jan-meet', date: 'Jan 01, 2026', rawDate: '2026-01-01', title: 'Annual Athletics Meet', type: 'EVENT' },
  { id: 'jan-vac-end', date: 'Jan 02, 2026', rawDate: '2026-01-02', title: 'Winter Vacation Ends', type: 'ACADEMIC' },
  { id: 'jan-class', date: 'Jan 05, 2026', rawDate: '2026-01-05', title: 'Start of Classes (Even Sem)', type: 'ACADEMIC' },
  { id: 'jan-basant', date: 'Jan 23, 2026', rawDate: '2026-01-23', title: 'Basant Panchami', type: 'HOLIDAY' },
  { id: 'jan-republic', date: 'Jan 26, 2026', rawDate: '2026-01-26', title: 'Republic Day', type: 'HOLIDAY' },

  // FEBRUARY 2026
  { id: 'feb-mid-start', date: 'Feb 20, 2026', rawDate: '2026-02-20', endDate: 'Feb 27, 2026', rawEndDate: '2026-02-27', title: 'Mid Sem Exams (Even)', type: 'EXAM' },
  { id: 'feb-break', date: 'Feb 28, 2026', rawDate: '2026-02-28', title: 'Mid Sem Break Starts', type: 'HOLIDAY' },

  // MARCH 2026
  { id: 'mar-holi', date: 'Mar 04, 2026', rawDate: '2026-03-04', title: 'Holi', type: 'HOLIDAY' },
  { id: 'mar-break-end', date: 'Mar 08, 2026', rawDate: '2026-03-08', title: 'Mid Sem Break Ends', type: 'ACADEMIC' },
  { id: 'mar-mahavir', date: 'Mar 31, 2026', rawDate: '2026-03-31', title: 'Mahavir Jayanti', type: 'HOLIDAY' },

  // APRIL 2026
  { id: 'apr-eval', date: 'Apr 02, 2026', rawDate: '2026-04-02', title: 'MT/PhD/MCA Evaluation Starts', type: 'ACADEMIC' },
  { id: 'apr-goodfri', date: 'Apr 03, 2026', rawDate: '2026-04-03', title: 'Good Friday', type: 'HOLIDAY' },
  { id: 'apr-prac', date: 'Apr 13, 2026', rawDate: '2026-04-13', title: 'Practical Exams Start', type: 'PRACTICAL' },
  { id: 'apr-ambedkar', date: 'Apr 14, 2026', rawDate: '2026-04-14', title: 'Ambedkar Jayanti', type: 'HOLIDAY' },
  { id: 'apr-class-end', date: 'Apr 24, 2026', rawDate: '2026-04-24', title: 'End of Classes / Practicals End', type: 'ACADEMIC' },
  { id: 'apr-end-start', date: 'Apr 27, 2026', rawDate: '2026-04-27', title: 'End Sem Theory Exam Start', type: 'EXAM' },

  // MAY 2026
  { id: 'may-buddha', date: 'May 01, 2026', rawDate: '2026-05-01', title: 'Buddha Purnima', type: 'HOLIDAY' },
  { id: 'may-end-finish', date: 'May 08, 2026', rawDate: '2026-05-08', title: 'End Sem Exams End', type: 'EXAM' },
  { id: 'may-vacation', date: 'May 23, 2026', rawDate: '2026-05-23', title: 'Summer Vacation Starts', type: 'HOLIDAY' },
  { id: 'may-eid', date: 'May 27, 2026', rawDate: '2026-05-27', title: 'Id-Ul-Zuha', type: 'HOLIDAY' },
];


// ─────────────────────────────────────────────
// SECTION 3: ACADEMIC NOTICES
// ─────────────────────────────────────────────

export const ACADEMIC_NOTIFICATIONS: AcademicNotice[] = [
  {
    id: 1,
    title: 'B.TECH II SEMESTER EAA ALLOTMENT RESULT',
    date: '14/01/26',
    category: 'RESULT',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'The allotment result for Extra Academic Activity (EAA) for B.Tech II Semester has been declared. Please check the portal for your allocated activity.',
  },
  {
    id: 2,
    title: 'B.TECH II SEMESTER CES ALLOTMENT RESULT',
    date: '14/01/26',
    category: 'RESULT',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'The allotment result for Creative Arts / Sports (CES) for B.Tech II Semester is now available on the academic portal.',
  },
  {
    id: 3,
    title: 'Choices filling for B.Tech IV Semester EAA',
    date: '12/01/26',
    category: 'GENERAL',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'Students moving to IV Semester must fill their preferences for EAA. Failure to do so by 15th Jan will result in auto-allocation.',
  },
  {
    id: 4,
    title: 'B.Tech II Semester CES & EAA Allotment Pool B',
    date: '07/01/26',
    category: 'GENERAL',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'Pool B students are requested to submit their choices for CES & EAA components immediately.',
  },
  {
    id: 5,
    title: 'Guidelines for Semester Internship',
    date: '06/01/26',
    category: 'ACADEMIC',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'Important guidelines for students proceeding on semester-long internships. Please submit the NOC form.',
  },
  {
    id: 6,
    title: 'Late Registration Notice',
    date: '02/01/26',
    category: 'ADMISSION',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'Registration with late fee is open until 5th Jan. Ensure all dues are cleared before registering.',
  },
  {
    id: 7,
    title: 'Academic Calendar 2025-26 (Even Sem)',
    date: '28/12/25',
    category: 'ACADEMIC',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'The detailed academic calendar for the Even Semester 2025-26 has been released. Classes commence Jan 5th.',
  },
  {
    id: 8,
    title: 'Make-up Examination Schedule',
    date: '20/12/25',
    category: 'EXAM',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'Students eligible for make-up exams must submit their applications to the Dean Academic office by Dec 25th.',
  },
  {
    id: 9,
    title: 'Fee Structure for Even Semester',
    date: '15/12/25',
    category: 'FEE',
    link: 'https://www.academics.mnnit.ac.in/new',
    details: 'The fee structure for the upcoming semester is available. Payment portal opens Dec 20th.',
  },
];


// ─────────────────────────────────────────────
// SECTION 4: CONTACT DIRECTORY
// ─────────────────────────────────────────────

export const CONTACT_DIRECTORY: ContactCategory[] = [
  {
    category: 'Administration',
    contacts: [
      { role: 'Director', name: 'Prof. Rama Shanker Verma', email: 'director@mnnit.ac.in', phone: '+91-532-2271101' },
      { role: 'Registrar', name: 'Dr. Sarvesh Kumar', email: 'registrar@mnnit.ac.in', phone: '+91-532-2271104' },
      { role: 'Dy. Registrar (Admin)', name: 'Administration', email: 'dyregistraradmin@mnnit.ac.in', phone: '+91-532-2271105' },
    ],
  },
  {
    category: 'Deans & Welfare',
    contacts: [
      { role: 'Dean (Academic)', name: 'Prof. L.K. Mishra', email: 'deanacademics@mnnit.ac.in', phone: '+91-532-2271110' },
      { role: 'Dean (Student Welfare)', name: 'Prof. R.K. Singh', email: 'deansw@mnnit.ac.in', phone: '+91-532-2271115' },
      { role: 'Dean (R&C)', name: 'Prof. Samir Kumar', email: 'deanrc@mnnit.ac.in', phone: '+91-532-2271112' },
    ],
  },
  {
    category: 'Heads of Departments (HODs)',
    contacts: [
      { role: 'HOD CSE', name: 'Head, CSED', email: 'hodcse@mnnit.ac.in', phone: '+91-532-2271351' },
      { role: 'HOD ECE', name: 'Head, ECED', email: 'hodece@mnnit.ac.in', phone: '+91-532-2271451' },
      { role: 'HOD Electrical', name: 'Head, EED', email: 'hodee@mnnit.ac.in', phone: '+91-532-2271401' },
      { role: 'HOD Mechanical', name: 'Head, MED', email: 'hodme@mnnit.ac.in', phone: '+91-532-2271501' },
      { role: 'HOD Civil', name: 'Head, CED', email: 'hodce@mnnit.ac.in', phone: '+91-532-2271301' },
    ],
  },
  {
    category: 'Emergency & Services',
    contacts: [
      { role: 'Chief Proctor', name: 'Prof. P.K. Dutta', email: 'chiefproctor@mnnit.ac.in', phone: '+91-532-2271710' },
      { role: 'Health Centre', name: 'Emergency', email: 'hc@mnnit.ac.in', phone: '+91-532-2271200' },
      { role: 'Security Control', name: 'Main Gate', email: 'security@mnnit.ac.in', phone: '+91-532-2271100' },
    ],
  },
];


// ─────────────────────────────────────────────
// SECTION 5: IMPORTANT LINKS / QUICK PORTALS
// ─────────────────────────────────────────────

export const QUICK_LINKS: QuickLink[] = [
  { title: 'Academic Portal', url: 'https://www.academics.mnnit.ac.in/new', category: 'Academic' },
  { title: 'Exam Cell', url: 'http://www.mnnit.ac.in/index.php/exam-cell', category: 'Academic' },
  { title: 'TPO Portal', url: 'http://www.mnnit.ac.in/tnp/', category: 'Placement' },
  { title: 'Alumni Network', url: 'https://alumni.mnnit.ac.in/', category: 'Network' },
  { title: 'MNNIT Webmail', url: 'https://webmail.mnnit.ac.in/', category: 'Communication' },
  { title: 'MNNIT Official Website', url: 'https://www.mnnit.ac.in/', category: 'General' },
  { title: 'NPTEL Courses', url: 'https://nptel.ac.in/', category: 'Learning' },
  { title: 'ERP / Student Login', url: 'https://erp.mnnit.ac.in/', category: 'Academic' },
];


// ─────────────────────────────────────────────
// SECTION 6: CLUBS & SOCIETIES
// ─────────────────────────────────────────────

export const CLUBS_AND_SOCIETIES = [
  { name: 'Computer Coding Club (C3)', category: 'Technical' },
  { name: 'Robotics Club', category: 'Technical' },
  { name: 'Aero Club', category: 'Technical' },
  { name: 'Literary Club', category: 'Cultural' },
  { name: 'Athletics Committee', category: 'Sports' },
  { name: 'Music Club', category: 'Cultural' },
  { name: 'Drama Club', category: 'Cultural' },
  { name: 'Photography Club', category: 'Arts' },
];


// ─────────────────────────────────────────────
// SECTION 7: TIMETABLE DATA (ALL SECTIONS)
// ─────────────────────────────────────────────

export const TIMETABLE_DATA: Record<string, SectionData> = {

  // ══════════════════════════════════════════
  // CSE — Section A (Batches A1, A2)
  // ══════════════════════════════════════════
  "CSE-A": {
    id: "CSE-A", name: "CSE — Section A",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '1' },
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Chemistry Tutorial", room: "NLH-2", type: "TUTORIAL", batch: 'ALL', combinedInfo: "(A+B)" },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(A+B)" },
        { startTime: "14:00", endTime: "15:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "GS-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Professional Communication", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Programming Paradigms", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II Tutorial", room: "SEW-9", type: "TUTORIAL", batch: '2' },
        { startTime: "16:00", endTime: "18:00", subject: "Data Structures Lab", room: "CCTF", type: "LAB", batch: '1' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Data Structures Lab", room: "CCTF", type: "LAB", batch: '2' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Communication", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(A+B)" },
        { startTime: "11:00", endTime: "12:00", subject: "Programming Paradigms", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Mathematics-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '2' },
        { startTime: "16:00", endTime: "17:00", subject: "Mathematics-II Tutorial", room: "FE-18", type: "TUTORIAL", batch: '1' },
        { startTime: "17:00", endTime: "18:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // CSE — Section B (Batches B1, B2)
  // ══════════════════════════════════════════
  "CSE-B": {
    id: "CSE-B", name: "CSE — Section B",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Professional Communication", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "13:00", endTime: "14:00", subject: "Engineering Chemistry Tutorial", room: "NLH-2", type: "TUTORIAL", batch: 'ALL', combinedInfo: "(A+B)" },
        { startTime: "15:00", endTime: "17:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '1' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(A+B)" },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Data Structures Lab", room: "CCTF", type: "LAB", batch: '1' },
        { startTime: "17:00", endTime: "18:00", subject: "Programming Paradigms", room: "GS-7", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II Tutorial", room: "SEW-9", type: "TUTORIAL", batch: '2' },
        { startTime: "10:00", endTime: "11:00", subject: "Programming Paradigms", room: "GS-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "13:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '2' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "16:00", subject: "Data Structures Lab", room: "CCTF", type: "LAB", batch: '2' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "GS-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(A+B)" },
        { startTime: "11:00", endTime: "12:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Professional Communication", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "13:00", endTime: "14:00", subject: "Mathematics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // CSE — Section C (Batches C1, C2)
  // ══════════════════════════════════════════
  "CSE-C": {
    id: "CSE-C", name: "CSE — Section C",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Data Structures Lab", room: "CCTF", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Chemistry Tutorial", room: "NLH-2", type: "TUTORIAL", batch: 'ALL', combinedInfo: "(C+D)" },
        { startTime: "16:00", endTime: "17:00", subject: "Programming Paradigms", room: "GS-7", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '1' },
        { startTime: "09:00", endTime: "11:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "12:00", subject: "Programming Paradigms", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(C+D)" },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Communication", room: "GS-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Professional Communication", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II Tutorial", room: "SEW-10", type: "TUTORIAL", batch: '1' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Chemistry", room: "NLH-1", type: "LECTURE", batch: 'ALL', combinedInfo: "(C+D)" },
        { startTime: "11:00", endTime: "13:00", subject: "Data Structures Lab", room: "CCSF", type: "LAB", batch: '2' },
        { startTime: "12:00", endTime: "13:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II Tutorial", room: "LH-2", type: "TUTORIAL", batch: '2' },
        { startTime: "10:00", endTime: "11:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "GS-3", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // CSE — Section D (Batches D1, D2)
  // ══════════════════════════════════════════
  "CSE-D": {
    id: "CSE-D", name: "CSE — Section D",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Chemistry Tutorial", room: "NLH-2", type: "TUTORIAL", batch: 'ALL', combinedInfo: "(C+D)" },
        { startTime: "16:00", endTime: "17:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Data Structures Lab", room: "CCTF", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(C+D)" },
        { startTime: "17:00", endTime: "18:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "GS-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Data Structures Lab", room: "CCSF", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Data Structures", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '2' },
        { startTime: "15:00", endTime: "16:00", subject: "Professional Communication", room: "GS-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '1' },
        { startTime: "09:00", endTime: "11:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Chemistry", room: "NLH-1", type: "LECTURE", batch: 'ALL', combinedInfo: "(C+D)" },
        { startTime: "16:00", endTime: "17:00", subject: "Mathematics-II", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Programming Paradigms", room: "GS-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II Tutorial", room: "LH-2", type: "TUTORIAL", batch: '1' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '1' },
        { startTime: "15:00", endTime: "16:00", subject: "Programming Paradigms", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Communication", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // ECE — Section E (Batches E1, E2)
  // ══════════════════════════════════════════
  "ECE-E": {
    id: "ECE-E", name: "ECE — Section E",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Principles of Comm. Engineering", room: "FN-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Communication", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Principles of Electronics Engineering", room: "GS-7", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Professional Communication", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II Tutorial", room: "SEW-9", type: "TUTORIAL", batch: '1' },
        { startTime: "15:00", endTime: "17:00", subject: "Principles of Electronics Engineering Practical", room: "Lab", type: "LAB", batch: '1' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Principles of Comm. Engineering", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "11:00", endTime: "13:00", subject: "CAD for Electronics Lab", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "15:00", endTime: "17:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '1' },
        { startTime: "17:00", endTime: "18:00", subject: "Principles of Electronics Engineering", room: "GS-7", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II Tutorial", room: "SEW-10", type: "TUTORIAL", batch: '2' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "11:00", endTime: "13:00", subject: "Principles of Comm. Engg Lab", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "16:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "16:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '1' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Principles of Comm. Engg Lab", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "09:00", endTime: "11:00", subject: "CAD for Electronics Lab", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "12:00", endTime: "13:00", subject: "Environmental Science & Climate Change", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "14:00", endTime: "15:00", subject: "CAD for Electronics", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // ECE — Section F (Batches F1, F2)
  // ══════════════════════════════════════════
  "ECE-F": {
    id: "ECE-F", name: "ECE — Section F",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Principles of Comm. Engineering", room: "FN-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "CAD for Electronics Lab", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '1' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "11:00", endTime: "13:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "13:00", subject: "Principles of Comm. Engg Lab", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "11:00", endTime: "13:00", subject: "Principles of Comm. Engg Lab", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '2' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Principles of Comm. Engineering", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "11:00", endTime: "13:00", subject: "Professional Communication Lab", room: "Lang Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "CAD for Electronics Lab", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Communication", room: "GS-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Mathematics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '1' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Chemistry", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "12:00", endTime: "13:00", subject: "Environmental Science & Climate Change", room: "NLH-2", type: "LECTURE", batch: 'ALL', combinedInfo: "(E+F)" },
        { startTime: "16:00", endTime: "17:00", subject: "CAD for Electronics", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Professional Communication", room: "GS-4", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // ME — Section G (Batches G1, G2)
  // ══════════════════════════════════════════
  "ME-G": {
    id: "ME-G", name: "ME — Section G",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Mechanics Practical", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "13:00", subject: "Numerical & Statistical Techniques Practical", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Mechanics", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Graphics Lab", room: "SEW-8", type: "LAB", batch: '1' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '1' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Physics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '1' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Mechanics Practical", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Numerical & Statistical Techniques Practical", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Physics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Innovation & Design Practical", room: "Workshop", type: "LAB", batch: 'ALL', combinedInfo: "(G+H)" },
        { startTime: "17:00", endTime: "18:00", subject: "Professional Ethics & Social Values", room: "GS-8", type: "LECTURE", batch: 'ALL', combinedInfo: "(G+H)" },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Numerical & Statistical Techniques", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Engineering Mechanics", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "GS-5", type: "LECTURE", batch: 'ALL', combinedInfo: "(G+H)" },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Physics-II Tutorial", room: "GW-5", type: "TUTORIAL", batch: '2' },
        { startTime: "17:00", endTime: "18:00", subject: "Mathematics-II Tutorial", room: "GW-5", type: "TUTORIAL", batch: '2' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Engineering Physics-II", room: "FC-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Numerical & Statistical Techniques", room: "FC-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Intro to AI & ML", room: "FN-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "FN-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Graphics", room: "SEW-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Intro to AI & ML Lab", room: "CCTF", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Intro to AI & ML", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Physics-II Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // ME — Section H (Batches H1, H2)
  // ══════════════════════════════════════════
  "ME-H": {
    id: "ME-H", name: "ME — Section H",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Graphics Lab", room: "SEW-8", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Intro to AI & ML Lab", room: "CCTF", type: "LAB", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Physics-II Tutorial", room: "FN-4", type: "TUTORIAL", batch: '2' },
        { startTime: "16:00", endTime: "17:00", subject: "Mathematics-II Tutorial", room: "GW-5", type: "TUTORIAL", batch: '2' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Mechanics", room: "LH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Numerical & Statistical Techniques", room: "SEW-10", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "SEW-10", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Intro to AI & ML", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Professional Ethics & Social Values", room: "GS-8", type: "LECTURE", batch: 'ALL', combinedInfo: "(G+H)" },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Physics-II", room: "SEW-9", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "GS-5", type: "LECTURE", batch: 'ALL', combinedInfo: "(G+H)" },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "SEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Mechanics", room: "FN-3", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Engineering Physics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Numerical & Statistical Techniques", room: "FC-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Mechanics Practical", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "16:00", endTime: "17:00", subject: "Numerical & Statistical Techniques", room: "FN-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Physics-II Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "SEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Graphics Lab", room: "SEW-8", type: "LAB", batch: '1' },
        { startTime: "16:00", endTime: "17:00", subject: "Mathematics-II Tutorial", room: "GW-3", type: "TUTORIAL", batch: '1' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // ME — Section Q (Batches Q1, Q2)
  // ══════════════════════════════════════════
  "ME-Q": {
    id: "ME-Q", name: "ME — Section Q",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II Tutorial", room: "GW-5", type: "TUTORIAL", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Physics-II Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Physics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Physics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Intro to AI & ML", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Intro to AI & ML", room: "GS-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Graphics Lab", room: "SEW-8", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "SEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Physics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Numerical & Statistical Techniques Practical", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Mechanics Practical", room: "Lab", type: "LAB", batch: '1' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "SEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Intro to AI & ML Lab", room: "Lab", type: "LAB", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Numerical & Statistical Techniques Practical", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Mechanics", room: "FN-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Graphics", room: "FN-4", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Numerical & Statistical Techniques Practical", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "13:00", subject: "Intro to AI & ML", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Physics-II Tutorial", room: "LH-2", type: "TUTORIAL", batch: '1' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Mechanics", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "18:00", subject: "Engineering Graphics Lab", room: "SEW-8", type: "LAB", batch: '2' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Physics-II Tutorial", room: "GW-3", type: "TUTORIAL", batch: '2' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // CE — Section I (Batches I1, I2)
  // ══════════════════════════════════════════
  "CE-I": {
    id: "CE-I", name: "CE — Section I",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "GS-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Building Engineering-II", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Physics-I", room: "GS-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Physics-I Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Intro to AI & ML", room: "FN-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Intro to AI & ML", room: "GS-6", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Workshop & Mfg. Process", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "FN-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Physics-I", room: "FN-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Building Engineering-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '1' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Workshop & Mfg. Process", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Building Engineering-II Tutorial", room: "FEW-15", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II Tutorial", room: "FEW-15", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Physics-I Tutorial", room: "FEW-15", type: "TUTORIAL", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // CE — Section J (Batches J1, J2)
  // ══════════════════════════════════════════
  "CE-J": {
    id: "CE-J", name: "CE — Section J",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "11:00", endTime: "13:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Intro to AI & ML", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Sustainable Urban Habitat", room: "GS-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "11:00", endTime: "13:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '1' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II Tutorial", room: "FE-16", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Sustainable Urban Habitat Tutorial", room: "NLH-1", type: "TUTORIAL", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "GS-6", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Building Engineering-II", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Physics-I", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Sustainable Urban Habitat", room: "GS-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Intro to AI & ML", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Building Engineering-II", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Engineering Physics-I", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Building Engineering-II Tutorial", room: "LH-2", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "14:00", endTime: "15:00", subject: "Engineering Physics-I Tutorial", room: "FEW-1", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Building Engineering-II", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // BT — BioTech Section K (Batches K1, K2)
  // ══════════════════════════════════════════
  "BT-K": {
    id: "BT-K", name: "BioTech — Section K",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "FEW-15", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '1' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II Tutorial", room: "LH-2", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Workshop & Mfg. Process", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Fundamentals of Biotechnology", room: "FN-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Fundamentals of Biotechnology Tutorial", room: "FN-1", type: "TUTORIAL", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Biosafety & Bioethics", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Physics-III", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "18:00", subject: "Engineering Physics-III Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Fundamentals of Biotechnology", room: "FN-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Intro to AI & ML", room: "GS-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Biosafety & Bioethics", room: "GS-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Physics-III", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Intro to AI & ML", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Physics-III", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II", room: "SEW-9", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Biosafety & Bioethics", room: "SEW-9", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // CH — Chemical Engineering Section L (Batches L1, L2)
  // ══════════════════════════════════════════
  "CH-L": {
    id: "CH-L", name: "Chemical — Section L",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Physics-I Tutorial", room: "FN-3", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Fluid Flow Operations", room: "FN-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Mathematics-II", room: "FN-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "18:00", subject: "Engineering Physics-I Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Material Science & Engineering", room: "GS-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Intro to AI & ML", room: "GS-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Professional Ethics & Social Values", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Thermodynamics", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Material Science & Engineering", room: "FN-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Mathematics-II Tutorial", room: "FN-1", type: "TUTORIAL", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Physics-I", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Fluid Flow Operations", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Material Science & Engineering", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Thermodynamics", room: "GS-3", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Intro to AI & ML", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Fluid Flow Operations", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "10:00", endTime: "12:00", subject: "Fluid Flow Operations Practical", room: "FN-3", type: "LAB", batch: '1' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "FE-18", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Workshop & Mfg. Process", room: "FE-18", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Physics-I", room: "FN-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "18:00", subject: "Fluid Flow Operations Practical", room: "FN-3", type: "LAB", batch: '2' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // PE — Production Section M (Batches M1, M2)
  // ══════════════════════════════════════════
  "PE-M": {
    id: "PE-M", name: "Production — Section M",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Intro to AI & ML", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Engineering Mechanics", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "16:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '2' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Physics-II", room: "FN-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Innovation & Design", room: "SEW-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Physics-II Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Numerical & Statistical Techniques", room: "SEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Professional Ethics & Social Values", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Innovation & Design Practical", room: "SEW-8", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Mathematics-II", room: "FE-18", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Intro to AI & ML", room: "LH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "FEW-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Physics-II", room: "FN-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Workshop & Mfg. Process", room: "SEW", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Engineering Mechanics", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Innovation & Design", room: "FC-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Numerical & Statistical Techniques Practical", room: "FN-4", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Engineering Physics-II Tutorial", room: "FN-4", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Mathematics-II", room: "FN-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Engineering Mechanics Practical", room: "Lab", type: "LAB", batch: '1' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Mathematics-II Tutorial", room: "FN-4", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "14:00", endTime: "16:00", subject: "Engineering Mechanics Practical", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "15:00", endTime: "17:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: '1' },
        { startTime: "16:00", endTime: "17:00", subject: "Numerical & Statistical Techniques", room: "FN-4", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // EE — Electrical Section N (Batches N1, N2)
  // ══════════════════════════════════════════
  "EE-N": {
    id: "EE-N", name: "Electrical — Section N",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Network Analysis", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Chemistry", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Professional Ethics & Social Values", room: "GS-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Simulation Tools", room: "FN-3", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Basic Electrical Engineering", room: "FN-4", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Network Analysis", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: '1' },
        { startTime: "15:00", endTime: "17:00", subject: "Simulation Tools Practical", room: "Lab", type: "LAB", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Basic Electrical Engg Practical", room: "Lab", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Chemistry", room: "GS-4", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '2' },
        { startTime: "11:00", endTime: "13:00", subject: "Electrical Workshop Lab", room: "Lab", type: "LAB", batch: '1' },
        { startTime: "12:00", endTime: "13:00", subject: "Mathematics-II", room: "FEW-15", type: "LECTURE", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Intro to AI & ML", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Engineering Chemistry Tutorial", room: "GS-4", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Simulation Tools", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Basic Electrical Engineering", room: "SEW-7", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Electrical Workshop", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Intro to AI & ML", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Engineering Chemistry Lab", room: "Chem Lab", type: "LAB", batch: '1' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "GS-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: '2' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Mathematics-II", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Network Analysis", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "11:00", endTime: "13:00", subject: "Electrical Workshop Lab", room: "Lab", type: "LAB", batch: '2' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II Tutorial", room: "SEW-1", type: "TUTORIAL", batch: '1' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // ECM — Section O
  // ══════════════════════════════════════════
  "ECM-O": {
    id: "ECM-O", name: "Eng. & Comp. Mechanics — Section O",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "10:00", endTime: "12:00", subject: "Engineering Physics-III Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Intro to AI & ML", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Fluid Mechanics", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "18:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Data Structures", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Intro to AI & ML", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Engineering Graphics", room: "SEW-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II", room: "GW-6", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Data Structures Practical", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Physics-III", room: "SEW-9", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Engineering Graphics Lab", room: "SEW-7", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Fluid Mechanics", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Engineering Physics-III Tutorial", room: "NLH-2", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Mathematics-II", room: "GW-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Data Structures", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Engineering Physics-III", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II", room: "GW-6", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Fluid Mechanics", room: "GS-8", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "12:00", endTime: "13:00", subject: "Environmental Science & Climate Change", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Mathematics-II Tutorial", room: "GW-4", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Professional Ethics & Social Values", room: "FN-1", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // MAT — Materials Section P
  // ══════════════════════════════════════════
  "MAT-P": {
    id: "MAT-P", name: "Materials — Section P",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "10:00", endTime: "12:00", subject: "Engineering Physics-III Practical", room: "Physics Lab", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Intro to AI & ML", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Fluid Mechanics", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Metallurgical Thermodynamics", room: "GW-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Intro to AI & ML Lab", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Data Structures", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Intro to AI & ML", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Metallurgical Thermodynamics", room: "GW-5", type: "LECTURE", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Mathematics-II", room: "GW-4", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "17:00", subject: "Data Structures Practical", room: "CCSF", type: "LAB", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Engineering Physics-III", room: "SEW-9", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "GW-9", type: "LECTURE", batch: 'ALL' },
        { startTime: "12:00", endTime: "13:00", subject: "Fluid Mechanics", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
        { startTime: "13:00", endTime: "14:00", subject: "Engineering Physics-III Tutorial", room: "NLH-2", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Environmental Science & Climate Change", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Workshop & Mfg. Process", room: "SEW-10", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Data Structures", room: "NLH-1", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Engineering Physics-III", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "10:00", endTime: "11:00", subject: "Mathematics-II Tutorial", room: "GW-9", type: "TUTORIAL", batch: 'ALL' },
        { startTime: "14:00", endTime: "15:00", subject: "Professional Ethics & Social Values", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "15:00", endTime: "16:00", subject: "Fluid Mechanics", room: "GS-8", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Metallurgical Thermodynamics", room: "GW-5", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Friday", sessions: [
        { startTime: "09:00", endTime: "11:00", subject: "Workshop & Mfg. Process Lab", room: "SEW", type: "LAB", batch: 'ALL' },
        { startTime: "11:00", endTime: "12:00", subject: "Mathematics-II", room: "GW-9", type: "LECTURE", batch: 'ALL' },
        { startTime: "16:00", endTime: "17:00", subject: "Metallurgical Thermodynamics", room: "GW-7", type: "LECTURE", batch: 'ALL' },
        { startTime: "17:00", endTime: "18:00", subject: "Professional Ethics & Social Values", room: "FN-1", type: "LECTURE", batch: 'ALL' },
      ]},
    ]
  },

  // ══════════════════════════════════════════
  // GIS Cell
  // ══════════════════════════════════════════
  "GIS": {
    id: "GIS", name: "GIS Cell",
    schedule: [
      { day: "Monday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Introduction to Geoinformatics", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Tuesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Introduction to Geoinformatics", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Wednesday", sessions: [
        { startTime: "09:00", endTime: "10:00", subject: "Introduction to Geoinformatics", room: "NLH-2", type: "LECTURE", batch: 'ALL' },
      ]},
      { day: "Thursday", sessions: [] },
      { day: "Friday", sessions: [] },
    ]
  },
};

// Semester → section timetable mapping (for future expansion)
export const TIMETABLE_DATA_BY_SEMESTER: Record<string, Record<string, SectionData>> = {
  "2": TIMETABLE_DATA,
};


// ─────────────────────────────────────────────
// SECTION 8: SUBJECT CODE → FULL NAME
// ─────────────────────────────────────────────

export const SUBJECT_CODES: Record<string, string> = {
  "MAN12104": "Mathematics-II",
  "CYN12501": "Engineering Chemistry",
  "HSN12600": "Professional Communication",
  "CSN12101": "Data Structures",
  "CSN12102": "Programming Paradigms",
  "IDN12600": "Environmental Science & Climate Change",
  "CSN12401*": "Data Structures (Other Branches)",
  "MAN12105": "Mathematics-II (ECE)",
  "ECN12101": "Principles of Communication Engineering",
  "ECN12102": "CAD for Electronics",
  "ECN12401*": "Principles of Electronics Engineering",
  "PHN12502": "Engineering Physics-II",
  "MAN12106": "Mathematics-II (ME)",
  "MAN12107": "Computer Based Numerical & Statistical Techniques",
  "MEN12601": "Engineering Graphics",
  "MEN12401": "Engineering Innovation & Design",
  "AMN12400*": "Engineering Mechanics",
  "EAN12700": "Professional Ethics & Social Values",
  "PHN12501": "Engineering Physics-I",
  "MAN12103": "Mathematics-II (Civil)",
  "CEN12101": "Building Engineering-II",
  "MEN12602": "Workshop & Manufacturing Process",
  "CEN12400*": "Sustainable Urban Habitat",
  "PHN12503": "Engineering Physics-III",
  "MAN12101": "Mathematics-II (BT)",
  "BTN12101": "Biosafety & Bioethics",
  "BTN12400*": "Fundamentals of Biotechnology",
  "MAN12102": "Mathematics-II (Chem)",
  "AMN12101": "Fluid Flow Operations",
  "CHN12400*": "Engineering Thermodynamics",
  "AMN12401*": "Material Science & Engineering",
  "EEN12101": "Network Analysis",
  "EEN12102": "Electrical Workshop",
  "EEN12400*": "Basic Electrical Engineering",
  "EEN12403*": "Introduction to Simulation Tools",
  "MAN12108": "Mathematics-II (ECM)",
  "AMN12102": "Fluid Mechanics",
  "MAN12109": "Mathematics-II (Materials)",
  "AMN12103": "Metallurgical Thermodynamics & Kinetics",
  "CSN12601": "Introduction to AI & Machine Learning",
  "GIN12401": "Introduction to Geoinformatics",
};


// ─────────────────────────────────────────────
// HOW TO USE IN LOVABLE
// ─────────────────────────────────────────────
//
// 1. Create a new file called `src/data/infohub-data.ts`
//    and paste this entire file into it.
//
// 2. Import wherever needed, for example:
//
//    import {
//      ACADEMIC_EVENTS,
//      ACADEMIC_NOTIFICATIONS,
//      CONTACT_DIRECTORY,
//      QUICK_LINKS,
//      TIMETABLE_DATA,
//      CLUBS_AND_SOCIETIES,
//    } from '@/data/infohub-data';
//
// 3. Tell Lovable:
//    "Use the data from src/data/infohub-data.ts for the
//     timetable, calendar, contacts, and quick links sections.
//     Do NOT modify this file."
//
// ─────────────────────────────────────────────
