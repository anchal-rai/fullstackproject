// 'use client'
// import React, { useState } from 'react';

// function page() {

//   // Track the selected role (User or HomeMaker)
//   const [role, setRole] = useState(null);

//   // Track form data
//   const [form, setFormData] = useState({
//     name: '',
//     email: ''
//   });

//   // Handle form field changes (updates individual fields using spread operator)
//   const formChange = (e) => {
//     setFormData({
//       ...form, //spread operator: copy old form values
//       [e.target.name]: e.target.value //update the changed field only
//     });
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault(); // "Hey browser, don’t do your usual thing (refreshing the page). I’ll take care of it myself."
    
//     // Check if the name and email are entered or not
//     if (!form.name || !form.email) {
//       alert('Please enter required fields');
//     }
//     // Otherwise show submitted
//     else {
//       alert('Form submitted');
//       console.log(form);

//       // 🔜 In future: redirect to profile page here after sign up
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-orange-100 to-rose-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-6">

//         {/* Heading */}
//         <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
//           Welcome to HomeMaker Website
//         </h1>

//         {/* Role selection buttons */}
//         <div className="flex justify-center gap-4">
//           {/* setrole is a function itself. On clicking the button, try to change the setrole
//           | Mistake                           | Correct Way                            |
//           | --------------------------------- | -------------------------------------- |
//           | `onClick={setRole('User')}`       | ❌ This runs immediately, not on click. |
//           | `onClick={setRole='User'}`        | ❌ This is assignment, not a function.  |
//           | `onClick={() => setRole('User')}` | ✅ Correct way to run on click.         |
//           */}
//           <button 
//             onClick={() => setRole('User')}
//             className={`px-4 py-2 rounded-full font-medium transition ${
//               role === 'User' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
//             }`}
//           >
//             User
//           </button>

//           <button 
//             onClick={() => setRole('HomeMaker')}
//             className={`px-4 py-2 rounded-full font-medium transition ${
//               role === 'HomeMaker' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
//             }`}
//           >
//             HomeMaker
//           </button>
//         </div>

//         {/* Form section */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Name input */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
//             <input 
//               type="text" 
//               name="name" 
//               placeholder="Enter your name" 
//               value={form.name}
//               onChange={formChange}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
//             />
//           </div>

//           {/* Email input */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
//             <input 
//               type="email" 
//               name="email" 
//               placeholder="Enter your email"
//               value={form.email}
//               onChange={formChange}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
//             />
//           </div>

//           {/* Submit button */}
//           <button 
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
//           >
//             Sign Up
//           </button>
//         </form>

//         {/* Display selected role */}
//         {role && (
//           <p className="text-center text-sm text-gray-600">
//             Selected Role: <span className="font-medium text-black">{role}</span>
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default  page;

// /* 
//   --------------------------------------
//   NOTES FOR FUTURE DEVELOPMENT
//   --------------------------------------

//   // When to use 'use client'
//   // Place it at the top of any file that:

//   // ✅ Uses hooks like useState, useEffect, useRouter
//   // ✅ Handles form input
//   // ✅ Listens to events (onClick, onChange, etc.)

//   // spread operator is used to copy the values of an object
//   // it is used here to copy all existing form values before updating one field

//   // e.preventDefault(); 
//   // "Hey browser, don’t do your usual thing (refreshing the page). I’ll take care of it myself."

//   // 🔜 Next step: After signup, navigate to profile page
//   // Optionally use `useRouter()` from 'next/navigation'
//   // const router = useRouter(); router.push('/profile');

//   // Profile page will include more user details (based on selected role)
// */













'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // 🔜 used for routing after form submission

function page() {

  // Track the selected role (User or HomeMaker)
  const [role, setRole] = useState(null);

  // Track form data
  const [form, setFormData] = useState({
    name: '',
    email: ''
  });

  const router = useRouter();

  // Handle form field changes (updates individual fields using spread operator)
  const formChange = (e) => {
    setFormData({
      ...form, //spread operator: copy old form values
      [e.target.name]: e.target.value //update the changed field only
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // "Hey browser, don’t do your usual thing (refreshing the page). I’ll take care of it myself."
    
    // Check if the name, email and role are entered or not
    if (!form.name || !form.email || !role) {
      alert('Please enter all required fields and select a role');
    }
    // Otherwise show submitted and redirect
    else {
      alert('Form submitted');
      console.log(form, role);

      //  Redirect to corresponding profile page
      if (role === 'User') router.push(`/profile/user/page.jsx?name=${form.name}&email=${form.email}`);//pass name and email as query params
      else if (role === 'HomeMaker') router.push(`/profile/homemaker/page.jsx?name=${form.name}&email=${form.email}`);
    }
  };

  return (
    // Flex layout to split image and form
    <div className="flex flex-col md:flex-row h-screen w-full">

      {/* LEFT HALF: background image */}
      <div
        className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/homeMaker.png')" }} // ✅ background image from public folder
      ></div>

      {/* RIGHT HALF: form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white">
        {/* Semi-transparent white box for form */}
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full max-w-md">

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome to HomeMaker Website
          </h1>

          {/* Role selection buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {/* setrole is a function itself. On clicking the button, try to change the setrole
            | Mistake                           | Correct Way                            |
            | --------------------------------- | -------------------------------------- |
            | `onClick={setRole('User')}`       | ❌ This runs immediately, not on click. |
            | `onClick={setRole='User'}`        | ❌ This is assignment, not a function.  |
            | `onClick={() => setRole('User')}` | ✅ Correct way to run on click.         |
            */}
            <button 
              onClick={() => setRole('User')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                role === 'User' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              User
            </button>

            <button 
              onClick={() => setRole('HomeMaker')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                role === 'HomeMaker' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              HomeMaker
            </button>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your name" 
                value={form.name}
                onChange={formChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email"
                value={form.email}
                onChange={formChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            {/* Submit button */}
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Sign Up
            </button>
          </form>

          {/* Display selected role */}
          {role && (
            <p className="text-center text-sm text-gray-600 mt-4">
              Selected Role: <span className="font-medium text-black">{role}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;

/* 
  --------------------------------------
  NOTES FOR FUTURE DEVELOPMENT
  --------------------------------------

  // When to use 'use client'
  // Place it at the top of any file that:

  // ✅ Uses hooks like useState, useEffect, useRouter
  // ✅ Handles form input
  // ✅ Listens to events (onClick, onChange, etc.)

  // spread operator is used to copy the values of an object
  // it is used here to copy all existing form values before updating one field

  // e.preventDefault(); 
  // "Hey browser, don’t do your usual thing (refreshing the page). I’ll take care of it myself."

  // 🔜 After signup, navigate to profile page
  // Using `useRouter()` from 'next/navigation'
  // const router = useRouter(); router.push('/profile');

  // Profile page will include more user details (based on selected role)
*/  
