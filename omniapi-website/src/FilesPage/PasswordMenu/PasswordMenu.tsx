import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle,Box, Button, Typography } from "@mui/material"
import PasswordField from "../../ShareFile/FileTable/ShareLinkMenu/PasswordField/PasswordField"
import GetLinks from "../GetLinks/GetLinks"
import CheckPassword from "../CheckPassword/CheckPassword"
type Props={
    linkID:string
    activeLink:boolean
    setTable:React.Dispatch<React.SetStateAction<boolean>>
}
const PasswordMenu=({linkID, activeLink, setTable}:Props)=>{
    const [open, setOpen] = useState(false)
    const [password,setPassword] = useState('')
    const [errorPass, setErrorPass] = useState(false)
    const handlePassword= async()=>{
        const result = await CheckPassword(linkID, password)
        if (result.status == "authorized"){
            setOpen(false)
            setTable(true)
        }else if(result == "Error: Incorrect password."){
            setErrorPass(true)

        }
        
    }
    useEffect(()=>{
        const getPassword = async()=>{
            const response = await GetLinks(linkID)
            if (response == true) {setOpen(true)}
            else{
                setTable(true)
            }
        }
    if(activeLink == true){
        getPassword()
    }
    },[activeLink])
    
    return(
        <>
        <Dialog open={open}
            PaperProps={{
                sx: {
                    backgroundColor: "#262626ff"
                    }}}>
            <DialogTitle color='white'>
                    {"Password"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{display:'flex', flexDirection:'column', height:80, padding:1, gap:'10%'}}>
                    <Box>
                        <PasswordField setPassword={setPassword}/>
                        {errorPass &&
                        <Typography color="red" fontSize={10}>
                            incorrect password
                        </Typography>
                        }
                    </Box>
                    <Button onClick={handlePassword} sx={{width:'100%',
                        backgroundColor:'rgba(59, 35, 84, 1)',
                        borderColor:'rgba(47, 50, 247, 1)',
                        borderWidth:'1px',
                        color:'rgba(255, 255, 255, 1)',
                        fontFamily:'monospace',
                        "&:focus": {outline:'none'}
                    }} variant='contained'>
                        Submit
                    </Button>
                </Box>
            </DialogContent>            
        </Dialog>
        </>
    )
}
export default PasswordMenu