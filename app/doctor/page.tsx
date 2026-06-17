'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Users, Calendar, Clock, Activity, LogOut } from 'lucide-react'

interface Stats {
    totalPatients: number
    todayAppointments: number
    waitingQueue: number
    criticalAlerts: number
}

export default function DoctorDashboard() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<Stats>({
        totalPatients: 0,
        todayAppointments: 0,
        waitingQueue: 0,
        criticalAlerts: 0
    })
    const [recentPatients, setRecentPatients] = useState<any[]>([])

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }

        const fetchStats = async () => {
            // عدد المرضى الكلي
            const { count: patientsCount } = await supabase
                .from('clinic_patients')
                .select('*', { count: 'exact', head: true })

            // مواعيد اليوم
            const today = new Date().toISOString().split('T')[0]
            const { count: todayCount } = await supabase
                .from('clinic_appointments')
                .select('*', { count: 'exact', head: true })
                .eq('appointment_date', today)

            // قائمة الانتظار
            const { count: waitingCount } = await supabase
                .from('clinic_appointments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'waiting')

            // أحدث المرضى
            const { data: recent } = await supabase
                .from('clinic_patients')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            setStats({
                totalPatients: patientsCount || 0,
                todayAppointments: todayCount || 0,
                waitingQueue: waitingCount || 0,
                criticalAlerts: 0
            })
            setRecentPatients(recent || [])
        }

        fetchStats()
    }, [user, loading, router])

    // ✅ تسجيل الخروج - الطريقة الصحيحة
   const handleLogout = () => {
    // حذف البيانات من localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
    // التوجيه لصفحة login
    router.push('/login')
}

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    const statCards = [
        { title: 'إجمالي المرضى', value: stats.totalPatients, icon: Users, color: 'bg-blue-500' },
        { title: 'مواعيد اليوم', value: stats.todayAppointments, icon: Calendar, color: 'bg-green-500' },
        { title: 'قائمة الانتظار', value: stats.waitingQueue, icon: Clock, color: 'bg-yellow-500' },
        { title: 'تنبيهات حرجة', value: stats.criticalAlerts, icon: Activity, color: 'bg-red-500' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">🏥 PediaCare</h1>
                        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">طبيب</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">{user?.full_name || 'دكتور'}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            تسجيل خروج
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        مرحباً {user?.full_name || 'دكتور'} 👋
                    </h2>
                    <p className="text-gray-500 mt-1">لوحة تحكم عيادة الأطفال</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.title}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Patients */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">📋 آخر المرضى المسجلين</h3>
                        <button
                            onClick={() => router.push('/doctor/patients')}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            عرض الكل →
                        </button>
                    </div>
                    {recentPatients.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">لا يوجد مرضى مسجلين بعد</p>
                    ) : (
                        <div className="divide-y">
                            {recentPatients.map((patient) => (
                                <div key={patient.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{patient.name}</p>
                                        <p className="text-sm text-gray-500">ولي الأمر: {patient.parent_name}</p>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/doctor/patients/${patient.id}`)}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        عرض
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <button
                        onClick={() => router.push('/doctor/patients')}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center"
                    >
                        <div className="text-2xl mb-2">👶</div>
                        <p className="text-sm font-medium">المرضى</p>
                    </button>
                    <button
                        onClick={() => router.push('/doctor/queue')}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center"
                    >
                        <div className="text-2xl mb-2">📋</div>
                        <p className="text-sm font-medium">قائمة الانتظار</p>
                    </button>
                    <button
                        onClick={() => router.push('/doctor/patients/new')}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center"
                    >
                        <div className="text-2xl mb-2">➕</div>
                        <p className="text-sm font-medium">إضافة مريض</p>
                    </button>
                    <button
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center opacity-50 cursor-not-allowed"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <p className="text-sm font-medium">تقارير (قريباً)</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
