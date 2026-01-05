import {Table,TableRow,TableCell,TableBody, TableContainer} from "@mui/material"
import DropDownConvert from "./dropDownConvert/dropdownConvert";
import AddFilesButton from "./addFilesButton/addFilesButton";
import './convertTable.css'
import React from "react";
import DeleteFileButton from "./deleteFileButton/deleteFileButton";
import StartConvertButton from "./StartConvertButton/StartConvertButton";
type Props = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  setConvert: React.Dispatch<React.SetStateAction<boolean>>
  setFormats: React.Dispatch<React.SetStateAction<string[]>>
  formats: string[]
};

export function convert(file: number) {
  if (file >= 1024 * 1024 * 1024) {
    return (file / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  } else if (file >= 1024 * 1024) {
    return (file / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (file >= 1024) {
    return (file / 1024).toFixed(2) + ' KB';
  } else {
    return file + ' B';
  }
}
export default function ConverTable({files,setFiles,setConvert, setFormats,formats}: Props){
    return(
    <>  
      <AddFilesButton setFiles={setFiles} />
        <TableContainer className='table' >
            <Table>
                <TableBody>
                    {files.map((file, index) =>(
                    <TableRow key={index}>
                        <TableCell sx={{color:'aliceblue'}}>
                            <div className='cell'>
                                <span> {file.name} </span>
                                <span> {convert(file.size)} </span>
                            </div>
                        </TableCell>
                        <TableCell  sx={{padding:'0px'}} style={{color: "aliceblue"}}>
                            <p>Output:</p>
                        </TableCell>
                        <TableCell sx={{padding:'3px', paddingLeft:'5px'}} >
                            <DropDownConvert index={index} setFormats={setFormats} file={file} formats={formats}/>
                        </TableCell>
                        <TableCell sx={{paddingLeft:'0px'}}>
                          <DeleteFileButton index={index} setFiles={setFiles} setConvert={setConvert} files={files} setFormats={setFormats}/>
                        </TableCell>
                    </TableRow>
                    ))
                  }
                </TableBody>
            </Table>
        </TableContainer>
      <StartConvertButton files = {files} formats = {formats}/>
    </>
    )
}