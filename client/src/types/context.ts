import { createContext } from "react";
import { TSchema } from ".";
import SecureConnection from "../utils/SecureConnection";


export type TContextType = {
  conn:SecureConnection,
  data:TSchema
}

const Context = createContext<TContextType | undefined>(undefined);

export default Context;
