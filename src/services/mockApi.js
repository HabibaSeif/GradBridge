/**
 * MOCK API — Milestone 1.
 * Simulates network latency and (optionally) failures so the UI can show
 * loading, error and success states. Data lives in localStorage.
 * In Milestone 2 these functions will call the real REST API instead.
 */
import { MOCK_PROGRAMS, MOCK_SCHOOLS, MOCK_INQUIRIES, DEMO_USERS, DEMO_PROFILE } from '../data/mockPrograms';

const DELAY_MS = 500;
const KEYS = {
  programs: 'gb_programs',
  users: 'gb_users',
  profiles: 'gb_profiles',
  saved: 'gb_saved',
  inquiries: 'gb_inquiries',
  failMode: 'gb_fail_mode',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: data stays in memory for this request only */
  }
}

/** Dev toggle (footer) that makes every mock request fail. */
export const failMode = {
  get: () => read(KEYS.failMode, false),
  set: (v) => write(KEYS.failMode, v),
};

function request(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failMode.get()) {
        reject(new Error('Could not reach the server. Please check your connection and try again.'));
        return;
      }
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, DELAY_MS);
  });
}

const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const getPrograms = () => read(KEYS.programs, MOCK_PROGRAMS);
const getUsers = () => read(KEYS.users, DEMO_USERS);
const withSchool = (p) => ({ ...p, school: MOCK_SCHOOLS.find((s) => s.id === p.schoolId) });
const publicUser = ({ password: _pw, ...rest }) => rest;

export const api = {
  // ---------- Auth ----------
  login: ({ email, password }) =>
    request(() => {
      const user = getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) throw new Error('Email or password is incorrect.');
      return publicUser(user);
    }),

  register: ({ name, email, password, role, schoolName }) =>
    request(() => {
      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists. Try logging in instead.');
      }
      const user = { id: uid('u'), name, email, password, role };
      if (role === 'school') {
        // New schools are linked to the first mock school record so the dashboard has data.
        user.schoolId = 's1';
        user.schoolName = schoolName;
      }
      write(KEYS.users, [...users, user]);
      return publicUser(user);
    }),

  // ---------- Programs ----------
  listPrograms: () => request(() => getPrograms().map(withSchool)),

  getProgram: (id) =>
    request(() => {
      const p = getPrograms().find((x) => x.id === id);
      if (!p) throw new Error('NOT_FOUND');
      return withSchool(p);
    }),

  saveProgram: (program) =>
    request(() => {
      const programs = getPrograms();
      if (program.id) {
        write(KEYS.programs, programs.map((p) => (p.id === program.id ? { ...p, ...program } : p)));
        return program;
      }
      const created = { ...program, id: uid('p') };
      write(KEYS.programs, [...programs, created]);
      return created;
    }),

  deleteProgram: (id) => request(() => write(KEYS.programs, getPrograms().filter((p) => p.id !== id))),

  // ---------- Student profile ----------
  getProfile: (userId) =>
    request(() => {
      const all = read(KEYS.profiles, {});
      if (all[userId]) return all[userId];
      return userId === 'u1' ? DEMO_PROFILE : null;
    }),

  updateProfile: (userId, profile) =>
    request(() => {
      const all = read(KEYS.profiles, {});
      write(KEYS.profiles, { ...all, [userId]: profile });
      return profile;
    }),

  /** Simulated CV parsing. Milestone 2: LLM extracts these fields from the file. */
  parseCv: (file) =>
    request(() => {
      if (!file) throw new Error('No file selected.');
      return {
        major: 'Computer Science',
        gpa: 3.4,
        ielts: 7.0,
        interests: ['Machine Learning', 'Software Engineering'],
      };
    }),

  // ---------- Saved programs ----------
  getSaved: (userId) => request(() => read(KEYS.saved, {})[userId] || []),

  toggleSaved: (userId, programId) =>
    request(() => {
      const all = read(KEYS.saved, {});
      const list = all[userId] || [];
      const exists = list.find((s) => s.programId === programId);
      const next = exists
        ? list.filter((s) => s.programId !== programId)
        : [...list, { programId, dateSaved: new Date().toISOString() }];
      write(KEYS.saved, { ...all, [userId]: next });
      return next;
    }),

  // ---------- Inquiries ----------
  listInquiries: ({ studentId, schoolId } = {}) =>
    request(() => {
      const programs = getPrograms();
      return read(KEYS.inquiries, MOCK_INQUIRIES)
        .filter((q) => (studentId ? q.studentId === studentId : true))
        .filter((q) => (schoolId ? programs.find((p) => p.id === q.programId)?.schoolId === schoolId : true))
        .map((q) => ({ ...q, program: programs.find((p) => p.id === q.programId) }))
        .sort((a, b) => b.date.localeCompare(a.date));
    }),

  sendInquiry: (inquiry) =>
    request(() => {
      const created = { ...inquiry, id: uid('q'), status: 'Sent', date: new Date().toISOString() };
      write(KEYS.inquiries, [...read(KEYS.inquiries, MOCK_INQUIRIES), created]);
      return created;
    }),

  answerInquiry: (id, reply) =>
    request(() => {
      const all = read(KEYS.inquiries, MOCK_INQUIRIES);
      write(KEYS.inquiries, all.map((q) => (q.id === id ? { ...q, reply, status: 'Answered' } : q)));
    }),
};

export function resetMockData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
