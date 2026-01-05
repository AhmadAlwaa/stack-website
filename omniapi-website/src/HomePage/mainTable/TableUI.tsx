import React, { useState } from "react";
import UploadButton from './UploadButton/UploadButton.tsx'
import { TableContainer,TableHead,Table,TableRow,TableCell } from "@mui/material";
type Props = {
    setConvert: React.Dispatch<React.SetStateAction<boolean>>;
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  };
export default function TableUI ({setConvert, setFiles}: Props) {
  return (
  <>
    <TableContainer>
      <Table>
        <TableHead>
            <TableRow>
                <TableCell sx={{border:"none", padding:"0px"}}>
                    <UploadButton setConvert={setConvert} setFiles={setFiles}/>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell align="center" sx={{border:"none", padding: "0px", color:'aliceblue'}}>
                    <p>Max file Size 100MB</p>
                </TableCell>
            </TableRow>
          </TableHead>
      </Table>
      
      </TableContainer>
  </>
  )
}