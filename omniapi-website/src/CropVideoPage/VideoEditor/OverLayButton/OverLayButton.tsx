import Button from '@mui/material/Button'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { styled } from '@mui/material/styles'
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import { exportOptionsProps} from "../Props"
import {IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Box from '@mui/material/Box';
type Props={
    setOverlayImage: React.Dispatch<React.SetStateAction<File|null>>
    setExportOptions:React.Dispatch<React.SetStateAction<exportOptionsProps>>
    exportOptions: exportOptionsProps
    setMuted: React.Dispatch<React.SetStateAction<boolean>>
    muted: boolean
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
const OverlayButton=({setOverlayImage,exportOptions, setExportOptions, setMuted, muted}:Props)=>{
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
    return(
        <>  
            <ButtonGroup  variant="contained" sx={{maxHeight:{xs:'20px', md:'35px', sm:'27px'}}}>
                <Button
                    component="label"
                    role={undefined}
                    tabIndex={-1}
                    startIcon={<UploadFileIcon />}
                    size='small'
                    sx={{ borderBottomLeftRadius:0,borderBottomRightRadius:0, 
                        borderTopRightRadius:0,
                        transform: "translate(2px, 0px)",
                        fontSize:{sm:'6px', xs:'9px', md:'12px'}
                    }}
                    >
                    Upload Image
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(event)=>{ const file=event.target.files ? event.target.files[0]: null 
                            setOverlayImage(file)}}
                        accept='image/*'
                    />
                </Button>
                <Button
                    sx={{ borderBottomLeftRadius:0,borderBottomRightRadius:0, 
                        borderTopRightRadius:0,
                        fontSize:{sm:'6px', xs:'9px', md:'12px'}
                    }}
                    startIcon={<DeleteIcon />}
                    color='error'
                    size='small'
                    onClick={()=>setOverlayImage(null)}
                >
                    Remove Image
                </Button>
                <Box
                    sx={{
                        background: "rgba(40, 136, 233, 1)",
                        width: {xs:20, md:35, sm:27},
                        height: {xs:20, md:35, sm:27},
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "auto", // centers it horizontally
                     // optional
                    }}
                    >
                    <Checkbox
                        onChange={() => setExportOptions((prev)=>({...prev, selectState:!exportOptions.selectState}))}
                        color="default"
                        sx={{  transform: {
                            xs: "scale(.8)",
                            sm: "scale(.9)",
                            md: "scale(1)",
                            }}}
                        defaultChecked
                    />
                </Box>
                <Box sx={{background:'rgba(40, 72, 233, 0)', width:{xs:20, md:35, sm:27},
                 height:{xs:20, md:35, sm:27}, display: "flex",
                        alignItems: "center",
                        justifyContent: "center",}}>
                    <IconButton
                    sx={{"&:focus": {outline: "none",boxShadow: "none"}, transform: {
                            xs: "scale(.8)",
                            sm: "scale(.9)",
                            md: "scale(1)",
                            }}} 
                    style={{color:'rgba(211, 211, 211, 1)'}} 
                    onClick={() => setMuted(!muted)}>
                        {muted ?  <VolumeOffIcon/> :
                            <VolumeUpIcon/>
                        }
                        
                    </IconButton>
                </Box>
            </ButtonGroup>
        </>
    )
}
export default OverlayButton