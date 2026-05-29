import { useState, useEffect, useRef, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, BotMessageSquare, MessageSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { ListSkeleton } from '../components/Skeleton'
import { useDebounce } from '../hooks/useDebounce'
import { faqs as faqApi } from '../lib/api'
import type { FaqItem } from '../types'

// ── Pleasant palette ──
const C = {
  bg:         '#f0f4f8',      // soft blue-grey page bg
  card:       '#ffffff',      // white cards
  cardHover:  '#fafbff',      // slightly lavender on hover
  border:     'rgba(99,102,241,0.12)',  // soft indigo border
  borderOpen: 'rgba(99,102,241,0.28)',  // stronger when open
  accent:     '#6366f1',      // indigo-500 accent
  accentSoft: 'rgba(99,102,241,0.08)',
  accentGlow: 'rgba(99,102,241,0.18)',
  text:       '#1e1b4b',      // deep indigo text
  textMid:    '#4338ca',      // mid indigo
  textSoft:   '#6b7280',      // muted grey
  textPale:   '#9ca3af',      // pale grey
  shadow:     'rgba(99,102,241,0.08)',
  shadowOpen: 'rgba(99,102,241,0.16)',
  sectionBg:  '#ede9fe',      // soft violet section header
  sectionBorder: 'rgba(139,92,246,0.18)',
  sectionText:   '#5b21b6',   // deep violet
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function useMeasure(ref: React.RefObject<HTMLElement | null>) {
  const [h, setH] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const o = new ResizeObserver(e => setH(e[0].contentRect.height))
    o.observe(ref.current)
    return () => o.disconnect()
  }, [ref])
  return h
}

