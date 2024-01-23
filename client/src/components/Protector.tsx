import { PropsWithChildren, useEffect, useState } from "react";
import Context, { TContextType } from "../types/context";
import SecureConnection from "../utils/SecureConnection";
import Loading from "./Loading";

export default function Protector({ children }: PropsWithChildren) {

  const [
    ctx, setCtx
  ] = useState<TContextType>();

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    
    const loader = async () => { 
      try { 
        await SecureConnection.init().then(setCtx);
      } catch (e){
        console.log((e as Error).message);
        setFailed(true);
      }
    }

    return () => { 
      loader();
    }
  
  }, []);

  if(failed) return <Loading message="Failed to load data!">
    {<button onClick={() => window.location.href = '/'}>Reload</button>}
  </Loading>;

  if(!ctx) return <Loading message="Loading..." />;

  return (
    <Context.Provider
      value={
        ctx
      }
    >
      {children}
    </Context.Provider>
  );
}
