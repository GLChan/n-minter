"use server";
import { createClient } from "./supabase/server";

export async function getUserInfo() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) throw new Error("Profile could not be retrieved");

  return data;
}

export async function getCollectionsByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Collections could not be retrieved");
  return data;
}
