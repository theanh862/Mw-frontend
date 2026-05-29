import React, { useEffect, useRef, useState } from 'react'
import { Bell, Package, RotateCcw, CheckCircle, X, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'

const TYPE_ICON = {
  order_placed:      <Package className="w-4 h-4 text-indigo-500" />,
  order_status:      <Package className="w-4 h-4 text-blue-500" />,
  return_requested:  <RotateCcw className="w-4 h-4 text-orange-500" />,
  return_processed:  <RotateCcw className="w-4 h-4 text-green-500" />,
  refund_completed:  <CheckCircle className="w-4 h-4 text-teal-500" />,
}

function timeAgo(dateStr, lang) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return lang === 'vi' ? 'Vừa xong' : 'Just now'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return lang === 'vi' ? `${m} phút trước` : `${m}m ago`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return lang === 'vi' ? `${h} giờ trước` : `${h}h ago`
  }
  const d = Math.floor(diff / 86400)
  return lang === 'vi' ? `${d} ngày trước` : `${d}d ago`
}

export default function NotificationBell({ variant = 'dark' }) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
      setUnread(res.data.unread_count)
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
  }

  const handleClick = async (n) => {
    if (!n.read) {
      try {
        await api.post(`/notifications/${n.id}/read`)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
        setUnread(u => Math.max(0, u - 1))
      } catch {}
    }
    if (n.data?.order_id) {
      navigate('/orders')
      setOpen(false)
    }
  }

  const handleMarkAll = async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifications(prev => prev.map(x => ({ ...x, read: true })))
      setUnread(0)
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className={`relative p-2 transition-colors focus:outline-none ${
          variant === 'light'
            ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg'
            : 'text-slate-300 hover:text-[#ffd400]'
        }`}
      >
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-0.5">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-extrabold text-slate-800 text-sm">
              {i18n.language === 'vi' ? 'Thông báo' : 'Notifications'}
            </span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {i18n.language === 'vi' ? 'Đọc tất cả' : 'Mark all read'}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                {i18n.language === 'vi' ? 'Chưa có thông báo nào' : 'No notifications yet'}
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {TYPE_ICON[n.type] ?? <Bell className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-300 mt-1">{timeAgo(n.createdAt, i18n.language)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
