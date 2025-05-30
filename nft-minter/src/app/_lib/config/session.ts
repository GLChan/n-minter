import { SessionOptions } from "iron-session";

export const IRON_OPTIONS: SessionOptions = {
  cookieName: "revoke_session",
  password: "",
  ttl: 60 * 60 * 24,
  cookieOptions: {
    secure: true, // Change this to false when locally testing on Safari
    sameSite: "none",
  },
};
