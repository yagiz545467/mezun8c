export interface Student {
  id: string;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  gender?: 'M' | 'F';
  claimedByUid?: string | null;
  isTeacher?: boolean;
  isApproved?: boolean;
}

export interface GraduationNote {
  id: string;
  toStudentId: string;
  fromStudentId: string;
  fromStudentName: string;
  fromUserUid: string;
  content: string;
  createdAt: number;
}

export interface MemoryMedia {
  id: string;
  studentId: string;
  studentName: string;
  userUid: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: number;
}
