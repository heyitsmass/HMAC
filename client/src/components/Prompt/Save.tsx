import { FormEvent, SyntheticEvent } from "react";
import { TSchema } from "../../types";

const SavePrompt = ({
  data,
  handleUpdate,
  handleVerify,
}: {
  data: TSchema["data"];
  handleUpdate: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleVerify: (e: SyntheticEvent) => Promise<void>;
}) => {
  return (
    <>
      <h1>Saved Data</h1>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4 p-4">
        <input name="data" type="text" defaultValue={data} />
        <span className="flex gap-4">
          <button type="submit">Update Data</button>
          <button onClick={handleVerify}>Verify Data</button>
        </span>
      </form>
    </>
  );
};

export default SavePrompt;
