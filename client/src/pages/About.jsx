import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <img src="/fav.png" alt="Logo" className="h-8 w-8" />
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          About
        </h1>
      </div>

      <p className="text-gray-600 leading-relaxed mb-6">
        This app helps people browse, list, and manage real estate properties
        with a smooth and fast experience. Search by location and filters, view
        rich listing details, and manage your own listings when signed in. It’s
        built with a modern MERN stack on the backend and a Vite + React
        frontend styled with Tailwind CSS.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="rounded-lg border border-gray-200 p-5 bg-white">
          <h3 className="font-medium mb-1">Browse Listings</h3>
          <p className="text-sm text-gray-600">
            Discover properties with photos, prices, and details.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 bg-white">
          <h3 className="font-medium mb-1">Powerful Search</h3>
          <p className="text-sm text-gray-600">
            Filter by type, offer, price range, and more.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 bg-white">
          <h3 className="font-medium mb-1">Create & Manage</h3>
          <p className="text-sm text-gray-600">
            Post new listings, upload images, and edit anytime.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 bg-white">
          <h3 className="font-medium mb-1">Secure Auth</h3>
          <p className="text-sm text-gray-600">
            Sign up, sign in, and protect actions with auth.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 bg-white">
          <h3 className="font-medium mb-1">Profile</h3>
          <p className="text-sm text-gray-600">
            Update your info and keep track of your activity.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 bg-white">
          <h3 className="font-medium mb-1">Mobile Friendly</h3>
          <p className="text-sm text-gray-600">
            Responsive UI that works great on any device.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-5">
        <h2 className="text-xl font-medium mb-2">Tech Overview</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Frontend: React + Vite, Tailwind CSS</li>
          <li>Auth/Storage: Firebase</li>
          <li>Backend: Node.js + Express</li>
          <li>Database: MongoDB with Mongoose models</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/search"
          className="inline-flex items-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black"
        >
          Explore Listings
        </Link>
        <Link
          to="/create-listing"
          className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Create a Listing
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-700 hover:underline"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default About;
