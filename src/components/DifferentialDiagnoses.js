import React, {useState} from "react";
import TitleBar from "./TitleBar"
import List from "./List"
import "./Diagnoses.css";
import Popup from "./Popup";


export default function DifferentialDiagnosis(){
    const [rows, setRows] = useState([]);
    const [deletingRow, setDeletingRow] = useState(null);

    const addRow = () => {
        rows.push("Sample" + rows.length);
        setRows([...rows]);
    }

    const deleteRow = (index) => {
        rows.splice(index, 1);
        setRows([...rows]);
        setDeletingRow(null);
    }

    const updateRowNumber = (from, to) => {

        if (rows.length < 2) return;

        // Go to top of list
        if (to < 0) to = 0;

        // Go to bottom of list
        if (to >= rows.length) to = rows.length - 1;

        const result = Array.from(rows);
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        setRows(result);
    }

    return (
        <>
            <TitleBar title="Differential Diagnoses"/>
            <div class="listContainer">
                <List title="LIKELY DIAGNOSIS" colour="#5DAD89" rows={rows} addRow={addRow} deleteRow={setDeletingRow} updateRowNumber={updateRowNumber}/>
            </div>

            {(deletingRow || deletingRow == 0) &&
                <Popup
                    title="Are you sure you want to delete this diagnosis?"
                    yesCallback={() => deleteRow(deletingRow)}
                    noCallback={() => setDeletingRow(null)}
                >
                    {rows[deletingRow]}
                </Popup>}
        </>
    );
}