import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import CountrySelect from "./CountrySelect";
import YearSelect from "./YearSelect"
import { auth } from "./Firebase"
import { db } from "./Firebase"

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "Consul General",
    status: "Current",
    email: "",
    phone: "",
    country: "",
    paymentYear: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!formData.country || !formData.paymentYear) {
      alert("Please select a country and payment year.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log("Attempting to write to Firestore project:", db.app.options.projectId);

      await setDoc(doc(db, "userApprovals", userCredential.user.uid), {
        ...formData,
        uid: userCredential.user.uid,
        statusApproval: "pending",
      });
      console.log("Document created in Firestore");
      
      alert("Signup complete! You will be contacted after admin approval.");
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto shadow rounded-xl border mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
      <input
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
        className="w-full p-2 mb-3 border rounded"
      />

      <label>Title:</label>
      <select
        name="title"
        onChange={handleChange}
        className="w-full p-2 mb-3 border rounded"
      >
        <option value="Consul General">Consul General</option>
        <option value="Honorary Consul">Honorary Consul</option>
      </select>

      <label>Status:</label>
      <select
        name="status"
        onChange={handleChange}
        className="w-full p-2 mb-3 border rounded"
      >
        <option value="Current">Current</option>
        <option value="Emeritus">Emeritus</option>
      </select>

      <input
        name="email"
        placeholder="Email"
        type="email"
        onChange={handleChange}
        className="w-full p-2 mb-3 border rounded"
      />

      <input
        name="phone"
        placeholder="Phone Number"
        onChange={handleChange}
        className="w-full p-2 mb-3 border rounded"
      />

      <CountrySelect value={formData.country} onChange={handleChange} />
      <YearSelect value={formData.paymentYear} onChange={handleChange} />

      <input
        name="password"
        type="password"
        placeholder="Temporary Password"
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />

      <button
        onClick={handleSignup}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign Up
      </button>
    </div>
  );
};

export default Signup;
