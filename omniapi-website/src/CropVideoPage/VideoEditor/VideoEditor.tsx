import Video, {VideoHandle} from "./Video/Video"
import Selection from "./Selection/Selection"
import {useState,useRef , useEffect} from 'react'
import VideoTimeScale from "./VideoTimeScale/VideoTimeScale"
import SideMenu from "../SideMenu/SideMenu"
import OverlayButton from "./OverLayButton/OverLayButton"
import { ExportFunction } from "./ToServerFunctions/ExportFunction"
import { GetFileFromServer } from "../../ServerLink/getFileFromServer";
import { ConvertBlob } from "../../DownloadPage/DownloadTable/DownloadProgressBar/blob/convertBlob";
import { CutFunction } from "./ToServerFunctions/CutFunction"
import {TextOverlayFunction} from "./ToServerFunctions/TextOverlayFunction"
import { Box } from "@mui/material"
import MovableText from "./MovableText/MovableText"
import { UploadFunction } from "../VideoEditor/ToServerFunctions/UploadFunction";
import { SetValues } from "./setValues"
import { FileProps, dimensionsProps, selectionPosProps, exportOptionsProps, textPropProps, displayValuesProps} from "./Props"

const VideoEditor=({file}:FileProps)=>{
    const [dimensions, setDimensions] = useState<dimensionsProps>({width:1920, height:1080})
    const [selectionPos, setSelectionPos] = useState<selectionPosProps>({x:50, y:50, x2: 50, y2:50})
    const videoRef = useRef<VideoHandle>(null)
    const [value, setValue] = useState<number[]>([0,1])
    const [overlayImage, setOverlayImage] = useState<File|null>(null)
    const [exportOptions, setExportOptions] = useState<exportOptionsProps>({exportText:false, selectState:true})
    const[muted, setMuted] = useState(false)
    const [exportValues, setExportValues] = useState<{
        file:File, 
        values: number[], 
        textProps:textPropProps,
        videoRatio:dimensionsProps, 
        selectionPos: selectionPosProps,
        dimesion:dimensionsProps }|null>(null)
    const [startExport, setStartExport] = useState(false)
    const [textProp, setTextProp] = useState<textPropProps>({text: 'text',fontSize:48, fontFamily: "Arial", fill: "white", x:0, y:0, textWidth:15, textHeight: 15})
    const [videoRatio, setVideoRatio] = useState<dimensionsProps>({width:1920, height:1080})
    const [displayValues, setDisplayValues] = useState<displayValuesProps>({width:0, height:0, x:0, y:0})
    useEffect(()=>{
        const cropvalues = SetValues(videoRatio, selectionPos, dimensions)
        setDisplayValues({width: cropvalues.cropWidth, height:cropvalues.cropHeight, x:cropvalues.cropX, y:cropvalues.cropY})
    },[selectionPos])
    useEffect(()=>{
        setExportValues({file: file, values:value, textProps:textProp, videoRatio:videoRatio, selectionPos:selectionPos, dimesion:dimensions })
    },[file, value, textProp, videoRatio, selectionPos, dimensions ] )
    
    return(
        <> 
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: { sm: '30px', md: '125px', xs:'-200px' },
                }}
                >
                <div style={{maxWidth:dimensions.width || '100%'}}>
                    <OverlayButton muted={muted} setMuted = {setMuted} exportOptions={exportOptions} setExportOptions={setExportOptions} setOverlayImage={setOverlayImage}/>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    
                    <div>
                        <div style={{position:'relative',  display: "inline-block" }}>
                            {exportOptions.exportText &&(
                            <MovableText textProp={textProp} dimensions={dimensions} setTextProp={setTextProp} videoRatio={videoRatio} />
                            )}
                            <Video  setVideoRatio={setVideoRatio} muted = {muted} setDimensions = {setDimensions} ref={videoRef} overlayImage={overlayImage} file={file}/>
                            <Selection exportOptions = {exportOptions} dimensions = {dimensions}  setSelectionPos={setSelectionPos} selectionPos={selectionPos}/>
                        </div>
                    
                        <div>
                            <VideoTimeScale  value={value} setValue={setValue} videoRef={videoRef}/>
                        </div>
                        
                    </div> 
                    <div style={{display:'flex', justifyContent:'center',}}>
                            <SideMenu 
                            dimensions = {dimensions} 
                            displayValues = {displayValues}
                            setSelectionPos={setSelectionPos}
                            setStartExport = {setStartExport}
                            setTextProp = {setTextProp}
                            textProp = {textProp}
                            exportOptions = {exportOptions}
                            setExportOptions = {setExportOptions}
                            exportValues = {exportValues}
                            />
                    </div>
                </div>
            </Box>
            
        </>
    )
}
export default VideoEditor