import { SessionOptions } from "iron-session";

export const IRON_OPTIONS: SessionOptions = {
  cookieName: "revoke_session",
  password: process.env.IRON_SESSION_PASSWORD ?? "complex_password_at_least_32_characters_long_for_security",
  ttl: 60 * 60 * 24,
  cookieOptions: {
    secure: true, // Change this to false when locally testing on Safari
    sameSite: "none",
  },
};
