'use client';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-black">
      <main className="bg-white p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">Cloud-Base Chat</h1>
        <p className="text-gray-600 mb-8">
          Welcome to your new real-time chat application.
        </p>
        <div className="flex flex-col gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Start Chatting
          </button>
          <div className="text-sm text-gray-400">
            Plain JavaScript + Next.js 16 + Tailwind v4
          </div>
        </div>
      </main>
    </div>
  );
}
