import React, { useEffect, useState } from 'react'
import { Ban, ShieldAlert, CheckCircle2, User, Loader2, DollarSign, ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/lib/api'

export default function AdminCustomers() {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/customers')
      setCustomers(response.data)
    } catch (err) {
      console.error('Fetch customers error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">{t('admin.customers.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-900">{t('admin.customers.title')}</h2>
        <p className="text-sm text-slate-500">{t('admin.customers.subtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12">{t('admin.customers.col_customer')}</TableHead>
              <TableHead>{t('admin.customers.col_contact')}</TableHead>
              <TableHead>{t('admin.customers.col_date')}</TableHead>
              <TableHead className="text-center">{t('admin.customers.col_orders')}</TableHead>
              <TableHead className="text-right">{t('admin.customers.col_spent')}</TableHead>
              <TableHead className="text-center">{t('admin.customers.col_status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  {t('admin.customers.no_customers')}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50">
                  <TableCell>
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 object-cover rounded-full border border-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" /> {c.ordersCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-indigo-600">
                    {formatPrice(c.totalSpent || 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {t('admin.customers.active')}
                      </span>
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
