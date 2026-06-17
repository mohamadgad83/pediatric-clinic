'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Eye, User } from 'lucide-react';

export default function DoctorPatientsArchive() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPatients() {
      const { data } = await supabase.from('clinic_patients').select('*');
      if (data) setPatients(data);
    }
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(p => p.full_name.includes(search));

  return (
    <div className="bg-white dark:bg-slate-900 border rounded-3xl p-6 text-right" dir="rtl">
      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">أرشيف المرضى العام</h2>
      
      <div className="relative mb-6">
        <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="ابحث باسم الطفل في الأرشيف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border pr-10 pl-4 py-2 text-xs rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        {filteredPatients.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><User className="h-4 w-4" /></div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{p.full_name}</p>
                <p className="text-[10px] text-slate-400">الهاتف: {p.parent_phone}</p>
              </div>
            </div>
            <Link href={`/doctor/patients/${p.id}`} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all">
              <Eye className="h-3.5 w-3.5" />
              <span>عرض السجل الكامل</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
