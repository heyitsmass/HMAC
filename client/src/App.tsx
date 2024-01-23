"use client";
import React, { FormEvent, SyntheticEvent } from "react";
import "./App.css";
import { RestorePrompt, SavePrompt } from "./components/Prompt";
import useInvalid from "./hooks/useInvalid";
import useProtectedContext from "./hooks/useProtectedContext";
import { TSchema } from "./types";

const App = React.memo(function App() {
  const { conn, data: database } = useProtectedContext();

  const invalid = useInvalid<TSchema>();

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget).get("data")?.valueOf() as string;

    try {
      await conn.send({
        data,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async (e?: SyntheticEvent) => {
    if (e && e.type !== "button") e.preventDefault();

    try {
      await conn.verify();
      alert("Data is valid!");
    } catch (e) {
      console.error(e);
      alert("Data isn't valid!");
      invalid.set(true);
    }
  };

  const handleRecovery = async (e: FormEvent<HTMLFormElement>) => {
    try {
      await handleUpdate(e);
      invalid.set(false);
    } catch (e) {
      console.error(e);
    }
  };

  const Prompt = {
    Save: React.memo(() => (
      <SavePrompt
        data={database.data}
        handleUpdate={handleUpdate}
        handleVerify={handleVerify}
      />
    )),
    Restore: React.memo(() => (
      <RestorePrompt
        memoizedData={invalid.data.value.data}
        onSubmit={handleRecovery}
      />
    )),
  }[invalid.value ? "Restore" : "Save"];

  return (
    <div>
      <Prompt />
    </div>
  );
});

export default App;
