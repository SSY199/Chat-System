import React from "react";
import Background from "../assets/login2.png";
import Victory from "../assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/lib/api-client.js";
import { LOGIN_ROUTES, SIGNUP_ROUTES } from "@/utils/constants.js";
import { useAppStore } from "@/store/store.js";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateSignup = () => {
    if (!email.length && !password.length && !confirmPassword.length) {
      toast.error("Email and Password are required!");
      return false;
    }
    if(!email.length) {
      toast.error("Email is required!");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return false;
    }
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters long!");
      return false;
    }
    if(!password.length) {
      toast.error("Password is required!");
      return false;
    }
    return true;
  }

  const validateLogin = () => {
    if (!email.length && !password.length) {
      toast.error("Email and Password are required!");
      return false;
    }
    if(!email.length) {
      toast.error("Email is required!");
      return false;
    }
    if(!password.length) {
      toast.error("Password is required!");
      return false;
    }
    return true;
  }

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const res = await apiClient.post(
          LOGIN_ROUTES,
          { email, password },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        
        if(res.status === 200) {
          toast.success("Login successful!");
        if(res.data.user.profileSetup) {
          console.log("User info received:", res.data.user);
          setUserInfo(res.data.user);
          navigate("/chat");
        } else {
          navigate("/profile");
        }
      }
      console.log(res.data);
    } catch (err) {
        console.error("Login error:", err.response?.data || err.message);
      }
    }
  };

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const res = await apiClient.post(
          SIGNUP_ROUTES,
          { email, password },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(res.data);
        if (res.status === 201) {
          console.log("User info received:", res.data.user);
          setUserInfo(res.data.user);
          toast.success("Signup successful! Please complete your profile.");
          navigate("/profile"); 
        }
      } catch (err) {
        console.error("Signup error:", err.response?.data || err.message);
        toast.error("Signup failed. Please try again.");
      }
    }
  };
  

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Victory Emoji" className="h-[100px]" />
            </div>
            <p className="text-center font-semibold">
              Fill in the details to get started with the best Chat App!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent
    text-black text-opacity-90 border-b-2 rounded-none
    w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500
    p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent
    text-black text-opacity-90 border-b-2 rounded-none
    w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500
    p-3 transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                <Input
                  placeholder="Email"
                  type="email"
                  className="mt-5 rounded-lg p-4 border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-lg p-4 border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  onClick={handleLogin}
                  className="rounded-lg p-4 bg-purple-500 text-white hover:bg-purple-600"
                >
                  Login
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5" value="signup">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-lg p-4 border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-lg p-4 border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-lg p-4 border"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  onClick={handleSignup}
                  className="rounded-lg p-4 bg-purple-500 text-white hover:bg-purple-600"
                >
                  Signup
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex items-center justify-center">
          <img src={Background} alt="Background" className="h-[500px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
