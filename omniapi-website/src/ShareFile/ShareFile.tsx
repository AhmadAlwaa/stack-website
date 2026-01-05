import TableUI from "../HomePage/mainTable/TableUI"
import {useState} from "react"
import AddFilesButton from "../HomePage/convertTable/addFilesButton/addFilesButton";
import { Typography,Button, Box } from "@mui/material";
import FileTable from "./FileTable/FileTable"
import MenuBar from "../MenuBar/MenuBar";
import ShareButton from "./ShareButton";
const ShareFilePage = ()=>{
    const [files, setFiles] = useState<File[]>([]);
    const [showTable, setShowTable] = useState(false)
    const [open, setOpen] = useState(false);
    return (
        <><MenuBar/>
        
            {!showTable?(<div style={{display:'flex', 
                alignItems:'center', 
                justifyContent:'center',
                border: '2px dashed rgb(71, 138, 231)',
                backgroundColor: 'rgba(0, 51, 161, 0.084)',
                paddingLeft: '10vw',
                paddingRight: '10vw',
                paddingTop: '45px',
                paddingBottom: '45px',
                }}>
                <Typography sx={{fontSize:'3vw', position:'absolute', marginTop:'-35vw', fontFamily:'Keep Calm'}}>
                                Share Files
                              </Typography>
                <TableUI setConvert={setShowTable} setFiles={setFiles}/>
            </div>):(
                <div>
                    <Box sx={{display:'flex', flexDirection:'row', width:'101%', justifyContent:'space-between'}}>
                        <AddFilesButton setFiles={setFiles} />
                        <ShareButton setOpen={setOpen}/>
                    </Box>
                    <FileTable setOpen={setOpen} open={open} files = {files} setFiles = {setFiles} setShowTable={setShowTable}/>
                </div>
            )}
        </>
    )
}
export default ShareFilePage