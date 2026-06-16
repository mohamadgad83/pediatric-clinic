'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { 
    ArrowRight, Calendar, Phone, User, 
    Stethoscope, FileText, Pill, Activity,
    Plus, Edit, Clock, ChevronLeft
} from 'lucide-react'

interface Patient {
    id: string
    name: string
    birth_date: string
    gender: string
    parent_name: string
    parent_phone: string
    parent_email: string
    address: string
    custom_fields: any
    created_at: string
}

interface MedicalRecord {
    id: string
    diagnosis: string
    prescription: any
    notes: string
    created_at: string
    appointment_id: string
}

interface Appointment {
    id: string
    appointment_date: string
    appointment_time: string
    queue_number: number
    status: string
    vital_signs: any
    chief_complaint: string
    created_at: string
}

export default function PatientPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const patientId = params.id as string

    const [patient, setPatient] = useState<Patient | null>(null)
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loadingPatient, setLoadingPatient] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'records' | 'appointments'>('info')
    const [showAddRecord, setShowAddRecord] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        const fetchPatient = async () => {
            // جلب بيانات المريض
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single()

            if (patientError) {
                router.push('/doctor/patients')
                return
            }

            setPatient(patientData)

            // جلب السجلات الطبية
            const { data: recordsData } = await supabase
                .from('medical_records')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })

            setRecords(recordsData || [])

            // جلب المواعيد
            const { data: appointmentsData } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })

            setAppointments(appointmentsData || [])
            setLoadingPatient(false)
        }

        fetchPatient()
    }, [user, loading, router, patientId])

    const calculateAge = (birthDate: string) => {
        const today = new Date()
        const birth = new Date(birthDate)
        let years = today.getFullYear() - birth.getFullYear()
        let months = today.getMonth() - birth.getMonth()
        if (months < 0) {
            years--
            months += 12
        }
        if (years === 0) return `${months} شهر`
        return `${years} سنة و ${months} شهر`
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

    if (loading || loadingPatient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h3 className="text-xl font-semibold">المريض غير موجود</h3>
                    <button
                        onClick={() => router.push('/doctor/patients')}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                        العودة لقائمة المرضى
                    </button>
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
                            onClick={() => router.push('/doctor/patients')}
                            className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            رجوع
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">ملف المريض</h1>
                    </div>
                    <button
                        onClick={() => setShowAddRecord(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة سجل طبي
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Patient Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl">
                                👶
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{patient.name}</h2>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {calculateAge(patient.birth_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : 'غير محدد'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {patient.parent_phone}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>ولي الأمر: {patient.parent_name}</p>
                            {patient.parent_email && (
                                <p className="mt-1">البريد الإلكتروني: {patient.parent_email}</p>
                            )}
                            {patient.address && (
                                <p className="mt-1">العنوان: {patient.address}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-2 rounded-lg transition ${
                            activeTab === 'info'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Activity className="w-4 h-4 inline ml-1" />
                        المعلومات
                    </button>
                    <button
                        onClick={() => setActiveTab('records')}
                        className={`px-6 py-2 rounded-lg transition ${
                            activeTab === 'records'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FileText className="w-4 h-4 inline ml-1" />
                        السجلات الطبية ({records.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`px-6 py-2 rounded-lg transition ${
                            activeTab === 'appointments'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Clock className="w-4 h-4 inline ml-1" />
                        المواعيد ({appointments.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'info' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold mb-4">معلومات إضافية</h3>
                        {patient.custom_fields && Object.keys(patient.custom_fields).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(patient.custom_fields).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500">{key}</p>
                                        <p className="font-medium">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">لا توجد معلومات إضافية</p>
                        )}
                    </div>
                )}

                {activeTab === 'records' && (
                    <div className="space-y-4">
                        {records.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                <div className="text-4xl mb-4">📋</div>
                                <p className="text-gray-400">لا توجد سجلات طبية لهذا المريض</p>
                                <button
                                    onClick={() => setShowAddRecord(true)}
                                    className="mt-4 text-blue-600 hover:text-blue-700"
                                >
                                    إضافة أول سجل طبي
                                </button>
                            </div>
                        ) : (
                            records.map((record) => (
                                <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-lg">تشخيص: {record.diagnosis}</h4>
                                        <span className="text-sm text-gray-400">
                                            {new Date(record.created_at).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    {record.prescription && record.prescription.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700">الوصفة الطبية:</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {record.prescription.map((med: any, idx: number) => (
                                                    <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                                                        {med.name} {med.dosage && `- ${med.dosage}`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {record.notes && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            <span className="font-medium">ملاحظات:</span> {record.notes}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="space-y-4">
                        {appointments.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                <div className="text-4xl mb-4">📅</div>
                                <p className="text-gray-400">لا توجد مواعيد لهذا المريض</p>
                            </div>
                        ) : (
                            appointments.map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                        <div>
                                            <p className="font-semibold">
                                                {new Date(appointment.appointment_date).toLocaleDateString('ar-EG')}
                                                {appointment.appointment_time && ` - ${appointment.appointment_time}`}
                                            </p>
                                            <p className="text-sm text-gray-500">رقم الدور: #{appointment.queue_number}</p>
                                            {appointment.chief_complaint && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">الشكوى الرئيسية:</span> {appointment.chief_complaint}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(appointment.status)}
                                            {appointment.vital_signs && Object.keys(appointment.vital_signs).length > 0 && (
                                                <div className="flex gap-2 text-sm">
                                                    {appointment.vital_signs.temperature && (
                                                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                                                            🌡️ {appointment.vital_signs.temperature}°C
                                                        </span>
                                                    )}
                                                    {appointment.vital_signs.weight && (
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                            ⚖️ {appointment.vital_signs.weight}kg
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal إضافة سجل طبي - مبسط */}
            {showAddRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">إضافة سجل طبي جديد</h3>
                            <button
                                onClick={() => setShowAddRecord(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target as HTMLFormElement)
                            const diagnosis = formData.get('diagnosis') as string
                            const notes = formData.get('notes') as string
                            const medication = formData.get('medication') as string
                            const dosage = formData.get('dosage') as string

                            if (!diagnosis) return

                            const prescription = medication ? [{ name: medication, dosage: dosage || '' }] : []

                            const { error } = await supabase
                                .from('medical_records')
                                .insert({
                                    patient_id: patientId,
                                    diagnosis,
                                    prescription,
                                    notes,
                                    created_by: user?.id
                                })

                            if (!error) {
                                setShowAddRecord(false)
                                // إعادة تحميل البيانات
                                const { data: recordsData } = await supabase
                                    .from('medical_records')
                                    .select('*')
                                    .eq('patient_id', patientId)
                                    .order('created_at', { ascending: false })
                                setRecords(recordsData || [])
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        التشخيص *
                                    </label>
                                    <input
                                        type="text"
                                        name="diagnosis"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="مثال: التهاب الحلق"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الدواء
                                        </label>
                                        <input
                                            type="text"
                                            name="medication"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="اسم الدواء"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الجرعة
                                        </label>
                                        <input
                                            type="text"
                                            name="dosage"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="مثال: 5ml"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ملاحظات
                                    </label>
                                    <textarea
                                        name="notes"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="أي ملاحظات إضافية..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        حفظ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddRecord(false)}
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
