import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store/store.js";
import { HOST } from "@/utils/constants.js";
import { getColor } from "@/lib/utils.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoLogOut } from "react-icons/io5";
import { toast } from "sonner";
import apiClient from "@/lib/api-client.js";
import { LOGOUT_ROUTE } from "@/utils/constants.js";

//import { Navigate } from "react-router-dom";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      if (res.status === 200) {
        setUserInfo(null);
        navigate("/auth");
        toast.success("Logged out successfully");
      } else {
        toast.error("Error logging out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred while logging out");
    }
  };

  return (
    <div className="h-16 flex items-center justify-between px-4 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {userInfo.image ? (
              <AvatarImage
                src={`${HOST}/${userInfo.image}`}
                alt="profile"
                className="object-cover h-full w-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-full w-full font-bold text-lg border flex items-center justify-center rounded-full ${getColor(
                  userInfo.color
                )}`}
              >
                {userInfo.firstName
                  ? userInfo.firstName.charAt(0)
                  : userInfo.email.charAt(0)}
              </div>
            )}
          </Avatar>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-lg">
            {userInfo.firstName || userInfo.email}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <FaEdit
          className="text-white text-xl cursor-pointer hover:text-purple-500 transition duration-300"
          onClick={() => navigate("/profile")}
        />
        <IoLogOut
          className="text-white text-2xl cursor-pointer hover:text-red-500 transition duration-300"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default ProfileInfo;
