import NextAuth from "next-auth";
import { authOptions } from "@/lib/authen";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // ✅ This is correct
