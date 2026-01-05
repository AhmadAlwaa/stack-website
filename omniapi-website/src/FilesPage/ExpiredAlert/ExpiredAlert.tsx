import { Dialog, DialogContent,Box, Typography,Button, DialogTitle } from "@mui/material"
import { useEffect, useState } from "react"
import checkLinkActive from "./CheckLinkActive/CheckLinkActive"
import { useNavigate } from "react-router-dom";
type Props={
    linkID: string
    setActiveLink:React.Dispatch<React.SetStateAction<boolean>>
}
const ExpiredAlert = ({linkID, setActiveLink}:Props)=>{
    const [open,setOpen] = useState(false)
    const [activeError, setActiveError] = useState(false)
    const [expError, setExpError] =useState(false)
    const nagivate = useNavigate()
    const checkLinkActiveStatus = async()=>{
        const result = await checkLinkActive(linkID)
        if (result == "inactive link"){
            setOpen(true)
            setActiveError(true)
        }
        else if(result =="this link has expired."){
            setOpen(true)
            setExpError(true)
        }
        else{
            setActiveLink(true)
        }
    }
    useEffect(()=>{
        checkLinkActiveStatus()
    },[])
    const handleClick=()=>{
        nagivate("/share-file")
    }
    return(
        <>
        <Dialog open={open}
            PaperProps={{
                sx: {
                    backgroundColor: "#262626ff"
                }}}>
            <DialogTitle  color='white'>
                Share error
            </DialogTitle>
            <DialogContent>
                <Box sx={{display:'flex', flexDirection:'column', height:80, padding:1, gap:'10%', width:450}}>
            
                    {activeError &&
                    <Typography color="white" fontSize={16}>
                        link not active
                    </Typography>
                    }
                    {expError &&
                    <Box sx={{display:'flex', flexDirection:'column', gap:2, alignItems:'center'}}>
                        <Typography color="white" fontSize={16}>
                            Link is expired
                        </Typography>
                        <Button onClick={handleClick} sx={{width:'100%',
                        backgroundColor:'rgba(59, 35, 84, 1)',
                        borderColor:'rgba(47, 50, 247, 1)',
                        borderWidth:'1px',
                        color:'rgba(255, 255, 255, 1)',
                        fontFamily:'monospace',
                        "&:focus": {outline:'none'}
                    }} variant='contained'>
                            Go Home
                        </Button>
                    </Box>
                    }
                </Box>
            </DialogContent>
        </Dialog>
        </>
    )
}
export default ExpiredAlert