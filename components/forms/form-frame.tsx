import React from "react";

interface FormFrameProps {
  children: React.ReactNode;
}

export function FormFrame({ children }: FormFrameProps) {
  return (
     <div className="flex items-center justify-center">
      <div
        className="shadow-md border-8 border-primary"
      
      >
        <div
         
          className="bg-white w-full p-4 border-8 border-secondary"
        >
          {children}
        </div>
      </div>
    </div>
  );
}