import type { Student, GraduationNote, MemoryMedia } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getStudents(): Promise<Student[]> {
  const rows = await request<any[]>('/students');
  return rows.map(mapStudent);
}

export async function upsertStudent(student: Partial<Student> & { id: string; name: string }): Promise<Student> {
  const row = await request<any>('/students', {
    method: 'POST',
    body: JSON.stringify({
      id: student.id,
      name: student.name,
      email: student.email || null,
      photo_url: student.photoUrl || null,
      gender: student.gender || null,
      claimed_by_uid: student.claimedByUid || null,
      is_teacher: student.isTeacher || false,
      is_approved: student.isApproved || false,
    }),
  });
  return mapStudent(row);
}

export async function deleteStudent(id: string): Promise<void> {
  await request('/students', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

export async function getNotes(): Promise<GraduationNote[]> {
  const rows = await request<any[]>('/notes');
  return rows.map(mapNote);
}

export async function createNote(note: GraduationNote): Promise<GraduationNote> {
  const row = await request<any>('/notes', {
    method: 'POST',
    body: JSON.stringify({
      id: note.id,
      to_student_id: note.toStudentId,
      from_student_id: note.fromStudentId,
      from_student_name: note.fromStudentName,
      from_user_uid: note.fromUserUid,
      content: note.content,
      created_at: note.createdAt,
    }),
  });
  return mapNote(row);
}

export async function deleteNote(id: string): Promise<void> {
  await request('/notes', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

export async function getMemories(): Promise<MemoryMedia[]> {
  const rows = await request<any[]>('/memories');
  return rows.map(mapMemory);
}

export async function createMemory(memory: MemoryMedia): Promise<MemoryMedia> {
  const row = await request<any>('/memories', {
    method: 'POST',
    body: JSON.stringify({
      id: memory.id,
      student_id: memory.studentId,
      student_name: memory.studentName,
      user_uid: memory.userUid,
      media_url: memory.mediaUrl,
      media_type: memory.mediaType,
      created_at: memory.createdAt,
    }),
  });
  return mapMemory(row);
}

export async function deleteMemory(id: string): Promise<void> {
  await request('/memories', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

export async function getSetting(id: string): Promise<string | null> {
  const row = await request<any>(`/settings?id=${id}`);
  return row?.value ?? null;
}

export async function setSetting(id: string, value: string): Promise<void> {
  await request('/settings', {
    method: 'POST',
    body: JSON.stringify({ id, value }),
  });
}

export async function seedDatabase(): Promise<void> {
  await request('/seed', { method: 'POST' });
}

function mapStudent(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    email: row.email || null,
    photoUrl: row.photo_url || null,
    gender: row.gender || undefined,
    claimedByUid: row.claimed_by_uid || null,
    isTeacher: Boolean(row.is_teacher),
    isApproved: Boolean(row.is_approved),
  };
}

function mapNote(row: any): GraduationNote {
  return {
    id: row.id,
    toStudentId: row.to_student_id,
    fromStudentId: row.from_student_id,
    fromStudentName: row.from_student_name,
    fromUserUid: row.from_user_uid,
    content: row.content,
    createdAt: Number(row.created_at),
  };
}

function mapMemory(row: any): MemoryMedia {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    userUid: row.user_uid,
    mediaUrl: row.media_url,
    mediaType: row.media_type as 'image' | 'video',
    createdAt: Number(row.created_at),
  };
}

export async function seedIfEmpty(): Promise<void> {
  const students = await getStudents();
  if (students.length === 0) {
    await seedDatabase();
  }
}
