export type Category = "alert" | "outage" | "lost_found" | "announcement";

export interface Province {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
  province_id: string;
  province_name: string;
  municipality_id?: string;
  ward_number?: number;
  ward_places?: string[];
}

export interface Post {
  id: string;
  area_id: string;
  area_name?: string;
  province_name?: string;
  user_id: string;
  category: Category;
  content: string;
  image_url?: string | null;
  created_at: string;
  reported?: boolean;
  posted_by?: string | null;
}

export interface NewPost {
  area_id: string;
  category: Category;
  content: string;
  image_url?: string | null;
}
