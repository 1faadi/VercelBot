import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authen";

export async function auth() {
  return await getServerSession(authOptions);
}
