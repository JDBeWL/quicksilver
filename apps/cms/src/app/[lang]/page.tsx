import { redirect } from 'next/navigation';
import { Locale } from '@/i18n-config';

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  redirect(`/${lang}/dashboard`);
}
