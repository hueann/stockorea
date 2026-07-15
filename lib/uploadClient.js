'use client';
import { sb } from './supabaseBrowser';

// 현재 Supabase 업로드 한도 (프로젝트 전역 설정과 일치시킬 것)
export const MAX_UPLOAD_MB = 50;

// 브라우저 → Supabase 스토리지 직접 업로드 (Vercel 4.5MB 본문 제한 우회)
// 로그인한 관리자 세션으로 업로드 → 스토리지 RLS(is_admin) 통과
export async function uploadFile(bucket, type, file) {
  const mb = file.size / (1024 * 1024);
  if (mb > MAX_UPLOAD_MB) {
    throw new Error(
      `파일이 너무 큽니다: ${mb.toFixed(1)}MB (한도 ${MAX_UPLOAD_MB}MB). ` +
      `영상은 압축해 ${MAX_UPLOAD_MB}MB 이하로 올리거나, Supabase 업로드 한도를 상향해 주세요.`
    );
  }
  const ext = file.name && file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const path = `${type}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb().storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) {
    const msg = String(error.message || '');
    if (error.statusCode === '413' || /exceeded the maximum allowed size|payload too large/i.test(msg)) {
      throw new Error(`파일이 업로드 한도(${MAX_UPLOAD_MB}MB)를 초과했습니다. 더 작은 파일로 올려주세요.`);
    }
    if (/row-level security|not authorized|permission/i.test(msg)) {
      throw new Error('업로드 권한이 없습니다. 관리자 계정으로 다시 로그인해 주세요.');
    }
    throw new Error(`파일 업로드 실패: ${msg}`);
  }
  return path;
}
