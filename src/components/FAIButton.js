import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";


/**
 * Wrapper component for FaIcons to make hovering easier. Good for buttons.
 * Will accept all props that the FontAwesomeIcon would normally take.
 * Set the colour using the color prop. Also define a hover colour using the
 * hoverColor prop. 
 */
export default function FAIButton(props) {
    const [isMouseOver, setMouseOver] = useState(false);

    const color = props.color ? props.color : "white";
    const hoverColor = props.hoverColor ? props.hoverColor : "grey";

    const innerProps = {
        // defaults
        icon: faQuestion,
        size: "2x",
        style: { cursor: "pointer" },

        // provided props
        ...props,

        // color handling
        color: isMouseOver ? hoverColor : color,
        onMouseOver: () => setMouseOver(true),
        onMouseLeave: () => setMouseOver(false)
    };
    delete innerProps.hoverColor; // don't need to pass this guy through

    return <FontAwesomeIcon {...innerProps} />;
}