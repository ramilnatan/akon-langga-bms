import { useEffect, useState } from 'react';
import { supabase } from '@/services';

interface Announcement {
  id: string;
  message: string;
  display_order: number;
}

function MarqueeTrack({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="flex shrink-0 items-center gap-10 py-2.5 pr-10 whitespace-nowrap">
      {announcements.map((item) => (
        <span key={item.id} className="text-xs font-medium tracking-wide sm:text-sm">
          {item.message}
          <span className="ml-10 text-primary-foreground/40" aria-hidden="true">
            &bull;
          </span>
        </span>
      ))}
    </div>
  );
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, message, display_order')
        .eq('active', true)
        .or('start_date.is.null,start_date.lte.' + new Date().toISOString().split('T')[0])
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0])
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[AnnouncementBar] Failed to load announcements:', error);
        return;
      }

      setAnnouncements(data ?? []);
    };

    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-primary text-primary-foreground">
      <div className="flex w-max animate-marquee">
        <MarqueeTrack announcements={announcements} />
        <MarqueeTrack announcements={announcements} />
      </div>
    </div>
  );
}
