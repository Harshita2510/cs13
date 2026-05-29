import type { Answer, AnswerStatus, Doubt, User } from '../types'

const DOUBTS_KEY = 'zoro_mock_doubts'
const USERS_KEY = 'zoro_mock_users'
const STORE_EVENT = 'zoro_mock_store_changed'
const ANSWER_SP_REWARD = 10

export interface AdminAnswer extends Answer {
  question: string
  question_body: string
}

export const demoCredentials = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' as const, username: 'admin@example.com', label: 'Admin' },
  { email: 'demo@example.com', password: 'user123', role: 'user' as const, username: 'Demo Student', label: 'Demo' },
  { email: 'arushi@example.com', password: 'user123', role: 'user' as const, username: 'Arushi Rao', label: 'Arushi' },
  { email: 'rahul@example.com', password: 'user123', role: 'user' as const, username: 'Rahul Mehta', label: 'Rahul' },
  { email: 'neha@example.com', password: 'user123', role: 'user' as const, username: 'Neha Gupta', label: 'Neha' },
  { email: 'priya@example.com', password: 'user123', role: 'user' as const, username: 'Priya Sharma', label: 'Priya' },
  { email: 'amit@example.com', password: 'user123', role: 'user' as const, username: 'Amit Verma', label: 'Amit' },
]

const seedUsers: User[] = [
  { id: 1, username: 'admin@example.com', role: 'admin', sp_points: 0, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 2, username: 'Demo Student', role: 'user', sp_points: 20, created_at: '2026-01-08T00:00:00.000Z' },
  { id: 3, username: 'Arushi Rao', role: 'user', sp_points: 30, created_at: '2026-01-10T00:00:00.000Z' },
  { id: 4, username: 'Rahul Mehta', role: 'user', sp_points: 10, created_at: '2026-01-12T00:00:00.000Z' },
  { id: 5, username: 'Neha Gupta', role: 'user', sp_points: 15, created_at: '2026-01-15T00:00:00.000Z' },
  { id: 6, username: 'Priya Sharma', role: 'user', sp_points: 0, created_at: '2026-01-18T00:00:00.000Z' },
  { id: 7, username: 'Amit Verma', role: 'user', sp_points: 5, created_at: '2026-01-20T00:00:00.000Z' },
]

const seedDoubts: Doubt[] = [
  {
    id: 101,
    title: 'How do I download my NPTEL assignment certificate?',
    body: 'I completed all weekly assignments but cannot find the certificate download option.',
    category: 'NPTEL',
    status: 'open',
    creator_id: 2,
    creator_name: 'Demo Student',
    created_at: '2026-05-20T10:30:00.000Z',
    answers: [
      {
        id: 1001,
        doubt_id: 101,
        body: 'Open the course dashboard, go to Progress, and use the certificate download link after the final score is published.',
        creator_id: 3,
        creator_name: 'Arushi Rao',
        upvotes: 3,
        is_accepted: 0,
        status: 'pending',
        created_at: '2026-05-20T12:10:00.000Z',
      },
      {
        id: 1002,
        doubt_id: 101,
        body: 'Certificates are usually released only after exam results are finalized, so the link may appear later.',
        creator_id: 4,
        creator_name: 'Rahul Mehta',
        upvotes: 5,
        is_accepted: 0,
        status: 'approved',
        sp_awarded: true,
        created_at: '2026-05-21T09:00:00.000Z',
      },
    ],
  },
  {
    id: 102,
    title: 'Can multiple people answer the same doubt?',
    body: 'I want to understand whether a discussion can have more than one answer from different users.',
    category: 'Community',
    status: 'open',
    creator_id: 3,
    creator_name: 'Arushi Rao',
    created_at: '2026-05-22T11:00:00.000Z',
    answers: [
      {
        id: 1003,
        doubt_id: 102,
        body: 'Yes. A question can collect multiple answers, and each answer can be reviewed separately by an admin.',
        creator_id: 2,
        creator_name: 'Demo Student',
        upvotes: 1,
        is_accepted: 0,
        status: 'approved',
        sp_awarded: true,
        created_at: '2026-05-22T12:40:00.000Z',
      },
      {
        id: 1004,
        doubt_id: 102,
        body: 'Only the first response should count because otherwise people may spam answers.',
        creator_id: 4,
        creator_name: 'Rahul Mehta',
        upvotes: 0,
        is_accepted: 0,
        status: 'rejected',
        created_at: '2026-05-22T13:15:00.000Z',
      },
    ],
  },
  {
    id: 103,
    title: 'Where can I find weekly lecture transcripts?',
    body: 'The video lectures are available, but I need text transcripts for revision.',
    category: 'Course Content',
    status: 'open',
    creator_id: 4,
    creator_name: 'Rahul Mehta',
    created_at: '2026-05-24T14:20:00.000Z',
    answers: [],
  },
]

function readJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event(STORE_EVENT))
}

function nextId(existingIds: number[]) {
  return existingIds.length ? Math.max(...existingIds) + 1 : 1
}

export function onMockStoreChange(callback: () => void) {
  window.addEventListener(STORE_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(STORE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function getUsers() {
  const savedUsers = readJson<User[]>(USERS_KEY, seedUsers)
  const mergedUsers = [
    ...savedUsers,
    ...seedUsers.filter(seedUser => !savedUsers.some(savedUser => savedUser.id === seedUser.id)),
  ]

  if (mergedUsers.length !== savedUsers.length) {
    saveUsers(mergedUsers)
  }

  return mergedUsers
}

export function saveUsers(users: User[]) {
  writeJson(USERS_KEY, users)
}

export function findUserByCredential(email: string, password: string) {
  const credential = demoCredentials.find(item => item.email === email && item.password === password)
  if (!credential) return null

  return getUsers().find(user => user.username === credential.username && user.role === credential.role) ?? null
}

export function getDoubts() {
  return readJson<Doubt[]>(DOUBTS_KEY, seedDoubts)
}

export function saveDoubts(doubts: Doubt[]) {
  writeJson(DOUBTS_KEY, doubts)
}

export function getDoubt(id: number) {
  return getDoubts().find(doubt => doubt.id === id) ?? null
}

export function createDoubt(title: string, body: string, user: User) {
  const doubts = getDoubts()
  const doubt: Doubt = {
    id: nextId(doubts.map(item => item.id)),
    title,
    body,
    category: 'Community',
    status: 'open',
    creator_id: user.id,
    creator_name: user.username,
    created_at: new Date().toISOString(),
    answers: [],
  }

  saveDoubts([doubt, ...doubts])
  return doubt
}

export function createAnswer(doubtId: number, body: string, user: User) {
  const doubts = getDoubts()
  const allAnswerIds = doubts.flatMap(doubt => doubt.answers.map(answer => answer.id))
  const answer: Answer = {
    id: nextId(allAnswerIds),
    doubt_id: doubtId,
    body,
    creator_id: user.id,
    creator_name: user.username,
    upvotes: 0,
    is_accepted: 0,
    status: 'pending',
    created_at: new Date().toISOString(),
  }

  saveDoubts(doubts.map(doubt => doubt.id === doubtId ? { ...doubt, answers: [...doubt.answers, answer] } : doubt))
  return answer
}

export function updateAnswerStatus(answerId: number, status: AnswerStatus): Answer | null {
  let updatedAnswer: Answer | null = null
  let rewardUserId: number | null = null

  const doubts = getDoubts().map(doubt => ({
    ...doubt,
    answers: doubt.answers.map(answer => {
      if (answer.id !== answerId) return answer

      const shouldAwardSp = status === 'approved' && !answer.sp_awarded
      updatedAnswer = {
        ...answer,
        status,
        sp_awarded: answer.sp_awarded || shouldAwardSp,
      }
      if (shouldAwardSp) rewardUserId = answer.creator_id
      return updatedAnswer
    }),
  }))

  if (!updatedAnswer) return null

  saveDoubts(doubts)

  if (rewardUserId !== null) {
    saveUsers(getUsers().map(user => (
      user.id === rewardUserId ? { ...user, sp_points: user.sp_points + ANSWER_SP_REWARD } : user
    )))
  }

  return updatedAnswer
}

export function getAdminAnswers(): AdminAnswer[] {
  return getDoubts().flatMap(doubt => doubt.answers.map(answer => ({
    ...answer,
    question: doubt.title,
    question_body: doubt.body,
  })))
}

export function resolveDoubt(id: number) {
  const doubts = getDoubts()
  saveDoubts(doubts.map(doubt => doubt.id === id ? { ...doubt, status: 'resolved' } : doubt))
}

export function upvoteAnswer(answerId: number) {
  const doubts = getDoubts()
  saveDoubts(doubts.map(doubt => ({
    ...doubt,
    answers: doubt.answers.map(answer => (
      answer.id === answerId ? { ...answer, upvotes: answer.upvotes + 1 } : answer
    )),
  })))
}
