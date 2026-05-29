// User
export interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  sp_points: number
  created_at: string
}

// FAQ
export interface FaqItem {
  id: number
  title: string
  body: string
  category: string
  keywords: string
  helpful_votes: number
  unhelpful_votes: number
  created_at: string
}

// Answer
export type AnswerStatus = 'pending' | 'approved' | 'rejected'

export interface Answer {
  id: number
  doubt_id: number
  body: string
  creator_id: number
  creator_name: string
  upvotes: number
  is_accepted: number
  status: AnswerStatus
  created_at: string
  sp_awarded?: boolean
}

// Doubt
export interface Doubt {
  id: number
  title: string
  body: string
  category: string
  status: 'open' | 'resolved'
  creator_id: number
  creator_name: string
  created_at: string
  // Local-only
  answers: Answer[]
}

// Chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  thumbsUp?: boolean
  thumbsDown?: boolean
}

// Announcement
export interface Announcement {
  id: number
  title: string
  body: string
  created_by: number
  creator_name: string
  created_at: string
}
