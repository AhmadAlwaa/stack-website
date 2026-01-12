import { Dialog, DialogContent, DialogTitle, IconButton, Box } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
type Props={
    previewValues: {objecURL:string, type:string,name:string,open:boolean}
    handleClosePreview: () => void
}
const image_types = ["BMP", "GIF","ICO", "JPEG", "JPG", "PNG", "TGA", "TIFF","WEBP"]
const video_types = ["3GP", "AVI", "FLV", "MKV", "MOV", "MP4", "OGV", "WEBM", "WMV"]
const PreviewFile=({previewValues, handleClosePreview}:Props)=>{
    const renderContent=()=>{
        const type = previewValues.type.toUpperCase()
        if (image_types.includes(type)){
            return(
                <img src={previewValues.objecURL} alt={previewValues.name} style={{maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}/>
            )
        }
        else if (video_types.includes(type)){
            return (
                <video disablePictureInPicture controls autoPlay controlsList="nodownload" style={{ maxWidth: '100%', maxHeight: '80vh' }}>
                    <source src={previewValues.objecURL}/>
                    video type is not supported
                </video>
            )
        }
        else if(type ==='PDF'){
            return(
                <iframe src = {previewValues.objecURL} title={previewValues.name} style={{ width: '100%', height: '80vh', border: 'none' }}/> 
            )
        }
    }
    return(
        <>
            <Dialog PaperProps={{sx: { backgroundColor: '#1e1e1e', color: 'white' }}}
            open={previewValues.open} fullWidth maxWidth='lg'>
                <DialogTitle>
                    <Box sx={{display:'flex', flexDirection:'row', width:'100%', justifyContent:'space-between'}}>
                        {previewValues.name}
                        <IconButton onClick={handleClosePreview} sx={{ color: 'red', "&:focus": {outline:'none'} }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                        {renderContent()}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}
export default PreviewFile