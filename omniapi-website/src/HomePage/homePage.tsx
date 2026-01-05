import React, { useContext, useState} from "react";
import TableUI from './mainTable/TableUI.tsx'
import "./homePage.css"

import MenuBar from "../MenuBar/MenuBar.tsx";
import ConvertTable from './convertTable/convertTable.tsx'
import { useParams } from 'react-router-dom';
import { itemPortalSetFiles } from "../App.tsx";
export default function HomePage(){

  const [convert, setConvert] = useState(false)
  const [formats, setFormats] = useState<string[]>([]);
  const { format } = useParams<{ format?: string }>();
  const formatSplit=  format?.split('-')
  const {files, setFiles} = useContext(itemPortalSetFiles);
  return (
    <>
      <MenuBar/>
        {!convert?(
          <div style={{ display: "flex", flexDirection: "column", height: "40vh" }}>
            <div style={{ color: "white", textAlign: "center" }}>
              
            </div>
              <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }} >
                <div className="border" >
                  <TableUI setConvert={setConvert} setFiles={setFiles} />
              </div>
          </div>
        </div>
        ):
        (<div>
          <ConvertTable files={files} setFiles={setFiles} setConvert={setConvert} setFormats={setFormats} formats={formats}/>
        </div>)
        }
    </>
  );
}