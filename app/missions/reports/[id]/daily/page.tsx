import MissionDailyReportClient from './MissionDailyReportClient';

export default async function MissionDailyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MissionDailyReportClient params={{ id }} />;
}
