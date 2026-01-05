import { Button } from "@mui/material"
type Props ={
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
}
const ShareButton = ({setOpen}:Props)=>{
    const handleClick = ()=>{
        setOpen(true)
    }
    return(
        <>
        <Button variant="contained" onClick={handleClick}
                    sx={{color:'#f2f2f2ff', background:'#6e2a9eff', 
                        borderBottomLeftRadius:'0',
                        borderBottomRightRadius:'0',
                        boxShadow:'none',
                        "&:hover": {
                        boxShadow: "none",
                        },
                        "&:focus": {outline:'none'}
                        }}>Share</Button>
        </>
    )
}
export default ShareButton