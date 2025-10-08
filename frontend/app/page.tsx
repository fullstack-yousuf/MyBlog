import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-700 leading-tight">
          Welcome to <span className="text-blue-900">MyBlog</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl">
          A modern blogging platform to share your stories, ideas, and
          experiences with the world.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/posts"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Explore Posts
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-8 text-center">
            Featured Posts
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card */}
            <div className="bg-blue-50 rounded-xl shadow hover:shadow-md transition p-6">
              <Image
                src="/blog1.jpg"
                alt="Blog 1"
                width={400}
                height={200}
                className="rounded-lg mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-blue-800">
                Getting Started with Blogging
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Learn how to share your first story and connect with an
                audience.
              </p>
              <Link
                href="/posts/1"
                className="mt-4 inline-block text-blue-600 hover:underline font-medium"
              >
                Read more →
              </Link>
            </div>

            <div className="bg-blue-50 rounded-xl shadow hover:shadow-md transition p-6">
              <Image
                src="/blog2.jpg"
                alt="Blog 2"
                width={400}
                height={200}
                className="rounded-lg mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-blue-800">
                The Future of Writing
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Explore how digital platforms are shaping the way we tell
                stories.
              </p>
              <Link
                href="/posts/2"
                className="mt-4 inline-block text-blue-600 hover:underline font-medium"
              >
                Read more →
              </Link>
            </div>

            <div className="bg-blue-50 rounded-xl shadow hover:shadow-md transition p-6">
              <Image
                src="/blog3.jpg"
                alt="Blog 3"
                width={400}
                height={200}
                className="rounded-lg mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-blue-800">
                Writing That Inspires
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Tips and strategies to create impactful content that resonates.
              </p>
              <Link
                href="/posts/3"
                className="mt-4 inline-block text-blue-600 hover:underline font-medium"
              >
                Read more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to start your blogging journey?
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Join now and share your first post with the world today.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block px-8 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-gray-100 transition"
        >
          Create an Account
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
