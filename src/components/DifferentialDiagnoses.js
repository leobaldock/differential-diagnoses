import React from "react";
import TitleBar from "./TitleBar"
import List from "./List"
import "./Diagnoses.css";
import Popup from "./Popup";

export default function DifferentialDiagnosis(){


    return (
        <div>
            <TitleBar title="Differential Diagnoses"/>
            <div class="listContainer">
                <List title="LIKELY" colour="#5DAD89"/>
            </div>
        </div>
    )
}