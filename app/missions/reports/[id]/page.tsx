import MissionReportClient from './MissionReportClient';

export default async function MissionReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MissionReportClient reportId={id} />;
}
