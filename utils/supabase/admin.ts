import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** 서버 전용 - Service Role로 사용자 삭제 등 관리자 작업에 사용. 클라이언트에 노출 금지 */
export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}
