export interface NavItem {
  label: string;
  href: string;
  /** Marks the item as active when the route matches. */
  exact?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
}
