import * as React from 'react';
import {AppBar, Button, Toolbar, Typography, Box, IconButton, Menu, MenuItem} from '@mui/material';
import { itemPortalJob, itemPortalFile, itemPortalFileName } from '../App'
import {useContext } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
const pages = ['Crop Video', 'Share File'];
const pageUrl: Record<string,string>={
    "Crop Video": "/crop-video",
    "Trim Video": "/trim-video",
    "Share File":"/share-file"
}
function MenuBar(){
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const { taskIDs, setTaskIDs }= useContext(itemPortalJob)
    const {fileIDs, setFileIDs} = useContext(itemPortalFile)
    const {fileNames,setFileNames} = useContext(itemPortalFileName)
    const nagivate = useNavigate()
    const handleClick = ()=>{
      setTaskIDs([])
      setFileIDs([])
      setFileNames([])
      nagivate("/")
    }
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) =>{
        setAnchorElNav(event.currentTarget)
    }
    const handleCloseNavMenu = () =>{
        setAnchorElNav(null)
    }
    const handlePageChange=(page:string)=>{
        nagivate(pageUrl[page])
    }

    return(
        <>
            <Box sx={{ top: 0, position: 'fixed', width: '100%', zIndex:100 }}>
  <AppBar
    position="static"
    sx={{
      height: { xs: 50, sm: 25, md: 64 },
      backgroundColor: 'rgba(21, 58, 112, 1)',
    }}
  >
    <Toolbar
      sx={{
        minHeight: '100% !important',
        display: 'flex',
        justifyContent: 'space-between', // space out left, center, right
        alignItems: 'center',
        px: 2,
      }}
    >
      {/* Left: Menu */}
      <Box>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleOpenNavMenu}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          PaperProps={{ sx: { backgroundColor: 'rgba(49, 49, 49, 1)' } }}
        >
          {pages.map((page) => (
            <MenuItem
              key={page}
              onClick={() => handlePageChange(page)}
              sx={{
                backgroundColor: 'rgba(50, 50, 50, 1)',
                '&:hover': { backgroundColor: 'rgba(91, 91, 91, 1)' },
              }}
            >
              <Typography sx={{ textAlign: 'center', color: 'aliceblue' }}>
                {page}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Center: Title */}
      <Typography
        variant="h6"
        onClick={handleClick}
        component="div"
        sx={{
          cursor: 'pointer',
          textAlign: 'center',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'rgba(203, 230, 249, 1)',
          fontSize: { xs: 12, sm: 14, md: 20 },

        }}
      >
        AALWANCONVERT
      </Typography>

      {/* Right: Login Button */}
      <Button
        color="inherit"
        sx={{
          minHeight: 0,
          padding: '2px 8px',
          fontSize: { xs: 10, sm: 12, md: 14 },
        }}
      >
        Login
      </Button>
    </Toolbar>
  </AppBar>
</Box>
        </>

    )
}
export default MenuBar;