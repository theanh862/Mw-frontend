import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'

export default function LoginModal({ open, onOpenChange }) {
  const { t } = useTranslation()
  const { login, emailLogin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await emailLogin(email, password)
    setLoading(false)
    if (result.success) {
      onOpenChange(false)
    } else {
      setError(result.message)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      })
      const { user: userData, token: userToken } = response.data
      login(userData, userToken)
      onOpenChange(false)
    } catch (err) {
      setError(t('login.google_failed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">{t('login.title')}</DialogTitle>
          <DialogDescription>{t('login.desc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('login.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('login.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <LogIn className="w-4 h-4" />
            {loading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">{t('login.or_with')}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('login.google_failed'))}
            theme="outline"
            size="large"
            shape="rectangular"
            text="signin_with"
            width="100%"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
