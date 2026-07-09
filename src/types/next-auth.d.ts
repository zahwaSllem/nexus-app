// Nexus — NextAuth type augmentation
// Adds Nexus session fields (user_id, role_type) to the User, Session, and JWT
// types so the whole auth surface is strongly typed (0 `any`, 0 TS errors).

import type { DefaultSession } from "next-auth";

type NexusRole = "admin" | "candidate";

declare module "next-auth" {
  interface User {
    user_id: string;
    role_type: NexusRole;
  }

  interface Session {
    user: {
      user_id: string;
      role_type: NexusRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: string;
    role_type: NexusRole;
    email?: string | null;
  }
}
