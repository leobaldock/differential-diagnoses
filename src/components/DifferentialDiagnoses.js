import { faComments as faCommentsRegular } from "@fortawesome/free-regular-svg-icons";
import { faMarkdown, faJsSquare } from "@fortawesome/free-brands-svg-icons";
import { faComments as faCommentsSolid, faDownload, faPalette, faSave, faFilePdf} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { CircleLoader } from "react-spinners";
import { withFHIR } from "../state/fhir";
import "../css/diagnoses.css";
import FAIButton from "./FAIButton";
import List from "./List";
import Popup from "./Popup";
import TitleBar from "./TitleBar";
import Sidebar from "react-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class DifferentialDiagnosis extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      listA: [
        // Each row/diagnosis should look something like this.
        // We'll probably add more when we get FIHR resource integrated
        // {
        //     id: "129842",
        //     snomed: {
        //        code: 1233,
        //        display: "cancer"
        //     },
        //     note: "",
        //     isNoteOpen: false
        // }
      ],
      listB: [],
      deletingRow: null, // [list, index]
      loading: false,
      showColourPalette: false,
      showSideBar: false
    };

    this.id2List = {
      droppable1: "listA",
      droppable2: "listB",
    };

    this.addRow = this.addRow.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.updateRowNumber = this.updateRowNumber.bind(this);
    this.reorder = this.reorder.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.getList = this.getList.bind(this);
    this.move = this.move.bind(this);
    this.manualMove = this.manualMove.bind(this);
    this.saveToFHIR = this.saveToFHIR.bind(this);
    this.getExportableObject = this.getExportableObject.bind(this);
    this.getMarkDown = this.getMarkDown.bind(this);
    this.getMarkDown2 = this.getMarkDown2.bind(this);
    this.getMenuContent = this.getMenuContent.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { FHIR } = this.props;
    const { episodeOfCare } = FHIR;
    if (
      episodeOfCare !== prevProps.FHIR.episodeOfCare &&
      episodeOfCare.diagnosis
    ) {
      /* Show loader */
      this.setState({ loading: true });

      /* The episodeOfCare was updated and contains diagnoses, load the lists with these diagnoses */
      let newListA = [];
      let newListB = [];

      /* To reduce queries, find all the conditions for this patient and then we will filter them */
      this.props.FHIR.searchResources("Condition", {
        patient: FHIR.makeRef(FHIR.patient),
      }).then((result) => {
        episodeOfCare.diagnosis.forEach((e, index) => {
          /* Find the condition in the patient's list of conditions */
          const condition = result.entry.find(
            (c) => c.fullUrl === `${FHIR.iss}/${e.condition.reference}`
          ).resource;

          let list = e.role.text === "Likely" ? newListA : newListB;
          list.splice(e.rank, 0, {
            id: index,
            note: "",
            snomed: {
              code: condition.code.coding[0].code,
              display: condition.code.coding[0].display,
            },
          });
        });

        this.setState({ listA: newListA, listB: newListB, loading: false });
      });
    }
  }

  getExportableObject() {
    return {
      "Likely Diagnoses": this.state.listA.map(row => ({
        "Name": row.snomed.display,
        "SNOMED Code": row.snomed.code,
        "Note": row.note ? row.note : "..."
      })),
      "Critical Diagnoses": this.state.listB.map(row => ({
        "Name": row.snomed.display,
        "SNOMED Code": row.snomed.code,
        "Note": row.note ? row.note : "..."
      })),
      "Metadata": {
        // bump this every time you change the format of the export.
        // that we we can handle imports properly.
        "Schema Version": 1
      }
    };
  }

  getMarkDown() {
    const data = this.getExportableObject();

    let result = "";

    // title section
    result += "# DiagnoSys - *A Differential Diagnosis Tool*\n\n";
    result += "TODO: add logo image here\n\n\n";

    // critical
    result += "## Critical Diagnoses\n\n";
    result += "#| Diagnosis | SNOMED Code | Note\n";
    result += ":--- | :--- | :--- | :---\n";
    data["Critical Diagnoses"].forEach((diagnosis, index) => {
      result += `${index} | ${diagnosis.Name} | ${diagnosis["SNOMED Code"]} | ${diagnosis.Note}\n`;
    });
    result += "\n\n";

    // likely
    result += "## Likely Diagnoses\n\n";
    result += "#| Diagnosis | SNOMED Code | Note\n";
    result += ":--- | :--- | :--- | :---\n";
    data["Likely Diagnoses"].forEach((diagnosis, index) => {
      result += `${index} | ${diagnosis.Name} | ${diagnosis["SNOMED Code"]} | ${diagnosis.Note}\n`;
    });

    return result;
  }

  getMarkDown2() {
    const data = this.getExportableObject();

    // fill blank rows if needed
    if (data["Critical Diagnoses"].length === 0) {
      data["Critical Diagnoses"].push({
        Name: "No Diagnoses Listed",
        "SNOMED Code": "",
        Note: ""
      });
    }
    if (data["Likely Diagnoses"].length === 0) {
      data["Likely Diagnoses"].push({
        Name: "No Diagnoses Listed",
        "SNOMED Code": "",
        Note: ""
      });
    }

    

    const json2md = require("json2md");

    const input = [
      { h1: "DiagnoSys - *A Differential Diagnosis Tool*"},
      { h2: "Critical Diagnoses" },
      { table: {
        headers: [ "#", "Diagnosis", "SNOMED Code", "Note"],
        rows: data["Critical Diagnoses"].map((diagnosis, index) => ([
          index + 1, diagnosis.Name, diagnosis["SNOMED Code"], diagnosis.Note
        ]))
      }},
      { h2: "Likely Diagnoses" },
      { table: {
        headers: [ "#", "Diagnosis", "SNOMED Code", "Note"],
        rows: data["Likely Diagnoses"].map((diagnosis, index) => ([
          index + 1, diagnosis.Name, diagnosis["SNOMED Code"], diagnosis.Note
        ]))
      }}
    ];

    return json2md(input);
  }

  addRow(list) {
    list.push({
      id: new Date().getTime(),
      snomed: {},
      note: "",
      isNotesOpen: false
    });

    if (list === this.state.listA) this.setState({ listA: [...list] });
    else if (list === this.state.listB) this.setState({ listB: [...list] });
    else console.log("Unknown list");
  }

  deleteRow(list, index) {
    list.splice(index, 1);

    let newState = {
      deletingRow: null,
    };

    if (list === this.state.listA) newState.listA = list;
    else if (list === this.state.listB) newState.listB = list;
    else console.log("Unknown list");

    this.setState(newState);
  }

  updateRowNumber(from, to) {
    if (this.state.rows.length < 2) return;
    // Go to top of list
    if (to < 0) to = 0;
    // Go to bottom of list
    if (to >= this.state.rows.length) to = this.state.rows.length - 1;

    const result = this.reorder(this.state.rows, from, to);
    this.setState({
      rows: result,
    });
  }

  reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    if (list.length < 2) return result;
    // Go to top of list
    if (endIndex < 0) endIndex = 0;
    // Go to bottom of list
    if (endIndex >= list.length) endIndex = list.length - 1;

    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  getList(id) {
    return this.state[this.id2List[id]];
  }

  manualMove(sourceList, destinationList, sourceIndex, destinationIndex) {
    const sourceClone = Array.from(sourceList);
    const destClone = Array.from(destinationList);
    const [removed] = sourceClone.splice(sourceIndex, 1);

    destClone.splice(destinationIndex, 0, removed);

    let newState = {};

    if (sourceList === this.state.listA) newState.listA = sourceClone;
    else if (sourceList === this.state.listB) newState.listB = sourceClone;
    else console.log("Uknown List");

    if (destinationList === this.state.listA) newState.listA = destClone;
    else if (destinationList === this.state.listB) newState.listB = destClone;
    else console.log("Unkown List");

    this.setState(newState);
  }

  move(source, destination, droppableSource, droppableDestination) {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  }

  onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const list = this.getList(source.droppableId);
      const items = this.reorder(list, source.index, destination.index);

      if (list === this.state.listA) this.setState({ listA: items });
      else if (list === this.state.listB) this.setState({ listB: items });
      else console.log("Unknown list");
    } else {
      const result = this.move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        listA: result.droppable1,
        listB: result.droppable2,
      });
    }
  }

  async saveToFHIR() {
    const { FHIR } = this.props;

    const likelyDiagnoses = await this.createDiagnosisList(
      this.state.listA,
      "Likely"
    );

    const criticalDiagnoses = await this.createDiagnosisList(
      this.state.listB,
      "Critical"
    );

    const diagnosis = likelyDiagnoses.concat(criticalDiagnoses);

    const episodeOfCare = await FHIR.updateResource(
      `EpisodeOfCare/${FHIR.episodeOfCare.id}`,
      {
        resourceType: "EpisodeOfCare",
        id: FHIR.episodeOfCare.id,
        status: "active",
        patient: { reference: FHIR.makeRef(FHIR.patient) },
        diagnosis,
      }
    );

    FHIR.setEpisodeOfCare(episodeOfCare);
  }

  async createDiagnosisList(list, role) {
    const { FHIR } = this.props;
    return await Promise.all(
      list.map(async (e, index) => {
        /* Create a condition for each item in the list */
        const resource = await FHIR.createResource("Condition", {
          resourceType: "Condition",
          subject: { reference: FHIR.makeRef(FHIR.patient) },
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: e.snomed.code,
                display: e.snomed.display,
              },
            ],
            text: e.snomed.display,
          },
        });

        return {
          condition: { reference: FHIR.makeRef(resource) },
          role: { text: role },
          rank: index + 1,
        };
      })
    );
  }

  getMenuContent() {
    let buttons = [];
    switch (this.state.showSideBar) {
      case "export" :
        buttons = [
          {
            name: "Export as JSON",
            content: (
              <FontAwesomeIcon
                color="black"
                size="2x"
                icon={faJsSquare}
              />
            ),
            onClick: () => {
              downloadObjectAsJson(this.getExportableObject(), "DiagnoSys Export");
              this.setState({showSideBar: false});
            }
          },
          {
            name: "Export as Markdown",
            content: (
              <FontAwesomeIcon
                color="black"
                icon={faMarkdown}
                size="2x"
              />
            ),
            onClick: () => {
              downloadStringAsTextFile(this.getMarkDown2(), "DiagnoSys Export.md");
              this.setState({showSideBar: false});
            }
          },
          {
            name: "Export as Pdf",
            content: (
              <FontAwesomeIcon
                color="black"
                icon={faFilePdf}
                size="2x"
              />
            ),
            onClick: () => {
              downloadMDAsPDF(this.getMarkDown2(), "DiagnoSys Export.pdf");
              this.setState({showSideBar: false});
            }
          },
        ];
        break;
      // case "other menu type":
    }

    return (
      <div className="sidebar">
        {buttons.map(button => 
          <div className="sidebarItem" key={button.name} onClick={button.onClick}>
            <div className="sidebarItemIcon">{button.content}</div>
            <p>{button.name}</p>
          </div>
        )}
      </div>
    );
  }

  renderLoading() {
    return (
      <div className="loading">
        <CircleLoader size={100} />
      </div>
    );
  }

  render() {

    if (this.state.loading) {
      return this.renderLoading();
    }

    const areAllCommentsOpen = this.state.listA.every(row => row.isNotesOpen)
        && this.state.listB.every(row => row.isNotesOpen)

    const pageTitleButtons = [
      <FAIButton
        key="toggle_comments_button"
        icon={areAllCommentsOpen ? faCommentsRegular : faCommentsSolid}
        title={areAllCommentsOpen ? "Hide all notes" : "Show all notes"}
        onClick={() => this.setState(prevState => ({
          listA: prevState.listA.map(
            row => ({ ...row, isNotesOpen: !areAllCommentsOpen })
          ),
          listB: prevState.listB.map(
            row => ({ ...row, isNotesOpen: !areAllCommentsOpen })
          )
        }))}
      />,
      <FAIButton
        key="toggle_colour_palette_button"
        icon={faPalette}
        title={this.state.showColourPalette ? "Hide colour editor" : "Show colour editor"}
        onClick={() => this.setState({showColourPalette: !this.state.showColourPalette})} 
      />,
      <FAIButton
        key="export_button"
        icon={faDownload}
        title="Export"
        onClick={() => this.setState({showSideBar: "export"})}
      />
      // <FontAwesomeIcon
      //   key="save_button"
      //   icon={faSave}
      //   size="2x"
      //   style={{ cursor: "pointer" }}
      //   onClick={this.saveToFHIR}
      // />
    ];

    return (
      <Sidebar
        sidebar={this.getMenuContent()}
        open={!!this.state.showSideBar}
        onSetOpen={open => this.setState({showSideBar: open})}
        styles={{ sidebar: { background: "white" } }}
        touch={false}
        pullRight={true}
        >
          <div
            onClick={() => {
              if (this.state.showColourPalette) {
                this.setState({showColourPalette: false});
              }
            }}
            style={{ height: "100vh", padding: 0, margin: 0, maxHeight: "100vh", width: "100w", maxWidth: "100vw", display: "flex", flexDirection: "column", backgroundColor: "#404040" }}
          >
            <TitleBar title="Differential Diagnoses" buttons={pageTitleButtons} backgroundColor="#343434" />

            <div className="listContainer">
              <DragDropContext onDragEnd={this.onDragEnd}>
                <List
                  title="Likely Diagnoses"
                  colour="#5DAD89"
                  showColourPalette={this.state.showColourPalette}
                  droppableId="droppable1"
                  rows={this.state.listA}
                  addRow={() => this.addRow(this.state.listA)}
                  deleteRow={(index) => {
                    if (this.state.listA[index].snomed.code) {
                      this.setState({ deletingRow: [this.state.listA, index] });
                    } else {
                      this.deleteRow(this.state.listA, index);
                    }
                  }}
                  updateRowNumber={(from, to) =>
                    this.setState({
                      listA: this.reorder(this.state.listA, from, to),
                    })
                  }
                  transfer={(index) =>
                    this.manualMove(this.state.listA, this.state.listB, index, 0)
                  }
                  setSnomed={(row, newSnomed) => {
                    row.snomed = newSnomed;
                    this.setState({ listA: [...this.state.listA] });
                  }}
                  setNote={(row, newNote) => {
                    row.note = newNote;
                    this.setState({ listA: [...this.state.listA] });
                  }}
                  setNotesOpen={(row, isNotesOpen) => {
                    row.isNotesOpen = isNotesOpen;
                    this.setState({ listA: [...this.state.listA] });
                  }}
                  isLeft={true}
                />

                <List
                  title="Critical"
                  colour="#DA7676"
                  showColourPalette={this.state.showColourPalette}
                  droppableId="droppable2"
                  rows={this.state.listB}
                  addRow={() => this.addRow(this.state.listB)}
                  deleteRow={(index) => {
                    if (this.state.listB[index].snomed.code) {
                      this.setState({ deletingRow: [this.state.listB, index] });
                    } else {
                      this.deleteRow(this.state.listB, index);
                    }
                  }}
                  updateRowNumber={(from, to) =>
                    this.setState({
                      listB: this.reorder(this.state.listB, from, to),
                    })
                  }
                  transfer={(index) =>
                    this.manualMove(this.state.listB, this.state.listA, index, 0)
                  }
                  setSnomed={(row, newSnomed) => {
                    row.snomed = newSnomed;
                    this.setState({ listB: [...this.state.listB] });
                  }}
                  setNote={(row, newNote) => {
                    row.note = newNote;
                    this.setState({ listB: [...this.state.listB] });
                  }}
                  setNotesOpen={(row, isNotesOpen) => {
                    row.isNotesOpen = isNotesOpen;
                    this.setState({ listB: [...this.state.listB] });
                  }}
                  isLeft={false}
                />
              </DragDropContext>
            </div>

            {this.state.deletingRow && (
              <Popup
                title="Are you sure you want to delete this diagnosis?"
                yesCallback={() => this.deleteRow(...this.state.deletingRow)}
                noCallback={() => this.setState({ deletingRow: null })}
              >
                {this.state.deletingRow[0][this.state.deletingRow[1]].snomed.display}
              </Popup>
            )}
          </div>
        </Sidebar>
    );
  }
}

