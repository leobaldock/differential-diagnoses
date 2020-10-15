import React from "react";

/**
 * Cute little modular TitleBar used for the main page heading and title of
 * Lists.
 * @param {*} title the title of the titlebar
 * @param {*} buttons an array of buttons used by this title bar
 * @param {*} backgroundColor backgroundColour of title bar 
 */
const TitleBar = ({ title, buttons, backgroundColor }) => {
  
  const style = {};
  if (backgroundColor) style.backgroundColor = backgroundColor

  return (
    <div style={style} className="titleBar">
      <h1>{title.toUpperCase()}</h1>
      <div className="buttonContainer">{buttons.map((x) => x)}</div>
    </div>
  );
};

export default TitleBar;
