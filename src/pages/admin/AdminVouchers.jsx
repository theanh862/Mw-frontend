import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '@/lib/api'

const EMPTY = {
  code: '', type: 'percent', value: '', minOrderValue: '',
  maxDiscount: '', usageLimit: '', isActive: true, expiresAt: '',
}

export default function AdminVouchers() {
  const { t, i18n } = useTranslation()
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const isVI = i18n.language === 'vi'

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/vouchers')
      setVouchers(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setDialogOpen(true)
  }

  const openEdit = (v) => {
    setEditing(v)
    setForm({
      code: v.code,
      type: v.type,
      value: String(v.value),
      minOrderValue: v.minOrderValue ? String(v.minOrderValue) : '',
      maxDiscount: v.maxDiscount ? String(v.maxDiscount) : '',
      usageLimit: v.usageLimit ? String(v.usageLimit) : '',
      isActive: v.isActive,
      expiresAt: v.expiresAt || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.value) {
      alert(isVI ? 'Vui lòng nhập mã và giá trị giảm.' : 'Please enter code and discount value.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        min_order_value: form.minOrderValue ? Number(form.minOrderValue) : 0,
        max_discount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usage_limit: form.usageLimit ? Number(form.usageLimit) : null,
        is_active: form.isActive,
        expires_at: form.expiresAt || null,
      }
      if (editing) {
        const res = await api.put(`/admin/vouchers/${editing.id}`, payload)
        setVouchers(prev => prev.map(v => v.id === editing.id ? res.data : v))
      } else {
        const res = await api.post('/admin/vouchers', payload)
        setVouchers(prev => [res.data, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      alert(err.response?.data?.message || (isVI ? 'Lỗi khi lưu voucher.' : 'Failed to save voucher.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(isVI ? 'Xóa voucher này?' : 'Delete this voucher?')) return
    try {
      await api.delete(`/admin/vouchers/${id}`)
      setVouchers(prev => prev.filter(v => v.id !== id))
    } catch {
      alert(isVI ? 'Xóa thất bại.' : 'Failed to delete.')
    }
  }

  const handleToggle = async (v) => {
    try {
      const res = await api.put(`/admin/vouchers/${v.id}`, { is_active: !v.isActive })
      setVouchers(prev => prev.map(x => x.id === v.id ? res.data : x))
    } catch {}
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">{isVI ? 'Quản lý Voucher' : 'Voucher Management'}</h2>
          <p className="text-sm text-slate-500">{isVI ? 'Tạo và quản lý mã giảm giá.' : 'Create and manage discount codes.'}</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          {isVI ? 'Tạo voucher' : 'New Voucher'}
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{isVI ? 'Mã' : 'Code'}</TableHead>
                <TableHead>{isVI ? 'Loại' : 'Type'}</TableHead>
                <TableHead>{isVI ? 'Giá trị' : 'Value'}</TableHead>
                <TableHead>{isVI ? 'Đơn tối thiểu' : 'Min Order'}</TableHead>
                <TableHead>{isVI ? 'Lượt dùng' : 'Usage'}</TableHead>
                <TableHead>{isVI ? 'Hết hạn' : 'Expires'}</TableHead>
                <TableHead>{isVI ? 'Trạng thái' : 'Status'}</TableHead>
                <TableHead className="text-center w-28">{isVI ? 'Thao tác' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    {isVI ? 'Chưa có voucher nào.' : 'No vouchers yet.'}
                  </TableCell>
                </TableRow>
              ) : vouchers.map(v => (
                <TableRow key={v.id} className="hover:bg-slate-50">
                  <TableCell>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg text-sm">{v.code}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.type === 'percent' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                      {v.type === 'percent' ? '%' : isVI ? 'Cố định' : 'Fixed'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    {v.type === 'percent' ? `${v.value}%${v.maxDiscount ? ` (max ${formatPrice(v.maxDiscount)})` : ''}` : formatPrice(v.value)}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{v.minOrderValue > 0 ? formatPrice(v.minOrderValue) : '—'}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {v.usedCount}{v.usageLimit ? `/${v.usageLimit}` : ''}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{v.expiresAt || '—'}</TableCell>
                  <TableCell>
                    <button onClick={() => handleToggle(v)} className="flex items-center gap-1 text-xs font-semibold">
                      {v.isActive
                        ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">{isVI ? 'Bật' : 'Active'}</span></>
                        : <><ToggleLeft className="w-5 h-5 text-slate-400" /><span className="text-slate-400">{isVI ? 'Tắt' : 'Inactive'}</span></>
                      }
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} className="text-slate-500 hover:text-indigo-600 hover:bg-slate-100">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              {editing ? (isVI ? 'Sửa voucher' : 'Edit Voucher') : (isVI ? 'Tạo voucher mới' : 'New Voucher')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isVI ? 'Mã voucher' : 'Voucher Code'} *</Label>
                <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="SALE20" className="font-mono uppercase rounded-xl" disabled={!!editing} />
              </div>
              <div className="space-y-1.5">
                <Label>{isVI ? 'Loại giảm' : 'Discount Type'}</Label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="percent">{isVI ? 'Phần trăm (%)' : 'Percent (%)'}</option>
                  <option value="fixed">{isVI ? 'Cố định (VND)' : 'Fixed (VND)'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isVI ? 'Giá trị' : 'Value'} * {form.type === 'percent' ? '(%)' : '(VND)'}</Label>
                <Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                  placeholder={form.type === 'percent' ? '10' : '50000'} className="rounded-xl" />
              </div>
              {form.type === 'percent' && (
                <div className="space-y-1.5">
                  <Label>{isVI ? 'Giảm tối đa (VND)' : 'Max Discount (VND)'}</Label>
                  <Input type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))}
                    placeholder="200000" className="rounded-xl" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{isVI ? 'Đơn tối thiểu (VND)' : 'Min Order (VND)'}</Label>
                <Input type="number" value={form.minOrderValue} onChange={e => setForm(p => ({ ...p, minOrderValue: e.target.value }))}
                  placeholder="0" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>{isVI ? 'Giới hạn lượt dùng' : 'Usage Limit'}</Label>
                <Input type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))}
                  placeholder={isVI ? 'Không giới hạn' : 'Unlimited'} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{isVI ? 'Ngày hết hạn' : 'Expiry Date'}</Label>
              <Input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                className="rounded-xl" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600" />
              {isVI ? 'Kích hoạt ngay' : 'Active immediately'}
            </label>

            <Button onClick={handleSave} disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? (isVI ? 'Đang lưu...' : 'Saving...') : (isVI ? 'Lưu voucher' : 'Save Voucher')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
