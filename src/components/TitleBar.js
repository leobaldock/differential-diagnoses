import React from "react";

export default function TitleBar({title, buttons}){

    return (
        <div class="titleBar">
            <h1>{title}</h1>
            
            <div class="buttonContainer">
                {buttons.map(x => x)}
            </div>
        </div>
    )
}