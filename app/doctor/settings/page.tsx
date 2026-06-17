useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('clinic_settings')
        .select('*')
        .single();
      
      if (data) {
        setCheckupPrice(data.checkup_price);
        setConsultationPrice(data.consultation_price);
      }
    }
    fetchSettings();
  }, []); // تم إصلاح القوس والمصفوفة هنا لتكون سليمة بنسبة 100%
