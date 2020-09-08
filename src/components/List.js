import React, {useState, useEffect} from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
    faPalette,
    faComment
} from '@fortawesome/free-solid-svg-icons'
import { Droppable, Draggable } from "react-beautiful-dnd";
import { SliderPicker } from "react-color";


export default function List({title, colour, rows, addRow, deleteRow, updateRowNumber, droppableId, transfer, showNotes}){
    const [paletteVisibility, setPaletteVisibility] = useState(false);
    const [listColour, setListColour] = useState(colour);
    
    const listButtons = [
        <FontAwesomeIcon icon={faPalette} size="3x" style={{cursor: "pointer"}} onClick={() => setPaletteVisibility(!paletteVisibility)}/>
    ]

    const getListStyle = isDraggingOver => ({
        //background: isDraggingOver ? "lightblue" : "lightgrey",
        padding: "0.5em",
      });

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: "none",
        padding: "0.5em",
        //background: isDragging ? "lightgreen" : "grey",
        
        // styles we need to apply on draggables
        ...draggableStyle
    });

    const testStyles = {
        default: {
            hue: {
                height: '10px',
                width: '90%',
                margin: 'auto',
            },
        },
      }

    return (
        <div className="list" style={{backgroundColor: listColour, color: listColour}}>

            <TitleBar title={title} buttons={listButtons}/>
            {paletteVisibility &&
            (
                <div style={{background: "#00000060"}}>
                <SliderPicker
                    styles = {testStyles}
                    color = {listColour}
                    onChange={(e) => {
                        setListColour(e.hex);
                        //setPaletteVisibility(false);
                    }}
                />
              </div>
            )}

            <div className="listRowContainer">
                <Droppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {rows.map((row, index) => (
                            <Draggable key={row.id} draggableId={row.id.toString(10)} index={index}>   
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}
                                    >
                                        <span>
                                            <ListRow content={row.displayName} rowNumber={index + 1} colour={colour} deleteRow={deleteRow} updateRowNumber={updateRowNumber} transfer={transfer} showNotes={showNotes}/>
                                        </span>
                                    </div>
                                )}
                            </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                <div className="addRowButton">
                    <span onClick={addRow}> + ADD NEW DIAGNOSIS </span>
                </div>
            
            </div>
        </div>
    )
}


function ListRow({colour, content, rowNumber, deleteRow, updateRowNumber, transfer, showNotes}) {

    const [inputNum, setInputNum] = useState(rowNumber);

    const handleKeyDown = (e) => {
        if (e.key == "Enter") {
            updateRowNumber(rowNumber - 1, inputNum - 1);
        }
    }

    const handleBlur = () => {
        updateRowNumber(rowNumber - 1, inputNum - 1);
    }

    useEffect(() => setInputNum(rowNumber), [rowNumber]);

    return (
        <div className="listRow">
            <div className="listNumber">
                <input style={{color: colour}} value={inputNum} onChange={(e) => setInputNum(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleBlur} type="text"/>
            </div>
            <div className="listEntry">
                <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                <span style={{flexGrow: 1, marginLeft: "1em"}}> {content} </span>
                <div>
                    <FontAwesomeIcon onClick={() => showNotes(rowNumber - 1)} style={{cursor: "pointer", marginRight: "0.5em"}} color="grey" icon={faComment}/>
                    <FontAwesomeIcon onClick={() => deleteRow(rowNumber - 1)} style={{cursor: "pointer"}} color="grey" icon={faMinusCircle}/>
                </div>
            </div>
            <div className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
        </div>
    )
}
