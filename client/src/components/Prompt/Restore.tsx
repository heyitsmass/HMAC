import { FormEvent } from "react";

export default function RestorePrompt({
  memoizedData,
  onSubmit,
}: {
  memoizedData: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <>
      <h1>Restore Data</h1>
      <small className="italic">
        We've detected a mismatch between the server data.
      </small>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <p>Would you like to restore the data back to: </p>
        <input name="data" defaultValue={memoizedData}></input>
        <button type="submit">Restore</button>
      </form>
    </>
  );
}
