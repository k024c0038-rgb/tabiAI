import type { User } from "@supabase/supabase-js";

/** メールでログインした本登録ユーザーか（ゲスト＝匿名ユーザーは false） */
export function isRegistered(user: User | null): user is User {
  return !!user && !user.is_anonymous;
}
