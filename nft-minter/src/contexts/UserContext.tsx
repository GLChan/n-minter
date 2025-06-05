"use client";
import { UserProfile } from "@/app/_lib/types";
import { createContext, useContext } from "react";

const UserContext = createContext<UserProfile | null>(null);

export const UserProvider = ({
  user,
  children,
}: {
  user: UserProfile | null;
  children: React.ReactNode;
}) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
