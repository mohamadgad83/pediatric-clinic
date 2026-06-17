'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Printer, CheckCircle } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  type: string; // 'syrup' | 'drops' | 'tablet'
  baseDosePerKg: number; // ملغ لكل كجم
  concentration: number; // تركيز الدواء (مثلاً 250 ملغ) لكل حجم معين (مثلاً 5 مل)
  volume: number; 
}

export default function SmartPrescription({ childWeight = 12 }: { childWeight?: number }) {
  // أدوية افتراضية شائعة في طب الأطفال للاختيار السريع
  const [availableMedicines] = useState<Medicine[]>([
    { id: '1', name: 'بروفين شراب (Iprofen)', type: 'syrup', baseDosePerKg: 10, concentration: 100, volume: 5 },
    { id: '2', name: 'باراسيتامول شراب (Cetal)', type: 'syrup', baseDosePerKg: 15, concentration: 120, volume: 5 },
    { id: '3', name: 'أوجمنتين (Augmentin 457)', type: 'syrup', baseDosePerKg: 30, concentration: 400, volume: 5 },
  ]);

  const [selectedMed, setSelectedMed] = useState<string>('');
  const [calculatedDose, setCalculatedDose] = useState<string>('');
  const [prescriptionList, setPrescriptionList] = useState<any[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');

  // دالة حساب الجرعة الآلية فور اختيار الدواء بناءً على وزن الطفل الحالي
  const handleCalculateDose = (medId: string) => {
    const med = availableMedicines.find(m => m.id === medId);
    if (!med || !childWeight) return;

    // المعادلة الطبية: (الوزن × الجرعة المطلوبة لكل كجم × حجم التركيز) / تركيز المادة الفعالة
    const totalMgNeeded = childWeight * med.baseDosePerKg;
    const exactMl = (totalMgNeeded * med.volume) / med.concentration;
    
    // تقسيمها على جرعات (مثلاً 3 مرات يومياً)
    const perDose = (exactMl / 3).toFixed(1);
    
    setCalculatedDose(`${perDose} مل كل 8 ساعات (تلقائي بناءً على وزن الطفل: ${childWeight} كجم)`);
  };

  const addToPrescription = () => {
    const med = availableMedicines.find(m => m.id === selectedMed);
    if (!med) return;

    setPrescriptionList([
      ...prescriptionList,
      { id: Date.now().toString(), name: med.name, dose: calculatedDose, notes: customNotes }
    ]);
    
    // تفريغ المدخلات
    setSelectedMed('');
    setCalculatedDose('');
    setCustomNotes('');
  };

  const removeItem = (id: string) => {
    setPrescriptionList(prescriptionList.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-right" dir="rtl">
      
      {/* هيدر الموديل الهوية البصرية */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">مساعد الجرعات الذكي والروشتة الإلكترونية</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">يحتسب الجرعة الآمنة بالمليمتر بناءً على الوزن المثبت حالياً للطفل</p>
        </div>
      </div>

      {/* معطيات وتوليد الجرعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">اختر الدواء / المضاد</label>
          <select
            value={selectedMed}
            onChange={(e) => {
              setSelectedMed(e.target.value);
              handleCalculateDose(e.target.value);
            }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
          >
            <option value="">-- اختر من القائمة لتفعيل الحاسبة --</option>
            {availableMedicines.map(med => (
              <option key={med.id} value={med.id}>{med.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">الجرعة المقترحة برمجياً (يمكنك التعديل عليها)</label>
          <input
            type="text"
            value={calculatedDose}
            onChange={(e) => setCalculatedDose(e.target.value)}
            placeholder="ستظهر الجرعة المحسوبة هنا تلقائياً..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">ملاحظات إضافية (أو تعليمات خاصة بالطعام)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="مثال: قبل الأكل بنصف ساعة - يرج جيداً قبل الاستخدام..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={addToPrescription}
            disabled={!selectedMed}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة للروشتة</span>
          </button>
        </div>
      </div>

      {/* استعراض شكل الروشتة العصرية الحالية */}
      <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/40">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">محتويات الروشتة الحالية للأم / الأب:</h4>
        
        {prescriptionList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">لا توجد أدوية مضافة في هذه الزيارة حتى الآن.</p>
        ) : (
          <div className="space-y-2.5">
            {prescriptionList.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Rx: {item.name}</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">💊 {item.dose}</p>
                  {item.notes && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">📌 {item.notes}</p>}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* أزرار الحفظ والطباعة */}
      {prescriptionList.length > 0 && (
        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
            <Printer className="h-4 w-4" />
            <span>طباعة الروشتة الحرارية</span>
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/10 transition-all">
            <CheckCircle className="h-4 w-4" />
            <span>اعتماد وحفظ السجل الطبي كلياً</span>
          </button>
        </div>
      )}
    </div>
  );
}
