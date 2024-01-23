import { PropsWithChildren } from "react";

export default function Loading({ message = "Loading...", children }:PropsWithChildren<{message?:string}>) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{message}</h2>
      <div className="flex items-center justify-center">
      {children}
      </div>
    </div>
  );
}
