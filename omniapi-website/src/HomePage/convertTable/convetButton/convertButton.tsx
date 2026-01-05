import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import React, { forwardRef } from 'react';
interface ChildButtonProps {
    onChildClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    format:string
}
const ConvertButton: React.FC<ChildButtonProps> = ({onChildClick,format}) => {
    return(
        <>
            <div>
                <Button 
                    onClick={onChildClick}
                    endIcon={<ArrowDropDownIcon/>}
                    sx={{
                    paddingTop: '5px',
                    paddingBottom:'5px',
                    paddingRight:'10px', 
                    paddingLeft:'15px', 
                    border:'1px, solid, aliceblue'}} 
                    style={{color: "aliceblue", 
                    fontSize:"13px"}} value=""
                    >
                        {format}
                </Button>
            </div>
            
        </>
    )
}
export default ConvertButton;