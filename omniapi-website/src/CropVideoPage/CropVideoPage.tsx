import MenuBar from "../MenuBar/MenuBar"
import TableUI from "../HomePage/mainTable/TableUI"
import {useState} from "react"
import { Typography } from "@mui/material"
import VideoEditor from "./VideoEditor/VideoEditor"
const CropVideoPage = ()=>{
    const [files, setFiles] = useState<File[]>([]);
    const [convert, setConvert] = useState(false)
    return(
        <>
            <MenuBar/>
            {!convert?(<div style={{display:'flex', 
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
                    Edit Video
                </Typography>
                <TableUI setConvert={setConvert} setFiles={setFiles}/>
            </div>):(
                <VideoEditor file={files[0]}/>
            )}
        </>
    )
}
export default CropVideoPage