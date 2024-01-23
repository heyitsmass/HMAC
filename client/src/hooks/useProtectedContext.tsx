import React from "react";
import ProtectedContext from "../types/context";

function useProtectedContext() {
  const context = React.useContext(
    ProtectedContext
  );

  if (!context)
    throw new Error("useProtectedContext must be used under a Protector");

  return context;
}

export default useProtectedContext;
