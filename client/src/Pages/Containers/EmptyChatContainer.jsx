import { animationDefaultOptions } from "@/lib/utils.js";
import React, { memo } from "react";
import Lottie from "lottie-react";

const EmptyContainer = () => {
  return (
    <div
      className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all"
      aria-label="Empty Container"
    >
<Lottie
  animationData={animationDefaultOptions.animationData}
  loop={animationDefaultOptions.loop}
  style={{ height: 200, width: 200 }}
/>

      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center justify-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
        <h2 className="poppins-medium">
          Hi<span className="text-purple-500">!</span> Welcome to Synchronous
          Chat App
          <span className="text-purple-500">.</span>
        </h2>
      </div>
    </div>
  );
};

export default memo(EmptyContainer);
