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
// export async function updateGuest(formData) {
//   const session = await auth();
//   if (!session) throw new Error("You must be logged in");

//   const nationalID = formData.get("nationalID");
//   const [nationality, countryFlag] = formData.get("nationality").split("%");

//   if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
//     throw new Error("Please provide a valid national ID");

//   const updateData = { nationality, countryFlag, nationalID };

//   const { data, error } = await supabase
//     .from("guests")
//     .update(updateData)
//     .eq("id", session.user.guestId);

//   if (error) throw new Error("Guest could not be updated");

//   revalidatePath("/account/profile");
// }


