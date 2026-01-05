import { Password } from "@mui/icons-material"
import { TableBody, TableContainer, TableRow, TableCell, Typography, Box, Table, TableHead, Paper, 
    IconButton, Backdrop,CircularProgress, Snackbar  } from "@mui/material"
import PasswordMenu from "./PasswordMenu/PasswordMenu"
import { useParams } from "react-router-dom"
import { useState,useEffect } from "react"
import GetLinks from "./GetLinks/GetLinks"
import ExpiredAlert from "./ExpiredAlert/ExpiredAlert"
import MenuBar from "../MenuBar/MenuBar"
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import GetFileInfo from "./GetFileInfo/GetFileInfo"
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import HandleDownload from "./HandleDownload/HandleDownload"
import PreviewFile from "./PreviewFile/PreviewFile"
import { GetFileFromServer } from "../ServerLink/getFileFromServer"
import CreateLink from "./CreateLink/CreateLink"
const FilesPage = ()=>{
    const { linkID } = useParams();
    const [activeLink,setActiveLink] = useState(false)
    const [table, setTable] = useState(false)
    const [files, setFiles] = useState([])
    const [copyNoti,setCopyNoti]= useState<{show:boolean, message:string}>({show:false, message:''})
    const [loading, setLoading] = useState<{loading:boolean, message:string}>({loading:false,message:''})
    const [previewValues, setPreviewValues] = useState<{objecURL:string, type:string,name:string,open:boolean}>({objecURL:'',type:'',name:'',open:false})
    useEffect(()=>{
        if(table == true){
            getFiles()
        }
        
    },[table])
    const getFiles=async()=>{
        const result = await GetFileInfo(linkID)
        setFiles(result)
    }
    const convert=(file: number)=> {
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
    const handlePreiew = async (file_id:string, fileName:string, type:string)=>{
        try{
            setLoading({loading:true, message:'loading file...'})
            const response = await GetFileFromServer(file_id, "share")
            if (!response ) return 
            const blob = await response.blob()
            let finalBlob = blob
            if (type.toUpperCase()==="PDF"){
                finalBlob = new Blob([blob], { type: 'application/pdf' })
            }
            const objectURL = URL.createObjectURL(finalBlob)
            setPreviewValues({objecURL:objectURL, type:type, name:fileName, open:true})
        }catch(error){
            console.error("error loading:",error)
        }finally{
            setLoading({loading:false, message:''})
        }

    }
    const handleClosePreview = ()=>{
        setPreviewValues((prev)=>({...prev, objecURL:'', open:false}))
    }
    const handleDownloadFront=async(fileID:string, fileName:string)=>{
        try{
            setLoading({loading:true, message:'downloading file...'})
            await HandleDownload(fileID, fileName)

        }catch(error){
            console.error("error downloading:",error)
        }finally{
            setLoading({loading:false, message:''})
        }
    }
    const handleShare=async(file_id:string, fileName:string)=>{
        const response = await CreateLink(file_id, fileName)
        const url = response.url
        if (response.error ==="Link has already expired"){
            setCopyNoti({show:true, message:'link expired'})
            return
        }
        if (url){
        await navigator.clipboard.writeText(url)
        }
        setCopyNoti({show:true, message:'copied to clipboard'})

    }
    const handleCloseNoti = ()=>{
        setCopyNoti({show:false, message:''})
    }
    return(
        <>
        <Snackbar open={copyNoti.show} onClose={handleCloseNoti} 
            message={copyNoti.message} autoHideDuration={1200}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            ContentProps={{sx:{justifyContent:'center', "& .MuiSnackbarContent-message":{
                textAlign:"center", width:"100%"
            }}}}
            />
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading.loading}
        >
            <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', gap: 2}}>
                <CircularProgress color="inherit" />
                <Typography>{loading.message}</Typography>
            </Box>
        </Backdrop>
        <MenuBar/>
        <PreviewFile previewValues = {previewValues} handleClosePreview = {handleClosePreview}/>
        <ExpiredAlert linkID ={linkID} setActiveLink = {setActiveLink}/>
        <PasswordMenu linkID={linkID} activeLink={activeLink} setTable= {setTable}/>
        {table &&
        <TableContainer component={Paper} sx={{ maxWidth: {md:'50%', xs:'90%'}, backgroundColor: 'transparent', boxShadow: 'none' }}>
    <Table aria-label="files table">
        
        {/* 1. Header Row */}
        <TableHead>
            <TableRow>
                {/* COL 1: Name (Takes all available space) */}
                <TableCell sx={{ width: '50%', borderBottom: "1px solid rgba(255, 255, 255, 0.75)", paddingLeft: '0px' }}>
                    <Typography color="rgba(191, 254, 254, 1)" variant="caption" fontWeight="bold">
                        FILE NAME
                    </Typography>
                </TableCell>
                
                {/* COL 2: Size (Fixed width, Right Aligned) */}
                <TableCell  sx={{ whiteSpace: 'nowrap', borderBottom: "1px solid rgba(255, 255, 255, 0.88)" }}>
                    <Typography color="rgba(191, 254, 254, 1)" variant="caption" fontWeight="bold">
                        SIZE
                    </Typography>
                </TableCell>

                {/* COL 3: Actions (Small Fixed Width for the button) */}
                <TableCell align="center" sx={{ width: '50px', borderBottom: "1px solid rgba(255, 255, 255, 0.88)", padding: 0 }}>
                    {/* Empty header or put text like "VIEW" */}
                </TableCell>
            </TableRow>
        </TableHead>

        {/* 2. Body Rows */}
        <TableBody>
            {files.map((file, index) => (
                <TableRow 
                    key={index} 
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                >
                    {/* COL 1: Name */}
                    <TableCell sx={{ borderBottom: "1px solid rgba(185, 130, 224, 0.53)", paddingLeft: '0px' }}>
                        <Typography fontSize={{md:16, xs:11}} color="white">
                            {file.name}
                        </Typography>
                    </TableCell>
                    
                    {/* COL 2: Size */}
                    <TableCell  sx={{ borderBottom: "1px solid rgba(185, 130, 224, 0.53)" }}>
                        <Typography fontSize={{md:16, xs:11}} color="rgba(255, 255, 255, 1)">
                            {convert(file.size)}
                        </Typography>
                    </TableCell>

                    {/* COL 3: Button */}
                    <TableCell align="center" sx={{ borderBottom: "1px solid rgba(185, 130, 224, 0.53)", padding: 0 }}>
                        <Box sx={{display:'flex', flexDirection:'row', gap:3}}>
                            <IconButton onClick={()=>handlePreiew(file.id, file.name, file.type)}
                                size="small" 
                                sx={{ color: "rgba(222, 222, 222, 1)", "&:focus": {outline:'none'} }}
                            >
                                <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={()=>handleShare(file.id, file.name)}
                                sx={{ color: "rgba(222, 222, 222, 1)", "&:focus": {outline:'none'} }}
                            >
                                <LinkIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={()=>handleDownloadFront(file.id, file.name)}
                                size="small" 
                                sx={{ color: "rgba(222, 222, 222, 1)", "&:focus": {outline:'none'} }}
                            >
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>
            }
        </>
    )
}
export default FilesPage