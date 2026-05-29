import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, Mail, Save, CheckCircle, LogIn, Loader2, Pencil, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoginModal from '@/components/shop/LoginModal'
import AddressSelector from '@/components/shop/AddressSelector'

export default function Profile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [loginOpen, setLoginOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [address, setAddress] = useState({ fullAddress: '', districtId: null, wardCode: null })
  const [editingAddress, setEditingAddress] = useState(!user?.address)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleAddressChange = useCallback((addr) => {
    setAddress(addr)
    setSaved(false)
  }, [])

  if (!user) {
    return (
      <>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-amber-50 text-amber-500 rounded-full mb-6">
              <LogIn className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{t('common.login_required')}</h2>
            <p className="text-slate-500 text-sm mb-8">{t('profile.login_required_desc')}</p>
            <Button className="w-full bg-slate-900 font-bold py-6 rounded-2xl gap-2" onClick={() => setLoginOpen(true)}>
              <LogIn className="w-4 h-4" />
              {t('checkout.login_now')}
            </Button>
          </div>
        </div>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    )
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError(t('profile.name_required'))
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...formData,
        address: address.fullAddress || user?.address || '',
      }
      await updateProfile(payload)
      setSaved(true)
      setEditingAddress(false)
      setAddress({ fullAddress: '', districtId: null, wardCode: null })
    } catch (err) {
      setError(err.response?.data?.message || t('profile.save_error'))
    } finally {
      setLoading(false)
    }
  }

  const initials = user.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || 'U'

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">{t('profile.title')}</h1>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-8 flex items-center gap-6">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white/30 object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center text-white text-2xl font-black">
                {initials}
              </div>
            )}
            <div>
              <p className="text-white font-extrabold text-xl leading-tight">{user.name}</p>
              <p className="text-indigo-200 text-sm mt-1">{user.email}</p>
              <span className="mt-2 inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                {user.role || 'customer'}
              </span>
            </div>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-slate-700 font-semibold">
                <User className="w-4 h-4 text-indigo-500" />
                {t('profile.fullname')}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('profile.fullname_placeholder')}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 font-semibold">
                <Mail className="w-4 h-4 text-indigo-500" />
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">{t('profile.email_readonly')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700 font-semibold">
                <Phone className="w-4 h-4 text-indigo-500" />
                {t('profile.phone')}
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold">
                <MapPin className="w-4 h-4 text-indigo-500" />
                {t('profile.address')}
              </Label>
              {user?.address && !editingAddress ? (
                <div className="flex items-start justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-700 leading-relaxed">{user.address}</p>
                  <button
                    type="button"
                    onClick={() => setEditingAddress(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 mt-0.5"
                  >
                    <Pencil className="w-3 h-3" />
                    {t('profile.edit_address') || 'Sửa'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AddressSelector value={{ street: '' }} onChange={handleAddressChange} />
                  {user?.address && (
                    <button
                      type="button"
                      onClick={() => { setEditingAddress(false); setAddress({ fullAddress: '', districtId: null, wardCode: null }) }}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                      {t('profile.cancel_edit') || 'Hủy thay đổi'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</p>
            )}

            {saved && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-100 px-4 py-3 rounded-xl text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {t('profile.saved_success')}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? t('profile.saving') : t('profile.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/orders')}
                className="border-slate-300 text-slate-700 font-bold py-6 rounded-2xl px-6"
              >
                {t('nav.my_orders')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
