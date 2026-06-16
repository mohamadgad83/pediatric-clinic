'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, User, Phone, Calendar, Mail, Home } from 'lucide-react'

export default function NewPatientPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        birth_date: '',
        gender: '',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: '',
    })

    const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([])

    if (!loading && !user) {
        router.push('/login')
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingSubmit(true)
        setError('')

        // تحويل الحقول المخصصة إلى JSON
        const customFieldsObj: Record<string, string> = {}
        customFields.forEach(field => {
            if (field.key.trim()) {
                customFieldsObj[field.key.trim()] = field.value
            }
        })

        const { error: insertError } = await supabase
            .from('clinic_patients')
            .insert({
                name: formData.name,
                birth_date: formData.birth_date,
                gender: formData.gender || null,
                parent_name: formData.parent_name,
                parent_phone: formData.parent_phone,
                parent_email: formData.parent_email || null,
                address: formData.address || null,
                custom_fields: customFieldsObj,
                created_by: user?.id
            })

        if (insertError) {
            setError(insertError.message)
            setLoadingSubmit(false)
            return
        }

        router.push('/assistant')
    }

    const addCustomField = () => {
        setCustomFields([...customFields, { key: '', value: '' }])
    }

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index))
    }

    const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...customFields]
        updated[index][field] = value
        setCustomFields(updated)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/assistant')}
                            className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            رجوع
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">➕ تسجيل مريض جديد</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* اسم الطفل */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <User className="w-4 h-4 inline ml-1" />
                                اسم الطفل *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="أدخل اسم الطفل"
                                required
                            />
                        </div>

                        {/* تاريخ الميلاد */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline ml-1" />
                                تاريخ الميلاد *
                            </label>
                            <input
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        {/* النوع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                النوع
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">اختر</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>

                        {/* اسم ولي الأمر */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <User className="w-4 h-4 inline ml-1" />
                                اسم ولي الأمر *
                            </label>
                            <input
                                type="text"
                                value={formData.parent_name}
                                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="أدخل اسم ولي الأمر"
                                required
                            />
                        </div>

                        {/* رقم الهاتف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Phone className="w-4 h-4 inline ml-1" />
                                رقم الهاتف *
                            </label>
                            <input
                                type="tel"
                                value={formData.parent_phone}
                                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="مثال: 01012345678"
                                required
                            />
                        </div>

                        {/* البريد الإلكتروني */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Mail className="w-4 h-4 inline ml-1" />
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={formData.parent_email}
                                onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="example@email.com"
                            />
                        </div>

                        {/* العنوان */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Home className="w-4 h-4 inline ml-1" />
                                العنوان
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="العنوان بالكامل"
                            />
                        </div>
                    </div>

                    {/* الحقول المخصصة */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">حقول مخصصة</h3>
                            <button
                                type="button"
                                onClick={addCustomField}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                + إضافة حقل
                            </button>
                        </div>

                        {customFields.map((field, index) => (
                            <div key={index} className="flex gap-3 mb-3">
                                <input
                                    type="text"
                                    placeholder="اسم الحقل"
                                    value={field.key}
                                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="القيمة"
                                    value={field.value}
                                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCustomField(index)}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* أزرار الإرسال */}
                    <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loadingSubmit}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loadingSubmit ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/assistant')}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
