import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

export default function AddressSelector({ value, onChange }) {
  const { t } = useTranslation()

  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const [selectedProvince, setSelectedProvince] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [selectedWard, setSelectedWard] = useState(null)
  const [street, setStreet] = useState(value?.street || '')

  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  useEffect(() => {
    api.get('/shipping/provinces')
      .then(res => {
        const data = res.data?.data || []
        setProvinces(data.sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName, 'vi')))
      })
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false))
  }, [])

  const handleProvinceChange = async (e) => {
    const provinceId = parseInt(e.target.value)
    const province = provinces.find(p => p.ProvinceID === provinceId)
    setSelectedProvince(province || null)
    setSelectedDistrict(null)
    setSelectedWard(null)
    setDistricts([])
    setWards([])
    notify(null, null, null, street)

    if (!provinceId) return
    setLoadingDistricts(true)
    try {
      const res = await api.get(`/shipping/districts?province_id=${provinceId}`)
      const data = res.data?.data || []
      setDistricts(data.sort((a, b) => a.DistrictName.localeCompare(b.DistrictName, 'vi')))
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleDistrictChange = async (e) => {
    const districtId = parseInt(e.target.value)
    const district = districts.find(d => d.DistrictID === districtId)
    setSelectedDistrict(district || null)
    setSelectedWard(null)
    setWards([])
    notify(selectedProvince, district || null, null, street)

    if (!districtId) return
    setLoadingWards(true)
    try {
      const res = await api.get(`/shipping/wards?district_id=${districtId}`)
      const data = res.data?.data || []
      setWards(data.sort((a, b) => a.WardName.localeCompare(b.WardName, 'vi')))
    } finally {
      setLoadingWards(false)
    }
  }

  const handleWardChange = (e) => {
    const wardCode = e.target.value
    const ward = wards.find(w => String(w.WardCode) === wardCode)
    setSelectedWard(ward || null)
    notify(selectedProvince, selectedDistrict, ward || null, street)
  }

  const handleStreetChange = (e) => {
    setStreet(e.target.value)
    notify(selectedProvince, selectedDistrict, selectedWard, e.target.value)
  }

  const notify = (province, district, ward, streetVal) => {
    const fullAddress = [
      streetVal,
      ward?.WardName,
      district?.DistrictName,
      province?.ProvinceName,
    ].filter(Boolean).join(', ')

    onChange({
      street: streetVal,
      province,
      district,
      ward,
      fullAddress,
      districtId: district?.DistrictID || null,
      wardCode: ward?.WardCode ? String(ward.WardCode) : null,
    })
  }

  const selectClass = "w-full border border-input rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="space-y-3">
      {/* Province */}
      <div className="space-y-1.5">
        <Label>{t('checkout.province')}</Label>
        {loadingProvinces ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('checkout.loading')}
          </div>
        ) : (
          <select className={selectClass} onChange={handleProvinceChange} defaultValue="">
            <option value="">{t('checkout.select_province')}</option>
            {provinces.map(p => (
              <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
            ))}
          </select>
        )}
      </div>

      {/* District */}
      <div className="space-y-1.5">
        <Label>{t('checkout.district')}</Label>
        <div className="relative">
          <select
            className={selectClass}
            onChange={handleDistrictChange}
            value={selectedDistrict?.DistrictID || ''}
            disabled={!selectedProvince || loadingDistricts}
          >
            <option value="">{t('checkout.select_district')}</option>
            {districts.map(d => (
              <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
            ))}
          </select>
          {loadingDistricts && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-slate-400" />}
        </div>
      </div>

      {/* Ward */}
      <div className="space-y-1.5">
        <Label>{t('checkout.ward')}</Label>
        <div className="relative">
          <select
            className={selectClass}
            onChange={handleWardChange}
            value={selectedWard ? String(selectedWard.WardCode) : ''}
            disabled={!selectedDistrict || loadingWards}
          >
            <option value="">{t('checkout.select_ward')}</option>
            {wards.map(w => (
              <option key={w.WardCode} value={String(w.WardCode)}>{w.WardName}</option>
            ))}
          </select>
          {loadingWards && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-slate-400" />}
        </div>
      </div>

      {/* Street */}
      <div className="space-y-1.5">
        <Label>{t('checkout.street')}</Label>
        <Input
          value={street}
          onChange={handleStreetChange}
          placeholder={t('checkout.street_placeholder')}
          className="rounded-xl"
        />
      </div>
    </div>
  )
}
