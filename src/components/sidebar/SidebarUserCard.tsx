interface SidebarUserCardProps {
  name: string | null;
  handle: string | null;
  avatarUrl: string | null;
}

export const SidebarUserCard = ({ name, handle, avatarUrl }: SidebarUserCardProps) => (
  <div className="px-3 py-2.5">
    <div className="flex items-center gap-2.5">
      <div className="avatar-orbital shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {(name || 'U')[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold truncate leading-tight">{name || 'User'}</p>
        <p className="text-[9px] font-mono text-muted-foreground/60 truncate">@{handle}</p>
      </div>
    </div>
  </div>
);
