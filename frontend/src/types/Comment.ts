export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  level: number;
  content: string;
  createdAt: Date;
  likes: number;
  avatarSrc: string;
  isHidden?: boolean;
  replies?: Comment[];
}