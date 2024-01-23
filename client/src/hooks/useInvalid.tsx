import { useState } from "react";

const useInvalid = <T,>() => {
  const [invalid, setInvalid] = useState({
    value: false,
    data: {
      value: JSON.parse(localStorage.getItem("data") || "") as T,
      set: (value: T) => {
        localStorage.setItem("data", JSON.stringify(value));
        setInvalid({
          ...invalid,
          data: {
            ...invalid.data,
            value,
          },
        });
      },
    },
    set: (value: boolean) => {
      setInvalid({ ...invalid, value });
    },
  });

  return invalid;
};

export default useInvalid;
