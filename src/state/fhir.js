import { useState } from "react";
import { createContainer } from "unstated-next";
import useLocalStorage from "../hooks/useLocalStorage";

const useFHIR = () => {
  const [iss, setIss] = useLocalStorage("iss", null);
  const [launch, setLaunch] = useLocalStorage("launch", null);
  const [metadata, setMetadata] = useLocalStorage("metadata", null);
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", null);
  const [patient, setPatient] = useLocalStorage("patient", null);

  return {
    iss,
    setIss,
    launch,
    setLaunch,
    metadata,
    setMetadata,
    accessToken,
    setAccessToken,
    patient,
    setPatient,
  };
};

const FHIR = createContainer(useFHIR);
export default FHIR;
