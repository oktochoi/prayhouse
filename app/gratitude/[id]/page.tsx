import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("gratitude_entries")
    .select("id, text")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!data) {
    return {
      title: "감사일기 | 기도의 집",
    };
  }

  const excerpt = data.text.slice(0, 60);
  return {
    title: "감사일기 | 기도의 집",
    description: excerpt,
  };
}

export default async function GratitudeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("gratitude_entries")
    .select("id, date, text, created_at")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header />
      <main className="pt-12 sm:pt-16 lg:pt-20 pb-32">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <div className="mb-8">
            <p className="text-xs text-stone-400">{formatDisplayDate(data.date)}</p>
          </div>
          <article className="bg-white/80 rounded-2xl border border-stone-100 p-6 sm:p-8">
            <p className="font-lora text-base sm:text-lg text-stone-700 leading-relaxed">
              {data.text}
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
