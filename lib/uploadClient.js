'use client';
import { sb } from './supabaseBrowser';

// 브라우저 → Supabase 스토리지 직접 업로드 (Vercel 4.5MB 본문 제한 우회)
// 로그인한 관리자 세션으로 업로드 → 스토리지 RLS(is_admin) 통과
export async function uploadFile(bucket, type, file) {
  const ext = file.name && file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const path = `${type}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb().storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw new Error(`파일 업로드 실패: ${error.message}`);
  return path;
}