// ── Single question row ──
function FAQRow({ item, query, isOpen, onToggle }: {
  item: FaqItem; query: string; isOpen: boolean; onToggle: () => void
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const measuredH = useMeasure(bodyRef)

  return (
    <motion.div
      className="overflow-hidden rounded-2xl"
      style={{
        background: isOpen ? C.cardHover : C.card,
        border: `1.5px solid ${isOpen ? C.borderOpen : C.border}`,
        boxShadow: isOpen
          ? `0 4px 20px ${C.shadowOpen}`
          : `0 1px 4px ${C.shadow}`,
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left gap-3 rounded-2xl"
        onClick={onToggle}
        style={{ background: 'transparent' }}
      >
        <div className="flex-1 min-w-0 pr-2">
          <h4
            className="text-sm font-medium leading-snug text-left"
            style={{ color: isOpen ? C.textMid : C.text }}
            dangerouslySetInnerHTML={{ __html: highlight(item.title, query) }}
          />
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
          style={{
            background: isOpen ? C.accentSoft : 'rgba(0,0,0,0.04)',
          }}
        >
          <ChevronDown
            size={14}
            style={{ color: isOpen ? C.accent : C.textPale }}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: measuredH || 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div ref={bodyRef} className="px-4 pb-4" style={{ borderTop: `1.5px solid ${C.border}` }}>
              <p
                className="pt-3 text-sm leading-relaxed"
                style={{ color: C.textSoft }}
                dangerouslySetInnerHTML={{ __html: highlight(item.body, query) }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Section header ──
function CategorySection({ title, icon, count, isOpen, onToggle, children }: {
  title: string; icon: string; count: number;
  isOpen: boolean; onToggle: () => void;
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl mb-2.5 transition-all"
        style={{
          background: isOpen ? C.sectionBg : 'rgba(237,233,254,0.4)',
          border: `1.5px solid ${isOpen ? C.sectionBorder : 'rgba(139,92,246,0.08)'}`,
          boxShadow: isOpen ? '0 3px 12px rgba(139,92,246,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isOpen ? 'rgba(139,92,246,0.14)' : 'rgba(139,92,246,0.07)',
              border: `1px solid rgba(139,92,246,${isOpen ? 0.25 : 0.12})`,
            }}
          >
            <span className="text-base">{icon}</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm" style={{ color: C.sectionText }}>{title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(91,33,182,0.5)' }}>
              {count} question{count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isOpen ? 'rgba(139,92,246,0.16)' : 'rgba(0,0,0,0.04)' }}
        >
          <ChevronDown
            size={15}
            style={{ color: isOpen ? '#7c3aed' : C.textPale }}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pl-5 ml-3 space-y-2" style={{ borderLeft: `2px solid rgba(139,92,246,0.12)` }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CATEGORY_ICONS: Record<string, string> = {
  'NOC': '📋',
  'Samagama': '🗂️',
  'Internship': '💼',
  'Feedback': '⭐',
  'SP Points': '🏆',
  'Doubt Solver': '❓',
  'Zoro': '🤖',
}

export const FAQPage = memo(function FAQPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['NOC']))
  const debouncedQuery = useDebounce(query, 150)
  const navigate = useNavigate()

  useEffect(() => {
    faqApi.list()
      .then(({ data }) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category))).sort((a, b) => {
      if (a === 'NOC') return -1
      if (b === 'NOC') return 1
      return a.localeCompare(b)
    })
    return ['All', ...cats]
  }, [items])

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, FaqItem[]> = {}
    for (const item of items) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [items])

  const filteredByCategory = useMemo(() => {
    if (!debouncedQuery) return null
    const q = debouncedQuery.toLowerCase()
    const groups: Record<string, FaqItem[]> = {}
    for (const item of items) {
      if (item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)) {
        if (!groups[item.category]) groups[item.category] = []
        groups[item.category].push(item)
      }
    }
    return groups
  }, [items, debouncedQuery])

  const visibleCategories = useMemo(() => {
    if (category !== 'All') {
      return [{ cat: category, items: groupedByCategory[category] || [] }]
    }
    return Object.entries(groupedByCategory)
      .sort(([a], [b]) => {
        if (a === 'NOC') return -1
        if (b === 'NOC') return 1
        return a.localeCompare(b)
      })
      .map(([cat, catItems]) => ({ cat, items: catItems }))
  }, [category, groupedByCategory])

  const searchCategories = useMemo(() => {
    if (!debouncedQuery || !filteredByCategory) return null
    return Object.entries(filteredByCategory)
      .filter(([, catItems]) => catItems.length > 0)
      .sort(([a], [b]) => {
        if (a === 'NOC') return -1
        if (b === 'NOC') return 1
        return a.localeCompare(b)
      })
      .map(([cat, catItems]) => ({ cat, items: catItems }))
  }, [debouncedQuery, filteredByCategory])

  const displayCategories = debouncedQuery ? searchCategories : visibleCategories

  const totalVisible = useMemo(() => {
    if (!displayCategories) return 0
    return displayCategories.reduce((sum, { items: catItems }) => sum + catItems.length, 0)
  }, [displayCategories])

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const handleToggle = (id: number) => setOpenId(prev => (prev === id ? null : id))

  return (
    <PageTransition>
      <div
        className="px-6 py-8 max-w-3xl mx-auto"
        style={{ minHeight: '100vh', background: C.bg }}
      >

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: C.text }}>
            Frequently Asked Questions
          </h2>
          <p className="text-sm" style={{ color: C.textSoft }}>
            {items.length} questions across {categories.length - 1} topics
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-7">
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
            style={{
              background: C.card,
              border: query ? `1.5px solid ${C.accent}` : `1.5px solid ${C.border}`,
              boxShadow: query ? `0 0 0 3px ${C.accentGlow}` : `0 1px 4px ${C.shadow}`,
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={17} style={{ color: C.textPale, flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: C.text }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ color: C.textPale }}
                className="hover:text-gray-400 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-7 overflow-x-auto pb-1.5 -mx-1 px-1">
          {categories.map(cat => {
            const isActive = category === cat
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat)
                  setOpenId(null)
                  if (cat === 'All') setOpenSections(new Set())
                  else setOpenSections(new Set([cat]))
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  boxShadow: '0 3px 10px rgba(99,102,241,0.35)',
                  border: '1px solid rgba(99,102,241,0.4)',
                } : {
                  background: C.card,
                  color: C.textSoft,
                  border: `1.5px solid ${C.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs mb-5" style={{ color: C.textPale }}>
            {totalVisible === 0
              ? 'No results found'
              : `${totalVisible} question${totalVisible !== 1 ? 's' : ''}`}
            {debouncedQuery && ` for "${debouncedQuery}"`}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && <ListSkeleton count={6} />}

        {/* Category sections */}
        {!loading && displayCategories && displayCategories.map(({ cat, items: catItems }) => {
          if (catItems.length === 0) return null
          return (
            <CategorySection
              key={cat}
              title={cat}
              icon={CATEGORY_ICONS[cat] ?? '📌'}
              count={catItems.length}
              isOpen={openSections.has(cat)}
              onToggle={() => toggleSection(cat)}
            >
              {catItems.map(item => (
                <FAQRow
                  key={item.id}
                  item={item}
                  query={debouncedQuery}
                  isOpen={openId === item.id}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </CategorySection>
          )
        })}

        {/* Empty state */}
        {!loading && totalVisible === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
                border: '1.5px solid rgba(99,102,241,0.15)',
              }}
            >
              <Search size={36} style={{ color: C.accent, opacity: 0.6 }} />
            </div>
            <p className="font-medium text-sm mb-1.5" style={{ color: C.textMid }}>No FAQs match your search</p>
            <p className="text-xs mb-8 max-w-xs" style={{ color: C.textPale }}>
              Try different keywords or browse by category
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setQuery(''); setCategory('All') }}
                className="px-5 py-2.5 rounded-full text-xs font-medium border transition-all"
                style={{
                  borderColor: C.border,
                  color: C.textSoft,
                  background: C.card,
                }}
              >
                Clear filters
              </button>
              <button
                onClick={() => navigate('/zoro')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 3px 10px rgba(99,102,241,0.35)',
                }}
              >
                <BotMessageSquare size={13} /> Ask Zoro
              </button>
            </div>
          </motion.div>
        )}

        {/* Still stuck */}
        {!loading && totalVisible > 0 && (
          <motion.div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
              border: '1.5px solid rgba(99,102,241,0.15)',
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          >
            <p className="text-sm mb-4" style={{ color: C.textMid }}>Still have questions?</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => navigate('/zoro')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
                }}
              >
                <BotMessageSquare size={14} /> Ask Zoro
              </button>
              <button
                onClick={() => navigate('/doubts')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all"
                style={{
                  borderColor: C.border,
                  color: C.textMid,
                  background: 'rgba(255,255,255,0.6)',
                }}
              >
                <MessageSquare size={14} /> Raise a Doubt
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
})

export default FAQPage