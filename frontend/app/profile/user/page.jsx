"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

function page() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const email = searchParams.get("email");

  const [form, setFormData] = useState({
    name: name,
    email: email,
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Please fill all fields");
    } else if (!/^\d{10}$/.test(form.phone)) {
      alert("Enter a valid 10-digit phone number");
    } else {
      alert("User form submitted successfully");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* LEFT HALF: background image */}
      <div
        className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/homeMaker.png')" }}
      ></div>

      {/* RIGHT HALF: form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white">
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
            User Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name || ""}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default page;
