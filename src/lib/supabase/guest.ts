import { createClient } from "./client";

/**
 * ログインしていない人を、ゲスト（Supabase の匿名ユーザー）としてログインさせる。
 * Supabase の「Allow anonymous sign-ins」が無効な場合などは false を返す。
 */
export async function signInAsGuest(displayName: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return true;
  // display_name を渡さないと、メールのない匿名ユーザーではプロフィール作成（handle_new_user）が失敗する
  const { error } = await supabase.auth.signInAnonymously({ options: { data: { display_name: displayName } } });
  if (error) console.error("anonymous sign-in failed", error);
  return !error;
}

/** API を呼び、未ログイン（401）ならゲストとしてログインしてからもう一度だけ呼ぶ */
export async function fetchAsGuestIfNeeded(input: string, init: RequestInit, guestName: string) {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;
  if (!(await signInAsGuest(guestName))) return res;
  return fetch(input, init);
}
