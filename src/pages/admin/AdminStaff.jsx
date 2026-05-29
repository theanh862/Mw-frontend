import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, Search, Loader2, ShieldCheck, Mail, User, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import api from '@/lib/api'

export default function AdminStaff() {
  const { t } = useTranslation()
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/staff')
      setStaffList(response.data)
    } catch (err) {
      console.error('Fetch staff error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.staff.confirm_delete'))) {
      try {
        await api.delete(`/admin/staff/${id}`)
        setStaffList(prev => prev.filter(item => item.id !== id))
        alert(t('admin.staff.delete_success'))
      } catch (err) {
        console.error('Delete staff error:', err)
        alert(err.response?.data?.message || t('admin.staff.delete_fail'))
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || (!editingStaff && !formData.password)) {
      alert(t('admin.staff.fill_required'))
      return
    }

    try {
      if (editingStaff) {
        const payload = { name: formData.name, email: formData.email }
        if (formData.password) payload.password = formData.password

        const response = await api.put(`/admin/staff/${editingStaff.id}`, payload)
        const updated = response.data.staff

        setStaffList(prev => prev.map(item => item.id === editingStaff.id ? updated : item))
        alert(t('admin.staff.update_success'))
      } else {
        const response = await api.post('/admin/staff', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
        const created = response.data.staff

        setStaffList(prev => [created, ...prev])
        alert(t('admin.staff.add_success'))
      }

      handleCloseDialog()
    } catch (err) {
      console.error('Submit staff error:', err)
      alert(err.response?.data?.message || t('admin.staff.save_fail'))
    }
  }

  const handleEditClick = (staff) => {
    setEditingStaff(staff)
    setFormData({ name: staff.name, email: staff.email, password: '' })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingStaff(null)
    setFormData({ name: '', email: '', password: '' })
  }

  const handleDialogOpenChange = (open) => {
    if (!open) handleCloseDialog()
    else setIsDialogOpen(true)
  }

  const filteredStaff = staffList.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">{t('admin.staff.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">{t('admin.staff.title')}</h2>
          <p className="text-sm text-slate-500">{t('admin.staff.subtitle')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold gap-2 py-5 rounded-xl shadow-md">
              <Plus className="w-5 h-5" /> {t('admin.staff.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingStaff ? t('admin.staff.edit_title') : t('admin.staff.add_title')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.staff.field_name')}</Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    required
                    className="pl-10"
                  />
                  <User className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('admin.staff.field_email')}</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nhanvien@example.com"
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingStaff ? t('admin.staff.field_password_edit') : t('admin.staff.field_password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingStaff ? '••••••••' : t('admin.staff.password_placeholder')}
                    required={!editingStaff}
                    className="pl-10"
                  />
                  <Lock className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>{t('common.cancel')}</Button>
                <Button type="submit" className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold px-6">
                  {editingStaff ? t('admin.staff.btn_save') : t('admin.staff.btn_create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex max-w-md relative">
        <Input
          type="text"
          placeholder={t('admin.staff.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
        <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16">{t('admin.staff.col_avatar')}</TableHead>
              <TableHead>{t('admin.staff.col_staff')}</TableHead>
              <TableHead>{t('admin.staff.col_email')}</TableHead>
              <TableHead>{t('admin.staff.col_role')}</TableHead>
              <TableHead>{t('admin.staff.col_date')}</TableHead>
              <TableHead className="w-24 text-center">{t('admin.staff.col_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  {t('admin.staff.no_staff')}
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-slate-50">
                  <TableCell>
                    {staff.avatar ? (
                      <img src={staff.avatar} alt={staff.name} className="w-10 h-10 object-cover rounded-full border border-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 border border-indigo-100 font-bold">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">{staff.name}</TableCell>
                  <TableCell className="text-slate-500 font-medium">{staff.email}</TableCell>
                  <TableCell>
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3.5 h-3.5" /> Staff
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs">
                    {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => handleEditClick(staff)} variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-slate-100">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(staff.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
