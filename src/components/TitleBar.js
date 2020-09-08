import React, { useState } from "react";
import { TwitterPicker } from 'react-color'

export default function TitleBar({title, buttons}){
    return (
        <div class="titleBar">
            <h1>{title.toUpperCase()}</h1>

            <div class="buttonContainer">
                {buttons.map(x => x)}
            </div>
        </div>
    )
}