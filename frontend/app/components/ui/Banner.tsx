"use client";

import React from "react";
import Image from "next/image";

interface BannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  description,
  imageSrc="",
}) => {
  return (
    <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg mb-5">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt="banner background"
        fill
        className="object-cover brightness-85"
        priority
      />

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 mb-4 md:px-10 text-white">
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{title}</h1>
        {subtitle && (
          <p className="text-lg font-medium mt-1 opacity-90">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm md:text-base mt-2 max-w-2xl opacity-80">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(Banner);
