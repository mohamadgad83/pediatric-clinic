import { redirect } from 'next/navigation'

export default function RootPage() {
  // توجيه فوري ومباشر من السيرفر بدون شاشات تحميل مؤقتة
  redirect('/login')
}
