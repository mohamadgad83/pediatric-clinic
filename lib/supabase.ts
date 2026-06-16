import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
    public: {
        Tables: {
            clinic_profiles: {
                Row: {
                    id: string
                    full_name: string
                    role: 'doctor' | 'assistant'
                    phone: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    role: 'doctor' | 'assistant'
                    phone?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    full_name?: string
                    role?: 'doctor' | 'assistant'
                    phone?: string | null
                    avatar_url?: string | null
                }
            }
            clinic_patients: {
                Row: {
                    id: string
                    name: string
                    birth_date: string
                    gender: 'male' | 'female' | null
                    parent_name: string
                    parent_phone: string
                    parent_email: string | null
                    address: string | null
                    custom_fields: any
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    name: string
                    birth_date: string
                    gender?: 'male' | 'female' | null
                    parent_name: string
                    parent_phone: string
                    parent_email?: string | null
                    address?: string | null
                    custom_fields?: any
                    created_by?: string | null
                }
                Update: {
                    name?: string
                    birth_date?: string
                    gender?: 'male' | 'female' | null
                    parent_name?: string
                    parent_phone?: string
                    parent_email?: string | null
                    address?: string | null
                    custom_fields?: any
                }
            }
            clinic_appointments: {
                Row: {
                    id: string
                    patient_id: string
                    appointment_date: string
                    appointment_time: string | null
                    queue_number: number
                    status: 'waiting' | 'in_clinic' | 'done' | 'cancelled'
                    vital_signs: any
                    chief_complaint: string | null
                    notes: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    patient_id: string
                    appointment_date: string
                    appointment_time?: string | null
                    queue_number: number
                    status?: 'waiting' | 'in_clinic' | 'done' | 'cancelled'
                    vital_signs?: any
                    chief_complaint?: string | null
                    notes?: string | null
                    created_by?: string | null
                }
                Update: {
                    patient_id?: string
                    appointment_date?: string
                    appointment_time?: string | null
                    queue_number?: number
                    status?: 'waiting' | 'in_clinic' | 'done' | 'cancelled'
                    vital_signs?: any
                    chief_complaint?: string | null
                    notes?: string | null
                }
            }
            clinic_medical_records: {
                Row: {
                    id: string
                    patient_id: string
                    appointment_id: string | null
                    diagnosis: string
                    prescription: any
                    notes: string | null
                    attachments: string[] | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    patient_id: string
                    appointment_id?: string | null
                    diagnosis: string
                    prescription?: any
                    notes?: string | null
                    attachments?: string[] | null
                    created_by?: string | null
                }
                Update: {
                    patient_id?: string
                    appointment_id?: string | null
                    diagnosis?: string
                    prescription?: any
                    notes?: string | null
                    attachments?: string[] | null
                }
            }
        }
    }
}
