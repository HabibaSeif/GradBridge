/**
 * MOCK DATA — Milestone 1 only.
 * These programs are sample entries used while there is no backend.
 * Server integration replaces this file in Milestone 2.
 */

export const FIELDS = [
  'Computer Science',
  'Data Science',
  'Business',
  'Engineering',
  'Economics',
  'Public Health',
  'Design',
];

export const COUNTRIES = [
  'Egypt',
  'Germany',
  'Netherlands',
  'United Kingdom',
  'Canada',
  'Italy',
  'Spain',
  'United States',
];

export const INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Cybersecurity',
  'Software Engineering',
  'Finance',
  'Marketing',
  'Sustainability',
  'Robotics',
  'Policy',
  'Human-Computer Interaction',
  'Epidemiology',
  'Entrepreneurship',
];

export const MOCK_SCHOOLS = [
  { id: 's1', name: 'Northbridge University', country: 'United Kingdom', website: 'https://example.org/northbridge', contactEmail: 'admissions@northbridge.example' },
  { id: 's2', name: 'Technische Hochschule Rhein', country: 'Germany', website: 'https://example.org/th-rhein', contactEmail: 'master@th-rhein.example' },
  { id: 's3', name: 'Delta University of Applied Sciences', country: 'Netherlands', website: 'https://example.org/delta', contactEmail: 'grad@delta.example' },
  { id: 's4', name: 'Lakeshore University', country: 'Canada', website: 'https://example.org/lakeshore', contactEmail: 'gradstudies@lakeshore.example' },
  { id: 's5', name: 'Nile Graduate School', country: 'Egypt', website: 'https://example.org/nile', contactEmail: 'info@nile-grad.example' },
  { id: 's6', name: 'Politecnico del Lago', country: 'Italy', website: 'https://example.org/lago', contactEmail: 'masters@lago.example' },
];

