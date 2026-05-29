import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Tag, Key, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import api from '@/lib/api'

export default function AdminCategories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCat, setNewCat] = useState({ slug: '', name: '', name_en: '', icon: 'Smartphone' })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (err) {
      console.error('Fetch categories error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.categories.confirm_delete'))) {
      try {
        await api.delete(`/admin/categories/${id}`)
        setCategories(prev => prev.filter(c => c.id !== id))
        alert(t('admin.categories.delete_success'))
      } catch (err) {
        console.error('Delete category error:', err)
        alert(err.response?.data?.message || t('admin.categories.delete_fail'))
      }
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!newCat.slug || !newCat.name) {
      alert(t('admin.categories.fill_required'))
      return
    }

    if (categories.find(c => c.slug === newCat.slug)) {
      alert(t('admin.categories.slug_exists'))
      return
    }

    try {
      const response = await api.post('/admin/categories', {
        name: newCat.name,
        name_en: newCat.name_en || null,
        slug: newCat.slug,
        icon: newCat.icon
      })
      setCategories(prev => [...prev, response.data])
      setNewCat({ slug: '', name: '', name_en: '', icon: 'Smartphone' })
      setIsAddOpen(false)
      alert(t('admin.categories.add_success'))
    } catch (err) {
      console.error('Add category error:', err)
      alert(err.response?.data?.message || t('admin.categories.add_fail'))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">{t('admin.categories.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">{t('admin.categories.title')}</h2>
          <p className="text-sm text-slate-500">{t('admin.categories.subtitle')}</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold gap-2 py-5 rounded-xl shadow-md">
              <Plus className="w-5 h-5" /> {t('admin.categories.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{t('admin.categories.dialog_title')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="slug">{t('admin.categories.field_slug')}</Label>
                <Input
                  id="slug"
                  value={newCat.slug}
                  onChange={(e) => setNewCat(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').trim() }))}
                  placeholder={t('admin.categories.field_slug_placeholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.categories.field_name')} 🇻🇳</Label>
                <Input
                  id="name"
                  value={newCat.name}
                  onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.categories.field_name_placeholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_en">{t('admin.categories.field_name')} 🇬🇧</Label>
                <Input
                  id="name_en"
                  value={newCat.name_en}
                  onChange={(e) => setNewCat(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="e.g. Gaming Laptops, Smart Watch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">{t('admin.categories.field_icon')}</Label>
                <select
                  id="icon"
                  value={newCat.icon}
                  onChange={(e) => setNewCat(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                >
                  <option value="Smartphone">{t('admin.categories.icon_phone')}</option>
                  <option value="Laptop">{t('admin.categories.icon_laptop')}</option>
                  <option value="Tablet">{t('admin.categories.icon_tablet')}</option>
                  <option value="Watch">{t('admin.categories.icon_watch')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold px-6">{t('admin.categories.btn_save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden max-w-xl">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('admin.categories.col_id')}</TableHead>
              <TableHead>{t('admin.categories.col_name')}</TableHead>
              <TableHead>{t('admin.categories.col_icon')}</TableHead>
              <TableHead className="w-24 text-center">{t('admin.categories.col_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50">
                <TableCell className="font-bold text-slate-800">{c.slug}</TableCell>
                <TableCell className="font-medium text-slate-900">{localized(c, 'name')}</TableCell>
                <TableCell className="text-slate-500 text-xs py-4">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" /> {c.icon}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Button onClick={() => handleDelete(c.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
