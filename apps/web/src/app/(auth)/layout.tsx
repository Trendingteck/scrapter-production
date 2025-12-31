"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-zinc-200 selection:bg-orange-500 selection:text-black">
      {/* Left Side - Auth Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 xl:w-2/5 xl:px-12 bg-zinc-950 border-r border-zinc-900 z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-terminal"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" x2="20" y1="19" y2="19" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Scrapter</span>
          </div>
          {children}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative bg-black overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-25%] right-[-10%] w-[700px] h-[700px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-repeat"></div>

        <div className="relative h-full flex items-center justify-center p-12">
          <div className="relative w-full max-w-lg aspect-square">
            {/* Abstract Dashboard Composition */}
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl transform rotate-3 z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-orange-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-zinc-800 rounded w-full"></div>
                <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
                <div className="h-2 bg-zinc-800 rounded w-4/6"></div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="h-20 bg-zinc-800/50 rounded-xl border border-zinc-800"></div>
                <div className="h-20 bg-zinc-800/50 rounded-xl border border-zinc-800"></div>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 w-2/3 h-2/3 bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl -rotate-6 z-20 flex flex-col justify-center p-8">
              <div className="text-4xl font-bold text-white mb-2">$527.8K</div>
              <div className="text-sm text-orange-500 font-medium">
                Total Value Extracted
              </div>
              <div className="mt-6 flex items-end gap-2 h-32">
                <div className="w-1/4 bg-orange-500/20 h-[40%] rounded-t-lg"></div>
                <div className="w-1/4 bg-orange-500/40 h-[70%] rounded-t-lg"></div>
                <div className="w-1/4 bg-orange-500/60 h-[50%] rounded-t-lg"></div>
                <div className="w-1/4 bg-orange-500 h-[90%] rounded-t-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
