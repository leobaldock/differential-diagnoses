import React, { useEffect, useState } from "react";
import FHIR from "../state/fhir";

const TitleBar = ({ title, buttons }) => {
  const [patientState, setPatientState] = useState(null);
  const { patient } = FHIR.useContainer();

  useEffect(() => {
    setPatientState(patient);
  }, patient);

  return (
    <div class="titleBar">
      <h1>
        {title.toUpperCase()}{" "}
        {patientState &&
          `${patientState.name[0].given[0]} ${patientState.name[0].family}`}
      </h1>
      <div class="buttonContainer">{buttons.map((x) => x)}</div>
    </div>
  );
};

export default TitleBar;
