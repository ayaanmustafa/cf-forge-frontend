import { useState, useEffect } from 'react'

export const useNotification = () => {
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  return { notification, showNotification }
}

const Notification = ({ notification }) => {
  if (!notification) return null

  const bgColor = notification.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
  const borderColor = notification.type === 'success' ? 'border-emerald-500/30' : 'border-rose-500/30'
  const textColor = notification.type === 'success' ? 'text-emerald-400' : 'text-rose-400'

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} border ${borderColor} ${textColor} p-4 rounded-lg max-w-sm z-50 animate-pulse`}>
      {notification.message}
    </div>
  )
}

export default Notification
