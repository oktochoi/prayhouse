import type { Metadata } from "next";
import { cookies } from "next/headers";
import MissionReportClient from "./MissionReportClient";
import { createClient } from "@/utils/supabase/server";

export default async function MissionReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MissionReportClient reportId={id} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: mission } = await supabase
    .from("missions")
    .select("id, title, description")
    .eq("id", id)
    .single();

  const { data: image } = await supabase
    .from("mission_images")
    .select("storage_path")
    .eq("mission_id", id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const ogImageUrl = image?.storage_path
    ? supabase.storage.from("mission-images").getPublicUrl(image.storage_path).data.publicUrl
    : undefined;

  return {
    title: mission?.title ? `${mission.title} | 기도의 집` : "선교 일기 | 기도의 집",
    description: mission?.description?.slice(0, 80),
    openGraph: ogImageUrl
      ? {
          images: [{ url: ogImageUrl }],
        }
      : undefined,
    twitter: ogImageUrl
      ? {
          card: "summary_large_image",
          images: [ogImageUrl],
        }
      : undefined,
  };
}
