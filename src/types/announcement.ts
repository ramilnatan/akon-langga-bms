export interface Announcement {
    id: string;
    title: string;
    message: string;
    icon: string | null;
    background_color: string | null;
    text_color: string | null;
    display_order: number;
    active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
  }