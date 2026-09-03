export interface Memo {
  id: string;
  title: string;
  content: string; // Rich text HTML string from TipTap
  plainTextPreview: string; // Plain text snippet for sidebar
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isPinned?: boolean;
}
