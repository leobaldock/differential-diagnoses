import React, {useState, useEffect} from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { Droppable, Draggable } from "react-beautiful-dnd";
import { SliderPicker } from "react-color";
import SnomedSearch from './SnomedSearch';
import TextareaAutosize from 'react-textarea-autosize';
import useLocalStorage from '../hooks/useLocalStorage';
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
    faAngleDoubleLeft,
    faComment,
    faCommentMedical,
    faTintSlash,
    faPlusSquare
} from '@fortawesome/free-solid-svg-icons'


export default function List({title, colour, showColourPalette, rows, addRow, deleteRow, updateRowNumber, droppableId, transfer, isLeft, setSnomed, setNote, setNotesOpen}){
    const [listColour, setListColour] = useLocalStorage(`${isLeft ? "left" : "right"}_list_colour`, colour);
    const [resetColourColour, setResetColourColour] = useState("white")
    const [addColour, setAddColour] = useState("white")

    const getListStyle = (snapshot) => {
        // console.log(snapshot);
        return {
            padding: "0.5em",
        }
    };

    const getItemStyle = (draggableStyle, snapshot) => {
        // console.log(snapshot);
        return {
            userSelect: "none",
            padding: "0.5em",
            outline: "none",
            ...draggableStyle
        }
    };

    const listButtons = [
        <FontAwesomeIcon
            icon={faPlusSquare}
            size="2x"
            title="Add New Diagnosis"
            style={{ cursor: "pointer" }}
            color={addColour}
            onMouseEnter={() => setAddColour("grey")}
            onMouseLeave={() => setAddColour("white")}
            onClick={addRow}
        />
    ];
    if (showColourPalette && listColour !== colour) {
        listButtons.unshift((
            <FontAwesomeIcon
                icon={faTintSlash}
                size="2x"
                title="Reset Colour"
                style={{ cursor: "pointer" }}
                color={resetColourColour}
                onMouseEnter={() => setResetColourColour("grey")}
                onMouseLeave={() => setResetColourColour("white")}
                onClick={() => {
                    setListColour(colour);
                    setResetColourColour("white");
                }}
            />
        ));
    }

    return (
        <div className="list" style={{backgroundColor: listColour, color: listColour}}>
            <div onClick={(e) => e.stopPropagation()}>
                <TitleBar title={title} buttons={listButtons}/>
                {showColourPalette &&
                (
                    <div style={{background: "#00000060"}}>
                    <SliderPicker
                        color = {listColour}
                        onChange={(e) => setListColour(e.hex)}
                        styles = {{
                            default: {
                                hue: {
                                    height: '10px',
                                    width: '90%',
                                    margin: 'auto',
                                },
                            }
                        }}
                    />
                </div>
                )}
            </div>

            <div className="listRowContainer">
                <div className="listRowScroll">
                    <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot)}
                        >
                            {rows.map((row, index) => (
                                <Draggable key={row.id} draggableId={row.id.toString(10)} index={index}>   
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(provided.draggableProps.style, snapshot)}
                                        >
                                            <span>
                                                <ListRow
                                                    setSnomed={newSnomed => setSnomed(row, newSnomed)}
                                                    setNote={newNote => setNote(row, newNote)}
                                                    setNotesOpen={newIsNotesOpen => setNotesOpen(row, newIsNotesOpen)}
                                                    isNotesOpen={row.isNotesOpen}
                                                    content={row.snomed}
                                                    note={row.note}
                                                    rowNumber={index + 1}
                                                    listColour={listColour}
                                                    deleteRow={deleteRow}
                                                    updateRowNumber={updateRowNumber}
                                                    transfer={transfer}
                                                    isLeft={snapshot.draggingOver == null ? isLeft : snapshot.draggingOver === "droppable1"}
                                                />
                                            </span>
                                        </div>
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>    
            </div>
        </div>
    )
}


function ListRow({listColour, note, content, isNotesOpen, rowNumber, deleteRow, updateRowNumber, transfer, setNote, isLeft, setSnomed, setNotesOpen}) {

    const [inputNum, setInputNum] = useState(rowNumber);
    const [commentColour, setCommentColour] = useState("grey");
    const [deleteColour, setDeleteColour] = useState("grey");

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            updateRowNumber(rowNumber - 1, inputNum - 1);
        }
    }

    const handleBlur = () => {
        updateRowNumber(rowNumber - 1, inputNum - 1);
    }

    useEffect(() => setInputNum(rowNumber), [rowNumber]);

    return (
        <div className="listRow">
            {!isLeft &&
                <div style={{marginRight: "1em"}}className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </div>
            }

            <div className="listNumber">
                <input
                    style={{color: "white", background: "#00000060"}}
                    value={inputNum} onChange={(e) => setInputNum(e.target.value.replace(/[^0-9]+/g, ''))}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    type="text"
                />
            </div>
            <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                <div className="listEntry">
                    <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                    <span style={{flexGrow: 1, marginLeft: "1em", marginRight: "1em"}}>
                        <SnomedSearch content={content} callback={setSnomed} listColour={listColour} />
                    </span>
                    <div>
                        <FontAwesomeIcon
                            style={{cursor: "pointer", transition: "0.1s ease"}}
                            color={commentColour}
                            title={isNotesOpen ? "Hide Note" : "Show note"}
                            icon={note ? faComment : faCommentMedical}
                            onClick={() => setNotesOpen(!isNotesOpen)}
                            onMouseOver={() => setCommentColour(listColour)}
                            onMouseLeave={() => setCommentColour("grey")}
                        />
                        <FontAwesomeIcon
                            onClick={() => deleteRow(rowNumber - 1)}
                            title="Delete Diagnosis"
                            style={{cursor: "pointer", paddingLeft:"0.5em"}}
                            color={deleteColour}
                            icon={faMinusCircle}
                            onMouseOver={() => setDeleteColour(listColour)}
                            onMouseLeave={() => setDeleteColour("grey")}
                        />
                    </div>
                </div>
                {isNotesOpen && <div className="note">
                    <TextareaAutosize onChange={e => setNote(e.target.value)} value={note} />
                </div>}
            </div>
            {isLeft &&
                <div className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                </div>
            }
        </div>
    )
}
