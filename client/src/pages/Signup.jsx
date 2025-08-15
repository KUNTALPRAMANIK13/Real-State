import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signUpStart,
  signUpSuccess,
  signUpFailure,
  clearError,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import authService from "../services/authService";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      dispatch(signUpFailure("Please fill in all fields"));
      return;
    }

    if (formData.password.length < 6) {
      dispatch(signUpFailure("Password should be at least 6 characters"));
      return;
    }

    try {
      dispatch(signUpStart());

      // Use traditional signup (backend only)
      const result = await authService.traditionalSignUp(
        formData.username,
        formData.email,
        formData.password
      );

      // Use the backend user data for Redux state
      const userData = {
        _id: result.backendUser._id,
        username: result.backendUser.username,
        email: result.backendUser.email,
        avatar: result.backendUser.avatar,
      };

      dispatch(signUpSuccess(userData));
      navigate("/sign-in"); // Navigate to sign-in page after successful signup
    } catch (error) {
      dispatch(signUpFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
          required
          minLength={6}
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        <OAuth />
      </form>

      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to={"/sign-in"}>
          <span className="text-blue-700">Sign in</span>
        </Link>
      </div>

      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
}
