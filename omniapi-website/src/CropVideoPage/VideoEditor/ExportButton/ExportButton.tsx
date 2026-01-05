import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { FileProps, dimensionsProps, selectionPosProps, exportOptionsProps, textPropProps, displayValuesProps} from "../../VideoEditor/Props"
import { SetValues } from '../setValues';
import { UploadFunction } from '../ToServerFunctions/UploadFunction';
import { CutFunction } from '../ToServerFunctions/CutFunction';
import { TextOverlayFunction } from '../ToServerFunctions/TextOverlayFunction';
import { ExportFunction } from '../ToServerFunctions/ExportFunction';
import { UploadToServer } from '../../../ServerLink/uploadToServer';
import { itemPortalJob, itemPortalFile, itemPortalFileName, createDownloadTable,stepsPortal } from '../../../App'
type Props ={
   setStartExport: React.Dispatch<React.SetStateAction<boolean>>
    exportValues: {file:File, values: number[], textProps:textPropProps,videoRatio:dimensionsProps, selectionPos: selectionPosProps,dimesion:dimensionsProps} | null
    exportOptions:exportOptionsProps
}
const ExportButton = ({setStartExport,exportValues, exportOptions}:Props) =>{
    const { taskIDs, setTaskIDs }= useContext(itemPortalJob)
    const {showTable, setShowTable} = useContext(createDownloadTable)
    const {fileNames,setFileNames} = useContext(itemPortalFileName)
    const {fileIDs, setFileIDs} = useContext(itemPortalFile)
    const {steps, setSteps} = useContext(stepsPortal)
    const nagivate = useNavigate()
    const handleClick = async() =>{
        setStartExport(true)
        setShowTable(true)
        nagivate("/crop-video/download")
        setSteps([
            "uploading",
            ...(exportOptions.exportText ? ["overlaytext"] : []),
            ...(exportOptions.selectState ? ["cropping"] : []),
            ... (exportValues?.values ? ["trimming"] : [])
            ]);
        console.log([
            "uploading",
            ...(exportOptions.exportText ? ["overlaytext"] : []),
            ...(exportOptions.selectState ? ["cropping"] : []),
            ... (exportValues?.values ? ["trimming"] : [])
            ])
        const fileParts = exportValues?.file.name.split(".");
        if (fileParts){
            const file_name =`${fileParts[0]}_edited.${fileParts[1]}`
            setFileNames([file_name])
        }
        console.log(exportValues)
        if (exportValues){
            let location = 'editor'
            let result = await UploadToServer(exportValues.file, location)
            const task_id = result.task_id
            console.log(result)
            if (result){
                setTaskIDs([task_id])
                let file_id = result.file_id
                
                if (!await UploadFunction(result.job_id)) return
                if (exportValues.values) {
                    let start_times = [];
                    let end_times = [];

                    for (let i = 0; i < exportValues.values.length; i++) {
                        if (i % 2 === 1) end_times.push(Number(exportValues.values[i]));
                        else start_times.push(Number(exportValues.values[i]));
                    }
                    file_id = await CutFunction(file_id, start_times, end_times, location, task_id);
                }
                if (exportOptions.exportText){
                    const ratioX = exportValues.videoRatio.width / exportValues.dimesion.width 
                    const ratioY =  exportValues.videoRatio.height /exportValues.dimesion.height
                    file_id = await TextOverlayFunction(file_id,
                        exportValues.textProps.text, 
                        Math.round(exportValues.textProps.x * ratioX), 
                        Math.round(exportValues.textProps.y * ratioY), 
                        exportValues.textProps.fontSize ,
                        exportValues.textProps.fontFamily,
                        exportValues.textProps.fill,
                        location,
                        task_id
                    )
                }
                if (exportOptions.selectState) {
                    let values = SetValues(exportValues.videoRatio, exportValues.selectionPos, exportValues.dimesion);
                    file_id = await ExportFunction(
                        file_id,
                        values.cropWidth,
                        values.cropHeight,
                        values.cropX,
                        values.cropY,
                        location,
                        task_id,
                        exportValues.videoRatio.height

                    );
                }
                setFileIDs([file_id])
                setStartExport(false);
            }
        }
    }
   


    return(
        <>
            <Button sx={{
                "&:focus": {outline: "none",boxShadow: "none"},
                width:{xs:'80%', md:'80%', sm:'20%'},
                fontSize:{xs:10},
                borderColor:'rgba(0, 225, 255, 1)',
                color:'aliceblue'
            }} 
                onClick={handleClick}
                variant='outlined'
                >
                Export
            </Button>
        </>
    )
}
export default ExportButton