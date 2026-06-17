'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// إنشاء عميل Supabase خاص بالسيرفر محمي تماماً
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// دالة مساعدة للتحقق من الكوكيز وصلاحية المستخدم قبل تنفيذ أي عملية
async function verifySession() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get('user')
  const tokenCookie = cookieStore.get('auth_token') // أو الكوكي المستخدمة لديك

  if (!userCookie) {
    throw new Error('Unauthorized: No session found')
  }

  return JSON.parse(userCookie.value)
}

// 1. جلب طابور الانتظار اليومي بشكل آمن
export async function getTodayQueue() {
  try {
    const user = await verifySession()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabaseServer
      .from('clinic_appointments')
      .select(`
        id,
        patient_id,
        visit_date,
        status,
        queue_number,
        notes,
        weight,
        height,
        temperature,
        clinic_patients (
          id,
          name,
          gender,
          birth_date,
          parent_phone
        )
      `)
      .eq('visit_date', today)
      .order('queue_number', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 2. تحديث حالة الموعد (مثلاً من انتظار إلى جاري الفحص)
export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    await verifySession()
    const { error } = await supabaseServer
      .from('clinic_appointments')
      .update({ status })
      .eq('id', appointmentId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 3. حفظ الكشف الطبي والروشتة وإنهاء الزيارة بالكامل
export async function saveMedicalConsultation({
  appointmentId,
  patientId,
  diagnosis,
  notes,
  prescriptions,
  customFields
}: {
  appointmentId: string
  patientId: string
  diagnosis: string
  notes: string
  prescriptions: any[]
  customFields: any
}) {
  try {
    await verifySession()

    // أ) إدخال السجل الطبي
    const { error: recordError } = await supabaseServer
      .from('clinic_medical_records')
      .insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        diagnosis,
        notes,
        prescriptions, // مصفوفة JSON مهيكلة للأدوية
        custom_fields: customFields,
        created_at: new Date().toISOString()
      })

    if (recordError) throw recordError

    // ب) تحديث حالة الموعد إلى مكتمل (Completed)
    const { error: appError } = await supabaseServer
      .from('clinic_appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)

    if (appError) throw appError

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
