import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

function useLanguage() {
  return useContext(LanguageContext);
}

export default useLanguage;
