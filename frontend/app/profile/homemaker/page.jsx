'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
//using react-select
//firstly installed npm i --save react -select
//then imported it

import Select from 'react-select';


//I am using the useSearchParams hook from next/navigation to access the query parameters in the URL.
function page() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const email = searchParams.get('email');
  
  const options=[
  {value:'cooking',label:'Cooking'},
  {value:'cleaning',label:'Cleaning'},
  {value:'childcare',label:'Child Care'},
  {value:'elderly care',label:'Elderly Care'},
  {value:'pet care',label:'Pet Care'},
  {value:'laundry',label:'Laundry'},
  {value:'gardening',label:'Gardening'},
  {value:'housekeeping',label:'Housekeeping'},
  {value:'ironing',label:'Ironing'},
]

//create a select option function so that it can be used in skiils

  //create a form
  const [form, setFormData] = useState({
    name: name,
    email: email,
    age: '',
    skills: [], //here skills should be an array or string not a function
    address: '',
    pinCode: '',
    availability: '',
    experience: ''
  });

  //now handle skill chnage 

  const handleSkillChange=(selectedOptions)=>{
    setFormData({
      ...form,skills:selectedOptions
    });
  }

  //handle form field change
  const handleChange = (e) => {
    setFormData({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  //handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic pincode validation: length must be 6 digits, all numbers
    const pinCodeRegex = /^[0-9]{6}$/;

    if (
      !form.name ||
      !form.email ||
      !form.age ||
      !form.skills ||
      !form.address ||
      !form.pinCode ||
      !form.availability ||
      !form.experience
    ) {
      alert('Please fill all fields');
      return;
    } else if (!pinCodeRegex.test(form.pinCode)) {
      alert('Please enter a valid 6-digit Pin Code');
      return;
    } 
    else if(parseInt(form.age)<18){
      alert("'Age must be 18 or above");
    }
    else {
      alert('Form submitted successfully');
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
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full max-w-md overflow-y-auto h-[90vh]">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
            Homemaker Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input

                type="email"
                name="email"
                value={form.email || ''}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
              <input
                type="number"
                min="18"
                max="80"
                name="age"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-1">Skills</label>
              <Select
               options={options}
               isMulti
               name="skills"
                placeholder="Skills"
                value={form.skills}
                onChange={handleSkillChange}
                required
                className="w-full color:black"
                classNamePrefix="custom-select"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pin Code</label>
              <input
                type="text"
                name="pinCode"
                placeholder="Pin Code"
                value={form.pinCode}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
              <input
                type="text"
                name="availability"
                placeholder="Availability (e.g., Full-time, Part-time)"
                value={form.availability}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (in years)</label>
              <input
                type="text"
                name="experience"
                placeholder="Experience (in years)"
                value={form.experience}
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
