
'use client';

import Link from 'next/link';

interface Prayer {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId?: number;
  date: string;
  prayerCount: number;
  isUrgent: boolean;
}

interface PrayerCardProps {
  prayer: Prayer;
}

export default function PrayerCard({ prayer }: PrayerCardProps) {
  return (
    <article className="group py-12 border-b border-stone-100/80 last:border-0 transition-colors duration-500">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] tracking-[0.2em] text-stone-400 uppercase font-light">
          {prayer.category}
        </span>
        {prayer.isUrgent && (
          <>
            <span className="text-stone-200">·</span>
            <span className="text-[10px] tracking-[0.2em] text-rose-300 uppercase font-light">
              긴급
            </span>
          </>
        )}
      </div>

      <h3 className="text-xl lg:text-[1.375rem] font-extralight text-stone-700 mb-5 leading-[1.7] group-hover:text-stone-500 transition-colors duration-500">
        {prayer.title}
      </h3>

      <p className="text-[15px] text-stone-400 mb-10 leading-[2] font-light line-clamp-2">
        {prayer.content}
      </p>

        <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-stone-500 font-light">
            {prayer.author}
          </p>
          <p className="text-[11px] text-stone-300 font-light tracking-wide">
            {prayer.date}
          </p>
        </div>

        <div className="flex items-center gap-8">
          <Link
            href={`/prayers/${prayer.id}`}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors duration-500 border-b border-stone-200 hover:border-stone-500 pb-0.5 font-light"
          >
            기도하기
          </Link>
        </div>
      </div>
    </article>
  );
}
