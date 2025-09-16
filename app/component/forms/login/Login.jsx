import {
  FaFacebookF, FaGoogle, FaLock, FaTwitter, FaUser, FaEnvelope,
} from 'react-icons/fa';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isActive, setIsActive] = useState(true);

  //  Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  //  Register State
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in:', {
      username: loginUsername,
      password: loginPassword,
    });
    // TODO: call API here
  };

  const handleRegister = () => {
    console.log('Registering:', {
      username: registerUsername,
      email: registerEmail,
      password: registerPassword,
    });
    // TODO: call API here
  };

  return (
    <>
      {isActive ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500">
          <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <div className="flex items-center border-b border-gray-300 py-2">
                  <FaUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Type your username"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Password</label>
                <div className="flex items-center border-b border-gray-300 py-2">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Type your password"
                    className="w-full focus:outline-none"
                  />
                </div>
                <div className="text-right text-sm mt-1">
                  <Link className="text-gray-500 hover:text-gray-700">Forgot password?</Link>
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-2 text-white rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 hover:opacity-90"
              >
                LOGIN
              </button>

              <div className="text-center mt-4 text-sm text-gray-600">Or Sign Up Using</div>

              <div className="flex justify-center space-x-4 mt-2">
                <button className="p-2 bg-blue-600 rounded-full text-white"><FaFacebookF /></button>
                <button className="p-2 bg-sky-400 rounded-full text-white"><FaTwitter /></button>
                <button className="p-2 bg-red-500 rounded-full text-white"><FaGoogle /></button>
              </div>

              <div className="text-center text-sm text-gray-600 mt-4">
                Or Sign In Using <button className="text-purple-600 font-semibold" onClick={() => setIsActive(false)}>SIGN UP</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500">
          <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-8">Register</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <div className="flex items-center border-b border-gray-300 py-2">
                  <FaUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Choose your username"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <div className="flex items-center border-b border-gray-300 py-2">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Password</label>
                <div className="flex items-center border-b border-gray-300 py-2">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Choose your password"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="w-full py-2 text-white rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 hover:opacity-90"
              >
                REGISTER
              </button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account? <button className="text-purple-600 font-semibold" onClick={() => setIsActive(true)}>LOGIN</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
