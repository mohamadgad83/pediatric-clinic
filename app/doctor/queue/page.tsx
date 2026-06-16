'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Clock, User, Phone, RefreshCw, CheckCircle, XCircle, UserCheck, ChevronLeft } from 'lucide-react'

// ✅ تعريف الـ Interface بشكل صحيح
interface QueueItem {
    id: string
    patient_id: string
    queue_number: number
    status: 'waiting' | 'in_clinic' | 'done' | 'cancelled'
    appointment_date: string
    vital_signs: any
    notes: string | null
    patients: {
        name: string
        parent_name: string
        parent_phone: string
    } | null
}

export default function DoctorQueuePage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [queue, setQueue] = useState<QueueItem[]>([])
    const [loadingQueue, setLoadingQueue] = useState(true)
    const [today, setToday] = useState('')

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        const todayStr = new Date().toISOString().split('T')[0]
        setToday(todayStr)

        fetchQueue()
    }, [user, loading, router])

    // ✅ دالة جلب البيانات - تم تعديلها بالكامل
    const fetchQueue = async () => {
        setLoadingQueue(true)
        const todayStr = new Date().toISOString().split('T')[0]
        
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                patient_id,
                queue_number,
                status,
                appointment_date,
                vital_signs,
                notes,
                patients (
                    name,
                    parent_name,
                    parent_phone
                )
            `)
            .eq('appointment_date', todayStr)
            .in('status', ['waiting', 'in_clinic'])
            .order('queue_number', { ascending: true })

        if (!error && data) {
            // ✅ إعادة تشكيل البيانات - دي أهم خطوة
            const formattedData: QueueItem[] = data.map((item: any) => ({
                id: item.id,
                patient_id: item.patient_id,
                queue_number: item.queue_number,
                status: item.status,
                appointment_date: item.appointment_date,
                vital_signs: item.vital_signs || {},
                notes: item.notes || null,
                patients: item.patients?.[0] || null
            }))
            
            setQueue(formattedData)
        }
        setLoadingQueue(false)
    }

    const updateStatus = async (id: string, status: 'in_clinic' | 'done' | 'cancelled') => {
        const { error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id)

        if (!error) {
            fetchQueue()
        }
    }

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            waiting: 'bg-yellow-100 text-yellow-700',
            in_clinic: 'bg-green-100 text-green-700',
            done: 'bg-blue-100 text-blue-700',
            cancelled: 'bg-red-100 text-red-700'
        }
        const labels: Record<string, string> = {
            waiting: 'في الانتظار',
            in_clinic: 'في العيادة',
            done: 'تم الكشف',
            cancelled: 'ملغي'
        }
        return (
            <span className={`px-3 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        )
    }

    if (loading || loadingQueue) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/doctor')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">📋 قائمة الانتظار</h1>
                    </div>
                    <button
                        onClick={fetchQueue}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        تحديث
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">تاريخ اليوم</p>
                            <p className="font-medium">{today}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">عدد المنتظرين</p>
                            <p className="text-2xl font-bold text-yellow-600">{queue.filter(q => q.status === 'waiting').length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">في العيادة</p>
                            <p className="text-2xl font-bold text-green-600">{queue.filter(q => q.status === 'in_clinic').length}</p>
                        </div>
                    </div>
                </div>

                {queue.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-700">قائمة الانتظار فارغة</h3>
                        <p className="text-gray-400 mt-1">لا يوجد مرضى في الانتظار اليوم</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {queue.map((item) => (
                            <div
                                key={item.id}
                                className={`bg-white rounded-xl shadow-sm border p-6 transition ${
                                    item.status === 'in_clinic' ? 'border-green-300 bg-green-50' : 'border-gray-100'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                                            #{item.queue_number}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.patients?.name || 'غير معروف'}</h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {item.patients?.parent_name || 'غير معروف'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {item.patients?.parent_phone || 'غير معروف'}
                                                </span>
                                            </div>
                                            {item.vital_signs && Object.keys(item.vital_signs).length > 0 && (
                                                <div className="flex gap-3 mt-2 text-sm">
                                                    {item.vital_signs.temperature && (
                                                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                                                            🌡️ {item.vital_signs.temperature}°C
                                                        </span>
                                                    )}
                                                    {item.vital_signs.weight && (
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                            ⚖️ {item.vital_signs.weight}kg
                                                        </span>
                                                    )}
                                                    {item.vital_signs.heart_rate && (
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                                            ❤️ {item.vital_signs.heart_rate}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(item.status)}
                                        {item.status === 'waiting' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateStatus(item.id, 'in_clinic')}
                                                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                                    title="بدء الكشف"
                                                >
                                                    <UserCheck className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'cancelled')}
                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                    title="إلغاء"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {item.status === 'in_clinic' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'done')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                إنهاء الكشف
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