export const MOCK_PROGRAMS = [
  {
    id: 'p1', schoolId: 's1', title: 'MSc Artificial Intelligence', field: 'Computer Science', degreeType: 'MSc',
    country: 'United Kingdom', city: 'Manchester', tuition: 28000, minGpa: 3.3,
    languageReq: { ielts: 6.5, toefl: 92 }, deadline: '2027-01-31', durationMonths: 12,
    tags: ['Artificial Intelligence', 'Machine Learning'],
    description: 'A one-year taught program covering machine learning, deep learning, natural language processing and responsible AI, with a summer research project.',
  },
  {
    id: 'p2', schoolId: 's2', title: 'M.Sc. Software Engineering', field: 'Computer Science', degreeType: 'MSc',
    country: 'Germany', city: 'Cologne', tuition: 3000, minGpa: 3.0,
    languageReq: { ielts: 6.5, toefl: 88 }, deadline: '2027-03-15', durationMonths: 24,
    tags: ['Software Engineering', 'Cybersecurity'],
    description: 'A two-year research-oriented program on large-scale software systems, distributed systems and secure software development. Low tuition, English-taught.',
  },
  {
    id: 'p3', schoolId: 's3', title: 'MSc Data Science & Society', field: 'Data Science', degreeType: 'MSc',
    country: 'Netherlands', city: 'Delft', tuition: 19500, minGpa: 3.2,
    languageReq: { ielts: 6.5, toefl: 90 }, deadline: '2027-02-01', durationMonths: 12,
    tags: ['Machine Learning', 'Policy'],
    description: 'Combines statistics and machine learning with ethics and policy, preparing graduates to work on data problems in the public and private sectors.',
  },
  {
    id: 'p4', schoolId: 's4', title: 'Master of Engineering in Robotics', field: 'Engineering', degreeType: 'MEng',
    country: 'Canada', city: 'Toronto', tuition: 34000, minGpa: 3.0,
    languageReq: { ielts: 7.0, toefl: 100 }, deadline: '2026-12-10', durationMonths: 16,
    tags: ['Robotics', 'Artificial Intelligence'],
    description: 'A professional master’s with courses in control, perception and autonomous systems, plus a four-month industry placement.',
  },
  {
    id: 'p5', schoolId: 's5', title: 'MBA in Technology Management', field: 'Business', degreeType: 'MBA',
    country: 'Egypt', city: 'Cairo', tuition: 9000, minGpa: 2.7,
    languageReq: { ielts: 6.0, toefl: 79 }, deadline: '2027-04-30', durationMonths: 18,
    tags: ['Entrepreneurship', 'Finance'],
    description: 'An evening MBA for graduates who want to lead technology teams and start ventures. Includes a startup lab and mentorship from regional founders.',
  },
  {
    id: 'p6', schoolId: 's6', title: 'MSc Sustainable Engineering', field: 'Engineering', degreeType: 'MSc',
    country: 'Italy', city: 'Como', tuition: 4200, minGpa: 2.9,
    languageReq: { ielts: 6.0, toefl: 80 }, deadline: '2027-02-28', durationMonths: 24,
    tags: ['Sustainability'],
    description: 'Energy systems, circular design and life-cycle assessment, taught in English with projects alongside local manufacturers.',
  },
  {
    id: 'p7', schoolId: 's1', title: 'MSc Finance & Economics', field: 'Economics', degreeType: 'MSc',
    country: 'United Kingdom', city: 'Manchester', tuition: 31000, minGpa: 3.4,
    languageReq: { ielts: 7.0, toefl: 100 }, deadline: '2027-01-15', durationMonths: 12,
    tags: ['Finance', 'Policy'],
    description: 'Quantitative finance, econometrics and macroeconomic policy, with an optional placement in the City of London.',
  },
  {
    id: 'p8', schoolId: 's3', title: 'MSc Human-Computer Interaction & Design', field: 'Design', degreeType: 'MSc',
    country: 'Netherlands', city: 'Delft', tuition: 18000, minGpa: 3.0,
    languageReq: { ielts: 6.5, toefl: 90 }, deadline: '2027-03-01', durationMonths: 24,
    tags: ['Human-Computer Interaction'],
    description: 'Interaction design, user research and prototyping. Students build a portfolio through studio projects with industry partners.',
  },
  {
    id: 'p9', schoolId: 's4', title: 'Master of Public Health', field: 'Public Health', degreeType: 'MPH',
    country: 'Canada', city: 'Toronto', tuition: 26000, minGpa: 3.0,
    languageReq: { ielts: 7.0, toefl: 100 }, deadline: '2027-01-20', durationMonths: 20,
    tags: ['Epidemiology', 'Policy'],
    description: 'Epidemiology, biostatistics and health policy with a field practicum in a public-health agency.',
  },
  {
    id: 'p10', schoolId: 's2', title: 'M.Sc. Cybersecurity', field: 'Computer Science', degreeType: 'MSc',
    country: 'Germany', city: 'Cologne', tuition: 3000, minGpa: 3.2,
    languageReq: { ielts: 6.5, toefl: 88 }, deadline: '2026-11-01', durationMonths: 24,
    tags: ['Cybersecurity'],
    description: 'Network security, cryptography and secure systems. Admission for the winter intake has closed; listed so students can plan for next year.',
  },
  {
    id: 'p11', schoolId: 's5', title: 'MSc Data Analytics', field: 'Data Science', degreeType: 'MSc',
    country: 'Egypt', city: 'Cairo', tuition: 7500, minGpa: 2.8,
    languageReq: null, deadline: '2027-05-15', durationMonths: 18,
    tags: ['Machine Learning', 'Finance'],
    description: 'Applied analytics with Python and SQL, dashboards and forecasting. No English test needed for graduates of English-taught programs.',
  },
  {
    id: 'p12', schoolId: 's6', title: 'MSc Management & Marketing', field: 'Business', degreeType: 'MSc',
    country: 'Spain', city: 'Barcelona (partner campus)', tuition: 16000, minGpa: 2.8,
    languageReq: { ielts: 6.5, toefl: 85 }, deadline: '2027-04-01', durationMonths: 12,
    tags: ['Marketing', 'Entrepreneurship'],
    description: 'Brand strategy, digital marketing and consumer research, delivered at a partner campus in Barcelona.',
  },
];

/** Demo accounts so the app can be tested without registering. */
export const DEMO_USERS = [
  { id: 'u1', name: 'Demo Student', email: 'student@demo.edu', password: 'Demo1234', role: 'student' },
  { id: 'u2', name: 'Northbridge Admissions', email: 'school@demo.edu', password: 'Demo1234', role: 'school', schoolId: 's1' },
];

export const DEMO_PROFILE = {
  major: 'Computer Science',
  gpa: 3.2,
  ielts: '',
  toefl: '',
  interests: ['Artificial Intelligence', 'Machine Learning'],
  preferredCountries: ['Germany', 'Netherlands', 'United Kingdom'],
  budget: 20000,
};

/** One sample inquiry so the school dashboard is not empty on first run. */
export const MOCK_INQUIRIES = [
  {
    id: 'q-demo', studentId: 'u-sample', studentName: 'Sample Student', programId: 'p1',
    topic: 'Admission requirements', subject: 'Is a CS minor enough?',
    message: 'I am finishing a Mathematics degree with a Computer Science minor. Would that meet the background requirement for the AI program?',
    status: 'Sent', date: '2026-11-10T09:30:00.000Z',
  },
];
