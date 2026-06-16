'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, ArrowRight, Calendar, Phone, User, ChevronLeft } from 'lucide-react'

interface Patient {
    id: string
    name: string
    birth_date: string
    parent_name: string
    parent_phone: string
    created_at: string
}

export default function AssistantPatientsList() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [patients, setPatients] = useState<Patient[]>([])
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loadingPatients, setLoadingPatients] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        const fetchPatients = async () => {
            const { data, error } = await supabase
                .from('clinic_patients')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error && data) {
                setPatients(data)
                setFilteredPatients(data)
            }
            setLoadingPatients(false)
        }

        fetchPatients()
    }, [user, loading, router])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPatients(patients)
        } else {
            const term = searchTerm.toLowerCase()
            setFilteredPatients(
                patients.filter(p =>
                    p.name.toLowerCase().includes(term) ||
                    p.parent_name.toLowerCase().includes(term) ||
                    p.parent_phone.includes(term)
                )
            )
        }
    }, [searchTerm, patients])

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

    if (loading || loadingPatients) {
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
                            onClick={() => router.push('/assistant')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">👶 قائمة المرضى</h1>
                    </div>
                    <button
                        onClick={() => router.push('/assistant/patients/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <UserPlus className="w-4 h-4" />
                        مريض جديد
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="بحث بالاسم، اسم ولي الأمر، أو رقم الهاتف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Patients Grid */}
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-6xl mb-4">👶</div>
                        <h3 className="text-xl font-semibold text-gray-700">لا يوجد مرضى</h3>
                        <p className="text-gray-400 mt-1">
                            {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'ابدأ بإضافة أول مريض'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => router.push('/assistant/patients/new')}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                إضافة مريض جديد
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer"
                                onClick={() => router.push(`/doctor/patients/${patient.id}`)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">{patient.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            <Calendar className="w-3 h-3 inline ml-1" />
                                            {calculateAge(patient.birth_date)}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600">
                                        <User className="w-3 h-3 inline ml-1" />
                                        ولي الأمر: {patient.parent_name}
                                    </p>
                                    <p className="text-gray-600">
                                        <Phone className="w-3 h-3 inline ml-1" />
                                        {patient.parent_phone}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