async function downloadMDAsPDF(markdown, fileName) {
  
  // input markdown
  const mdBlob = new Blob([markdown], {type: "text/markdown"});
  const mdFile = new File([mdBlob], "input.md");

  // css styling
  const cssRes = await fetch('/pdf.css');
  const cssBlob = await cssRes.blob();
  const cssFile = new File([cssBlob], "stylesheet.css")
  
  const formData  = new FormData();
  formData.append("input_files[]", mdFile);
  formData.append("from", "markdown");
  formData.append("to", "pdf");
  formData.append("css", "stylesheet.css");
  formData.append("other_files[]", cssFile);

  const res = await fetch("https://cors-anywhere.herokuapp.com/http://c.docverter.com/convert", { // a bit of a hack to get around the cors issues for now...
    method: "POST",
    body: formData
  });

  // TODO: check response status code
  const outputBlob = await res.blob();
  window.open(URL.createObjectURL(outputBlob));
}

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  doDownload(dataStr, exportName + ".json");
}

function downloadStringAsTextFile(string, fileName){
  var dataString = "data:text/plain;charset=utf-8," + encodeURIComponent(string);
  doDownload(dataString, fileName);
 
}

function doDownload(dataString, fileName) {
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataString);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export default withFHIR(DifferentialDiagnosis);
