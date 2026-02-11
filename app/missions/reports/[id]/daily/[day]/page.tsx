import DayReadingClient from './DayReadingClient';

export default async function DayReadingPage({
  params,
}: {
  params: Promise<{ id: string; day: string }>;
}) {
  const { id, day } = await params;
  return <DayReadingClient params={{ id, day }} />;
}
