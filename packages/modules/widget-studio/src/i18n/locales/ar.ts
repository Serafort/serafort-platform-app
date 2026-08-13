export const widgetStudioAr = {
  widgetStudio: {
    title: 'استوديو الودجات بالذكاء الاصطناعي',
    subtitle: 'مدعوم بـ Gemini',
    generate: {
      label: 'توليد',
      promptPlaceholder: 'صف الودجة التي تريد إنشاءها…',
      submit: 'توليد',
      submitting: 'جارٍ التوليد…',
    },
    history: {
      label: 'السجل',
      empty: 'لم يتم توليد أي ودجات بعد',
    },
    pipeline: {
      label: 'خط أنابيب الوكلاء',
      progress: 'تقدم خط الأنابيب',
      agents: {
        requirement: 'وكيل المتطلبات',
        design: 'وكيل التصميم',
        component: 'وكيل المكونات',
        validation: 'وكيل التحقق',
        preview: 'وكيل المعاينة',
        publish: 'وكيل النشر',
      },
    },
    publish: {
      button: 'نشر على لوحة التحكم',
      confirmTitle: 'نشر الودجة',
      confirmSubtitle: 'إضافة هذه الودجة إلى لوحة التحكم',
      confirmButton: 'نشر على لوحة التحكم',
      success: 'تم نشر الودجة على لوحة التحكم!',
    },
    errors: {
      noApiKey: 'لم يتم تهيئة VITE_GEMINI_API_KEY. أضفه إلى ملف .env الخاص بك.',
      injectionDetected: 'يحتوي موجهك على أنماط لا يمكن معالجتها لأسباب أمنية.',
    },
  },
}

export default widgetStudioAr
