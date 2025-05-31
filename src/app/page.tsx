"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (session) {
    return (
      <>
        <h1>Welcome, {session?.user?.name}</h1>
        <img src={session?.user?.image || undefined} alt="Profile" width={50} />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      <h1>You are not signed in</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </>
  );
}
