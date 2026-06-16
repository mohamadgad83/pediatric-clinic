'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Clock, User, Phone, RefreshCw, Plus } from 'lucide-react'

// ✅ تعريف الـ Interface
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

export default function AssistantQueuePage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [queue, setQueue] = useState<QueueItem[]>([])
    const [loadingQueue, setLoadingQueue] = useState(true)
    const [today, setToday] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
    const [selectedPatient, setSelectedPatient] = useState('')
    const [vitalSigns, setVitalSigns] = useState({
        temperature: '',
        weight: '',
        heart_rate: '',
        blood_pressure: ''
    })
    const [chiefComplaint, setChiefComplaint] = useState('')
    const [addingToQueue, setAddingToQueue] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        const todayStr = new Date().toISOString().split('T')[0]
        setToday(todayStr)

        fetchQueue()
        fetchPatients()
    }, [user, loading, router])

    // ✅ دالة جلب البيانات - تم تعديلها
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
            // ✅ إعادة تشكيل البيانات
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

    const fetchPatients = async () => {
        const { data } = await supabase
            .from('patients')
            .select('id, name')
            .order('name')
        setPatients(data || [])
    }

    const addToQueue = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) return

        setAddingToQueue(true)

        const { data: queueData } = await supabase
            .from('appointments')
            .select('queue_number')
            .eq('appointment_date', today)
            .order('queue_number', { ascending: false })
            .limit(1)

        const nextNumber = (queueData?.[0]?.queue_number || 0) + 1

        const vitalSignsObj: Record<string, any> = {}
        if (vitalSigns.temperature) vitalSignsObj.temperature = parseFloat(vitalSigns.temperature)
        if (vitalSigns.weight) vitalSignsObj.weight = parseFloat(vitalSigns.weight)
        if (vitalSigns.heart_rate) vitalSignsObj.heart_rate = vitalSigns.heart_rate
        if (vitalSigns.blood_pressure) vitalSignsObj.blood_pressure = vitalSigns.blood_pressure

        const { error } = await supabase
            .from('appointments')
            .insert({
                patient_id: selectedPatient,
                appointment_date: today,
                queue_number: nextNumber,
                status: 'waiting',
                vital_signs: vitalSignsObj,
                chief_complaint: chiefComplaint || null,
                created_by: user?.id
            })

        if (!error) {
            setShowAddModal(false)
            setSelectedPatient('')
            setVitalSigns({ temperature: '', weight: '', heart_rate: '', blood_pressure: '' })
            setChiefComplaint('')
            fetchQueue()
        }
        setAddingToQueue(false)
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
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/assistant')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">📋 قائمة الانتظار</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchQueue}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            تحديث
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-4 h-4" />
                            إضافة للانتظار
                        </button>
                    </div>
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
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 text-blue-600 hover:text-blue-700"
                        >
                            إضافة أول مريض للانتظار
                        </button>
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
                                    <div>
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">➕ إضافة مريض لقائمة الانتظار</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={addToQueue}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اختيار المريض *
                                    </label>
                                    <select
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">اختر مريض...</option>
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الشكوى الرئيسية
                                    </label>
                                    <input
                                        type="text"
                                        value={chiefComplaint}
                                        onChange={(e) => setChiefComplaint(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="مثال: ارتفاع في درجة الحرارة"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            🌡️ درجة الحرارة
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={vitalSigns.temperature}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="مثال: 37.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ⚖️ الوزن (كجم)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={vitalSigns.weight}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="مثال: 15.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ❤️ معدل ضربات القلب
                                        </label>
                                        <input
                                            type="text"
                                            value={vitalSigns.heart_rate}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, heart_rate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="مثال: 80"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            💓 ضغط الدم
                                        </label>
                                        <input
                                            type="text"
                                            value={vitalSigns.blood_pressure}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="مثال: 120/80"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={addingToQueue}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {addingToQueue ? 'جاري الإضافة...' : 'إضافة للانتظار'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
