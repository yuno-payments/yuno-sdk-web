import { useContext } from "react";
import { YunoContext } from "../context/YunoContext";

export const useYuno = () => {
  const { client } = useContext(YunoContext);
  return client;
};
