
import SupportPageClient from './SupportPageClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '1756147404176' },
    { id: '1756147404177' },
    { id: '1756147404178' },
    { id: '1756147404179' },
    { id: '1756147404180' },
    { id: '1756147573897' }
  ];
}

export default function SupportPage({ params }: { params: { id: string } }) {
  return <SupportPageClient params={params} />;
}
