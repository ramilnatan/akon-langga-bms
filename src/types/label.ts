export interface Label {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    background_color: string;
    text_color: string;
    badge_style: string;
    icon: string | null;
    display_order: number;
    active: boolean;
    created_at: string;
    updated_at: string;
  }
