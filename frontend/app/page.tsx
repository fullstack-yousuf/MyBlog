import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-blue-100 to-white">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-800 leading-tight">
          Welcome to <span className="text-black">MyBlog</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl">
          A next-generation blogging platform to share ideas, collaborate in
          real time, and connect with people who inspire you.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/posts"
            className="px-6 py-3 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition"
          >
            Explore Posts
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border border-blue-700 text-blue-700 font-semibold hover:bg-blue-50 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-blue-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-12">
            Built for Modern Storytelling
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Blog Feature */}
            <div className="bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition p-8">
              <div className="flex justify-center mb-6">
                {/* Pen Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-10  text-blue-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Write & Publish Effortlessly
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create stunning blogs with a clean, distraction-free editor.
                Draft, publish, and update your content seamlessly.
              </p>
            </div>

            {/* Chat Feature */}
            <div className="bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition p-8">
              <div className="flex justify-center mb-6">
                {/* Chat Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-10  text-blue-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Real-Time Chat
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect instantly with other users. Discuss topics, share
                feedback, and engage in meaningful conversations in real time.
              </p>
            </div>

            {/* Engagement Feature */}
            <div className="bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition p-8">
              <div className="flex justify-center mb-6">
                {/* Heart Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-10  text-blue-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Engage & Interact
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Like and comment on posts from others — or receive feedback on
                your own. Build authentic connections within the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-blue-700 text-white text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          More Than Just a Blog Platform
        </h2>
        <p className="max-w-3xl mx-auto text-blue-100 leading-relaxed text-lg">
          MyBlog combines simplicity and power — offering real-time chat,
          dynamic blog management, and social interactions in one seamless
          experience. Whether you're a writer, reader, or thinker — it’s built
          for you.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block px-8 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-gray-100 transition"
        >
          Join Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-6 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} MyBlog. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
