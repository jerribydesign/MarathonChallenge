// Landing page with challenge explanation and Connect Strava CTA

import Link from 'next/link';
import BackgroundAnimation from '@/components/BackgroundAnimation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
      <BackgroundAnimation />
      <div className="relative z-10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Marathon-a-Month Challenge
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Connect your Strava account and track your progress toward running 26.2 miles each month.
            Compete with others on the leaderboard and see who can maintain the marathon distance!
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <ul className="text-left space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
                <span>Connect your Strava account securely via OAuth</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
                <span>We automatically sync your running activities</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
                <span>Track your progress toward 26.2 miles each month</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
                <span>See how you rank on the monthly leaderboard</span>
              </li>
            </ul>
          </div>


          <Link
            href="/api/strava/auth"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Connect Strava
          </Link>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
            We only access your running activities. Your data is secure and private.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
