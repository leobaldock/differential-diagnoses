import React from "react";

const TitleBar = ({ title, buttons }) => {
  return (
    <div class="titleBar">
      <h1>{title.toUpperCase()}</h1>
      <div class="buttonContainer">{buttons.map((x) => x)}</div>
    </div>
  );
};

export default TitleBar;
