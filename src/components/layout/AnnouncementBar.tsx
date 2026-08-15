const announcements = [
  'FREE SHIPPING OVER ₱1,500',
  '100% NATURAL INGREDIENTS',
  'HANDCRAFTED WITH LOVE BY MARY ROSE',
];

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center gap-10 py-2.5 pr-10 whitespace-nowrap">
      {announcements.map((item) => (
        <span key={item} className="text-xs font-medium tracking-wide sm:text-sm">
          {item}
          <span className="ml-10 text-primary-foreground/40" aria-hidden="true">
            &bull;
          </span>
        </span>
      ))}
    </div>
  );
}

export function AnnouncementBar() {
  return (
    <div className="relative w-full overflow-hidden bg-primary text-primary-foreground">
      <div className="flex w-max animate-marquee">
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </div>
  );
}
