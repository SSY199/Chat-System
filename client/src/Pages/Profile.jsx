//import React from 'react'
import { useAppStore } from "@/store/store.js";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/lib/utils.js";
import { colors } from "@/lib/utils.js";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UPDATE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants.js";
import apiClient from "@/lib/api-client.js";
import { HOST } from "@/utils/constants.js";
import { DELETE_PROFILE_IMAGE_ROUTE } from "@/utils/constants.js";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState("");
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`); // Ensure HOST is correct
    }
  }, [userInfo]);

  const validateProfile = async () => {
    if (!firstName && !lastName) {
      toast.error("First name and last name are required");
      return false;
    }
    if (!firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (await validateProfile()) {
      try {
        const res = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName,
            lastName,
            color: selectedColor,
          },
          { withCredentials: true }
        );

        if (res.status === 200) {
          setUserInfo({ ...res.data, profileSetup:true });
          navigate("/chat");
        } else {
          toast.error("Error updating profile");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error("An error occurred while updating the profile.");
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please set up your profile to continue...");
      navigate("/profile");
    }
  };

  const handleFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profileimage", file);
  
      try {
        const res = await apiClient.post(UPDATE_PROFILE_IMAGE_ROUTE, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (res.status === 200) {
          const updatedImage = `${HOST}/${res.data.user.image}`;
          setUserInfo({ ...userInfo, image: res.data.user.image });
          setImage(updatedImage); // Update the image state directly
          toast.success("Image uploaded successfully");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("An error occurred while uploading the image");
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const res = await apiClient.delete(DELETE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (res.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(null);
        toast.success("Image deleted successfully");
      } else {
        toast.error("Error deleting image");
      }
    } catch (error) {
      console.error("Image delete error:", error);
      toast.error(error.response?.data?.message || "An error occurred while deleting the image");
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate} className="cursor-pointer">
          <IoArrowBack className="text-4xl lg:text-6xl text-white/95 cursor-pointer"></IoArrowBack>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover h-full w-full bg-black"
                ></AvatarImage>
              ) : (
                <div
                  className={`uppercase w-32 h-32 md:w-48 md:h-48 font-bold text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                className="absolute inset-0 bg-black/50 ring-fuchsia-50 rounded-full flex items-center justify-center"
                onClick={image ? handleDeleteImage : handleFileInput}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
              name="profileimage"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64  flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              ></Input>
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              ></Input>
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              ></Input>
            </div>
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedColor === index ? " outline-white/90 outline-1" : ""
                  }`}
                  key={index}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
