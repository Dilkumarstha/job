import { auth, signOut } from "@/lib/auth";
import Navbar, { NavRole } from "@/components/Navbar";

/**
 * Server wrapper for the Navbar.
 *
 * Reads the session here (Node.js runtime, Mongoose-safe) and passes the
 * role down as a plain prop to the client Navbar component.
 * The sign-out form is also built here as a Server Component "slot" so that
 * the server action stays on the server and never touches the client bundle.
 */
export default async function NavbarServer() {
  const session = await auth();
  const role = (session?.user?.role ?? null) as NavRole;

  const signOutSlot = (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="btn-ghost text-sm px-3 py-1.5 rounded-xl"
      >
        Sign out
      </button>
    </form>
  );

  return <Navbar role={role} signOutSlot={signOutSlot} />;
}
