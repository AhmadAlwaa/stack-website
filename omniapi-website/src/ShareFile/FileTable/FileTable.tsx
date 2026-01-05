import { TableContainer, TableBody, TableRow, TableCell, IconButton, Alert } from "@mui/material"
import {useState} from 'react'
import UploadProgressBar from "./UploadProgressBar/UploadProgressBar"
import LinkIcon from '@mui/icons-material/Link';
import ShareLinkMenu from "./ShareLinkMenu/ShareLinkMenu"
import DeleteIcon from '@mui/icons-material/Delete';
type Props={
    files:File[]
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
    setShowTable:React.Dispatch<React.SetStateAction<boolean>>
    open:boolean
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
}


const FileTable = ({files, setFiles, setShowTable, open, setOpen}:Props) =>{
  const [uploadDone,setUploadDone] = useState(false)
  
  const [file_ids, setFileIDs] = useState<string[]>([])
  const changeRowCount = (i:number)=>{
    const count = files.length
    setFiles((prev) => prev.filter((_,index) => index !== i))
    if (count ==1){
        setShowTable(false)
    }
  }
    return(
        <>
          <ShareLinkMenu setShowTable={setShowTable} setFiles = {setFiles} file_ids = {file_ids} open={open} setOpen={setOpen}/>
          <TableContainer  sx={{
            border: '3px solid #7fe5ff',
            borderRadius: '0px',
            borderTopRightRadius: '5px'}}>
              <TableBody>
                  {files.map((file,index) =>(
                  <TableRow key= {index}>
                      <TableCell>
                          <div style={{display:'flex', flexDirection:'column', gap:15, color:'aliceblue'}}>
                          <span> {file.name} </span>
                          </div>
                      </TableCell>
                      <TableCell sx={{width:100}}>
                          <UploadProgressBar file={file} setUploadDone={setUploadDone} setFileID ={setFileIDs} />
                      </TableCell>
                      
                      { uploadDone &&
                      <TableCell>
                      <IconButton onClick={() =>changeRowCount(index)}
                      aria-label="delete" size="medium" sx={{"&:focus": {outline:'none'}}}>
                          <DeleteIcon sx={{ color:'red' }}>
                          </DeleteIcon>
                      </IconButton>
                      </TableCell>
                  }
                  </TableRow>
                  ))}
              </TableBody>
          </TableContainer>
        </>
    )
}
export default FileTable