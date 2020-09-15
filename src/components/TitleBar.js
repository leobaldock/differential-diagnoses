import React from "react";
import FHIR from "../state/fhir";

const TitleBar = ({ title, buttons }) => {
  const { patient } = FHIR.useContainer();

  return (
    <div class="titleBar">
      <h1>
        {title.toUpperCase()}{" "}
        {patient && `${patient.name[0].given[0]} ${patient.name[0].family}`}
      </h1>
      <div class="buttonContainer">{buttons.map((x) => x)}</div>
    </div>
  );
};

export default TitleBar;
