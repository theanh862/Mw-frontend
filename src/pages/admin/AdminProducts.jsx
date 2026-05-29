import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, Search, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import api from '@/lib/api'

export default function AdminProducts() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    name_en: '',
    category_id: '',
    price: '',
    original_price: '',
    image: '',
    description: '',
    description_en: '',
    screen: '',
    cpu: '',
    ram: '',
    storage: '',
    battery: '',
    skus: []
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ])
        
        const mappedProducts = prodRes.data.map(p => ({
          id: p.id,
          name: p.name,
          name_en: p.name_en || '',
          categoryId: p.category_id,
          categoryName: p.category?.name || '',
          categoryName_en: p.category?.name_en || '',
          price: p.price,
          originalPrice: p.original_price,
          image: p.image,
          description: p.description,
          specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {}),
          specs_en: typeof p.specs_en === 'string' ? JSON.parse(p.specs_en) : (p.specs_en || null),
          rating: p.rating,
          reviewsCount: p.reviews_count,
          status: p.status,
          skus: p.skus || []
        }))
        
        setProducts(mappedProducts)
        setCategories(catRes.data)
        
        if (catRes.data.length > 0) {
          setNewProduct(prev => ({ ...prev, category_id: catRes.data[0].id }))
        }
      } catch (err) {
        console.error('Fetch admin products failed:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.products.confirm_delete'))) {
      try {
        await api.delete(`/admin/products/${id}`)
        setProducts(prev => prev.filter(p => p.id !== id))
        alert(t('admin.products.delete_success'))
      } catch (err) {
        console.error('Delete product error:', err)
        alert(t('admin.products.delete_fail'))
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProduct(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSkuRow = () => {
    setNewProduct(prev => ({
      ...prev,
      skus: [
        ...prev.skus,
        { sku: '', name: '', price: prev.price || '', original_price: prev.original_price || '', stock: 10, image: prev.image || '' }
      ]
    }))
  }

  const handleSkuFieldChange = (index, field, value) => {
    setNewProduct(prev => {
      const updatedSkus = [...prev.skus]
      updatedSkus[index] = { ...updatedSkus[index], [field]: value }
      return { ...prev, skus: updatedSkus }
    })
  }

  const handleDeleteSkuRow = (index) => {
    setNewProduct(prev => {
      const updatedSkus = prev.skus.filter((_, idx) => idx !== index)
      return { ...prev, skus: updatedSkus }
    })
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.category_id) {
      alert(t('admin.products.fill_required'))
      return
    }

    if (newProduct.skus.length > 0) {
      const invalidSku = newProduct.skus.some(sku => !sku.sku || !sku.name || sku.price === '')
      if (invalidSku) {
        alert(t('admin.products.fill_sku'))
        return
      }
    }

    const payload = {
      name: newProduct.name,
      category_id: parseInt(newProduct.category_id),
      price: parseFloat(newProduct.price),
      original_price: parseFloat(newProduct.original_price || newProduct.price),
      image: newProduct.image,
      description: newProduct.description,
      screen: newProduct.screen,
      cpu: newProduct.cpu,
      ram: newProduct.ram,
      storage: newProduct.storage,
      battery: newProduct.battery,
      skus: newProduct.skus.map(sku => ({
        id: sku.id || null,
        sku: sku.sku,
        name: sku.name,
        price: parseFloat(sku.price),
        original_price: sku.original_price ? parseFloat(sku.original_price) : null,
        stock: parseInt(sku.stock) || 0,
        image: sku.image || null
      }))
    }

    try {
      if (editingProduct) {
        // Edit mode
        const response = await api.put(`/admin/products/${editingProduct.id}`, payload)
        const updatedProduct = response.data
        
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
          id: updatedProduct.id,
          name: updatedProduct.name,
          name_en: updatedProduct.name_en || '',
          categoryId: updatedProduct.category_id,
          categoryName: categories.find(c => c.id === updatedProduct.category_id)?.name || '',
          categoryName_en: categories.find(c => c.id === updatedProduct.category_id)?.name_en || '',
          price: updatedProduct.price,
          originalPrice: updatedProduct.original_price,
          image: updatedProduct.image,
          description: updatedProduct.description,
          specs: typeof updatedProduct.specs === 'string' ? JSON.parse(updatedProduct.specs) : (updatedProduct.specs || {}),
          specs_en: typeof updatedProduct.specs_en === 'string' ? JSON.parse(updatedProduct.specs_en) : (updatedProduct.specs_en || null),
          rating: updatedProduct.rating,
          reviewsCount: updatedProduct.reviews_count,
          status: updatedProduct.status,
          skus: updatedProduct.skus || []
        } : p))
        alert(t('admin.products.update_success'))
      } else {
        const response = await api.post('/admin/products', payload)
        const createdProduct = response.data

        const newMapped = {
          id: createdProduct.id,
          name: createdProduct.name,
          name_en: createdProduct.name_en || '',
          categoryId: createdProduct.category_id,
          categoryName: categories.find(c => c.id === createdProduct.category_id)?.name || '',
          categoryName_en: categories.find(c => c.id === createdProduct.category_id)?.name_en || '',
          price: createdProduct.price,
          originalPrice: createdProduct.original_price,
          image: createdProduct.image,
          description: createdProduct.description,
          specs: typeof createdProduct.specs === 'string' ? JSON.parse(createdProduct.specs) : (createdProduct.specs || {}),
          specs_en: typeof createdProduct.specs_en === 'string' ? JSON.parse(createdProduct.specs_en) : (createdProduct.specs_en || null),
          rating: createdProduct.rating,
          reviewsCount: createdProduct.reviews_count,
          status: createdProduct.status,
          skus: createdProduct.skus || []
        }
        
        setProducts(prev => [newMapped, ...prev])
        alert(t('admin.products.add_success'))
      }
      
      // Close Modal and Reset
      setIsAddOpen(false)
      setEditingProduct(null)
      setNewProduct({
        name: '',
        name_en: '',
        category_id: categories[0]?.id || '',
        price: '',
        original_price: '',
        image: '',
        description: '',
        description_en: '',
        screen: '',
        cpu: '',
        ram: '',
        storage: '',
        battery: '',
        skus: []
      })
    } catch (err) {
      console.error('Submit product error:', err)
      alert(err.response?.data?.message || t('admin.products.save_fail'))
    }
  }

  const handleEditClick = (p) => {
    setEditingProduct(p)
    setNewProduct({
      name: p.name,
      name_en: p.name_en || '',
      category_id: p.categoryId,
      price: p.price,
      original_price: p.originalPrice || '',
      image: p.image,
      description: p.description || '',
      description_en: p.description_en || '',
      screen: p.specs?.screen || '',
      cpu: p.specs?.cpu || '',
      ram: p.specs?.ram || '',
      storage: p.specs?.storage || '',
      battery: p.specs?.battery || '',
      skus: p.skus || []
    })
    setIsAddOpen(true)
  }

  const handleDialogOpenChange = (open) => {
    setIsAddOpen(open)
    if (!open) {
      setEditingProduct(null)
      setNewProduct({
        name: '',
        name_en: '',
        category_id: categories[0]?.id || '',
        price: '',
        original_price: '',
        image: '',
        description: '',
        description_en: '',
        screen: '',
        cpu: '',
        ram: '',
        storage: '',
        battery: '',
        skus: []
      })
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">{t('admin.products.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">{t('admin.products.title')}</h2>
          <p className="text-sm text-slate-500">{t('admin.products.subtitle')}</p>
        </div>

        {/* Add Product Dialog Modal */}
        <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold gap-2 py-5 rounded-xl shadow-md">
              <Plus className="w-5 h-5" /> {t('admin.products.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingProduct ? t('admin.products.edit_title') : t('admin.products.add_title')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-6 py-4">
              
              {/* Basic info section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('admin.products.field_name')} 🇻🇳</Label>
                  <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} placeholder="iPhone 16 Pro Max" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">{t('admin.products.field_name')} 🇬🇧</Label>
                  <Input id="name_en" name="name_en" value={newProduct.name_en} onChange={handleInputChange} placeholder="iPhone 16 Pro Max (EN)" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">{t('admin.products.field_category')}</Label>
                <select
                  id="category_id"
                  name="category_id"
                  value={newProduct.category_id}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                  required
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Price section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('admin.products.field_price')}</Label>
                  <Input id="price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} placeholder="32990000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">{t('admin.products.field_original_price')}</Label>
                  <Input id="original_price" name="original_price" type="number" value={newProduct.original_price} onChange={handleInputChange} placeholder="35990000" />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">{t('admin.products.field_image')}</Label>
                <Input id="image" name="image" value={newProduct.image} onChange={handleInputChange} placeholder="https://images.unsplash.com/photo-xxx" required />
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{t('admin.products.field_desc')} 🇻🇳</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    placeholder="Viết mô tả ngắn gọn về sản phẩm..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_en">{t('admin.products.field_desc')} 🇬🇧</Label>
                  <textarea
                    id="description_en"
                    name="description_en"
                    value={newProduct.description_en}
                    onChange={handleInputChange}
                    placeholder="Write a short product description in English..."
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                  />
                </div>
              </div>

              {/* SKUs Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">{t('admin.products.sku_section')}</h4>
                  <Button
                    type="button"
                    onClick={handleAddSkuRow}
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-lg py-1.5 px-3"
                  >
                    {t('admin.products.sku_add')}
                  </Button>
                </div>

                {newProduct.skus.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">{t('admin.products.sku_empty')}</p>
                ) : (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {newProduct.skus.map((sku, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 items-end">
                        <div className="col-span-3 space-y-1">
                          <Label className="text-[10px]" htmlFor={`sku-name-${index}`}>{t('admin.products.sku_name')}</Label>
                          <Input
                            id={`sku-name-${index}`}
                            value={sku.name}
                            onChange={(e) => handleSkuFieldChange(index, 'name', e.target.value)}
                            placeholder="Màu sắc / Bộ nhớ"
                            required
                            className="h-8 text-xs px-2"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px]" htmlFor={`sku-code-${index}`}>{t('admin.products.sku_code')}</Label>
                          <Input
                            id={`sku-code-${index}`}
                            value={sku.sku}
                            onChange={(e) => handleSkuFieldChange(index, 'sku', e.target.value)}
                            placeholder="Mã SKU"
                            required
                            className="h-8 text-xs px-2"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px]" htmlFor={`sku-price-${index}`}>{t('admin.products.sku_price')}</Label>
                          <Input
                            id={`sku-price-${index}`}
                            type="number"
                            value={sku.price}
                            onChange={(e) => handleSkuFieldChange(index, 'price', e.target.value)}
                            placeholder="Giá bán"
                            required
                            className="h-8 text-xs px-2"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label className="text-[10px]" htmlFor={`sku-stock-${index}`}>{t('admin.products.sku_stock')}</Label>
                          <Input
                            id={`sku-stock-${index}`}
                            type="number"
                            value={sku.stock}
                            onChange={(e) => handleSkuFieldChange(index, 'stock', e.target.value)}
                            placeholder="SL"
                            required
                            className="h-8 text-xs px-2"
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <Label className="text-[10px]" htmlFor={`sku-image-${index}`}>{t('admin.products.sku_image')}</Label>
                          <Input
                            id={`sku-image-${index}`}
                            value={sku.image || ''}
                            onChange={(e) => handleSkuFieldChange(index, 'image', e.target.value)}
                            placeholder="Hình ảnh"
                            className="h-8 text-xs px-2"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <Button 
                            type="button" 
                            onClick={() => handleDeleteSkuRow(index)}
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">{t('admin.products.specs_section')}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="screen">{t('admin.products.spec_screen')}</Label>
                    <Input id="screen" name="screen" value={newProduct.screen} onChange={handleInputChange} placeholder="6.7 inch OLED 120Hz" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpu">{t('admin.products.spec_cpu')}</Label>
                    <Input id="cpu" name="cpu" value={newProduct.cpu} onChange={handleInputChange} placeholder="Apple A18 Pro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ram">{t('admin.products.spec_ram')}</Label>
                    <Input id="ram" name="ram" value={newProduct.ram} onChange={handleInputChange} placeholder="8 GB" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage">{t('admin.products.spec_storage')}</Label>
                    <Input id="storage" name="storage" value={newProduct.storage} onChange={handleInputChange} placeholder="256 GB" />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="battery">{t('admin.products.spec_battery')}</Label>
                    <Input id="battery" name="battery" value={newProduct.battery} onChange={handleInputChange} placeholder="4685 mAh, Sạc nhanh 30W" />
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold px-6">{editingProduct ? t('admin.products.btn_save') : t('admin.products.btn_add')}</Button>
              </div>

            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and search bar */}
      <div className="flex max-w-md relative">
        <Input
          type="text"
          placeholder={t('admin.products.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
        <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16">{t('admin.products.col_image')}</TableHead>
              <TableHead>{t('admin.products.col_name')}</TableHead>
              <TableHead>{t('admin.products.col_category')}</TableHead>
              <TableHead>{t('admin.products.col_price')}</TableHead>
              <TableHead>{t('admin.products.col_specs')}</TableHead>
              <TableHead className="w-24 text-center">{t('admin.products.col_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  {t('admin.products.no_products')}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50">
                  <TableCell>
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">{localized(p, 'name')}</TableCell>
                  <TableCell className="capitalize text-slate-500 font-medium">{localized(p, 'categoryName') || localized(categories.find(c => c.id === p.categoryId), 'name') || '—'}</TableCell>
                  <TableCell className="font-extrabold text-slate-900">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-[200px]">
                    {(() => { const specs = localized(p, 'specs') || p.specs; return <div>CPU: {specs?.cpu || 'N/A'} | RAM: {specs?.ram || 'N/A'} | {t('admin.products.spec_storage')}: {specs?.storage || 'N/A'}</div> })()}
                    {p.skus && p.skus.length > 0 && (
                      <div className="mt-1">
                        <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                          {t('admin.products.sku_count', { count: p.skus.length })}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => handleEditClick(p)} variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-slate-100">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(p.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
