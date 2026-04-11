import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-8 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          Air<span className="text-emerald-400">Taxi</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">
            Welcome, {user.firstName ?? user.emailAddresses[0]?.emailAddress}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-emerald-500/40",
              },
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-8 py-12">
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-2 text-zinc-400">
          Your trips, bookings, and account — all in one place.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card - Active Bookings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              ✈️
            </div>
            <h3 className="text-lg font-medium">Active Bookings</h3>
            <p className="mt-1 text-3xl font-bold text-emerald-400">0</p>
            <p className="mt-2 text-sm text-zinc-500">No upcoming trips</p>
          </div>

          {/* Card - Past Trips */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl transition-all hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              🗂️
            </div>
            <h3 className="text-lg font-medium">Past Trips</h3>
            <p className="mt-1 text-3xl font-bold text-sky-400">0</p>
            <p className="mt-2 text-sm text-zinc-500">
              Complete your first trip
            </p>
          </div>

          {/* Card - Wallet */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              💳
            </div>
            <h3 className="text-lg font-medium">Wallet Balance</h3>
            <p className="mt-1 text-3xl font-bold text-violet-400">$0.00</p>
            <p className="mt-2 text-sm text-zinc-500">Add funds to get started</p>
          </div>
        </div>
      </main>
    </div>
  );
}
