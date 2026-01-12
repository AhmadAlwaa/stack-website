import { Button, Menu, MenuItem, Box, Typography } from "@mui/material";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { useState, useEffect } from "react";
import { hsvaToHex } from "@uiw/color-convert";
import ColorWheel from "./ColorWheel/ColorWheel";
import { exportOptionsProps } from "../../VideoEditor/Props";
import "./TextMenu.css";

const fontSizes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96, 120, 168, 216, 276, 336, 408, 480,564,648, 744, 840];
const fontAlign = ["middle", "topleft", "topright",'bottomleft', 'bottomright','middleleft', 'middleright'];

type Prop = {
  setTextProp: React.Dispatch<
    React.SetStateAction<{
      text: string;
      fontSize: number;
      fontFamily: string;
      fill: string;
      x: number;
      y: number;
      textWidth: number;
      textHeight: number;
    }>
    
  >;
  textProp: {
    text: string;
    fontSize: number;
    fontFamily: string;
    fill: string;
    x: number;
    y: number;
    textWidth: number;
    textHeight: number;
  };
  dimensions: { width: number; height: number };
  exportOptions:{exportText:boolean}
  setExportOptions: React.Dispatch<React.SetStateAction<exportOptionsProps>>
};

const TextMenu = ({ textProp, setTextProp, dimensions, exportOptions, setExportOptions }: Prop) => {
  const [anchorFontSize, setAnchorFontSize] = useState<null | HTMLElement>(null);
  const [anchorFont, setAnchorFont] = useState<null | HTMLElement>(null);
  const [anchorColor, setAnchorColor] = useState<null | HTMLElement>(null);
  const [anchorAlign, setAnchorAlign] = useState<null | HTMLElement>(null);
  const [text, setText] = useState<string[]>([]);
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 100, a: 1 });
  const handleText = () =>{
    setExportOptions((prev)=>( {...prev, exportText:!exportOptions.exportText}))
  }
  const fontAlignCalc = dimensions
    ? {
        middle: {
          x: (dimensions.width - textProp.textWidth) / 2,
          y: (dimensions.height - textProp.textHeight) / 2,
        },
        topleft: { x: -textProp.textWidth/100, y: -textProp.textHeight/3.5 },
        topright: { x: dimensions.width - textProp.textWidth + textProp.textWidth/55, y: -textProp.textHeight/3.5},
        bottomleft: {x:0, y:dimensions.height - textProp.textHeight + textProp.textHeight/5.5},
        bottomright: {x:dimensions.width - textProp.textWidth, y:dimensions.height - textProp.textHeight + textProp.textHeight/5.5},
        middleleft: {x:0, y:(dimensions.height - textProp.textHeight)/2},
        middleright: {x:dimensions.width- textProp.textWidth, y:(dimensions.height - textProp.textHeight)/2}
      }
    : {
        middle: { x: 0, y: 0 },
        topleft: { x: 0, y: 0 },
        topright: { x: 0, y: 0 },
      };

  const handleClick = (value: number | string, change: string) => {
    type AlignmentKey = keyof typeof fontAlignCalc;
    if (change === "x") {
      setTextProp((prev) => ({
        ...prev,
        x: fontAlignCalc[value as AlignmentKey].x,
        y: fontAlignCalc[value as AlignmentKey].y,
      }));
    } else {
      setTextProp((prev) => ({ ...prev, [change]: value }));
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleClick(hsvaToHex(hsva), "fill");
    }, 0);
    return () => clearTimeout(timeout);
  }, [hsva]);

  useEffect(() => {
    fetch("/fonts.txt")
      .then((res) => res.text())
      .then((data) => {
        const stringArr = data.split("\n").map((f) => f.trim());
        setText(stringArr);
      })
      .catch((err) => console.error("Error loading file:", err));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { md: "column", sm: "column" },
        gap: {md:2,sm:.4, xs:1},
        alignItems: "center",
      }}
    >
      {/* Text Icon */}
      {(
      <Button className="FsMenu" 
        sx={{ backgroundColor:!exportOptions.exportText?'rgba(25, 40, 55, 0.5)'
          :'rgba(55, 125, 195, 0.5)'}} onClick={handleText}>
        <TextFieldsIcon />
      </Button>
      )}

      {/* Font Size Menu */}
      <Button onClick={(e) => setAnchorFontSize(e.currentTarget)} className="FsMenu">
        {textProp.fontSize}
      </Button>
      <Menu
        className="FsMenu-menu"
        anchorEl={anchorFontSize}
        open={Boolean(anchorFontSize)}
        onClose={() => setAnchorFontSize(null)}
      >
        {fontSizes.map((size) => (
          <MenuItem
            key={size}
            className="FsMenu-item"
            onClick={() => {
              handleClick(size, "fontSize");
              setAnchorFontSize(null);
            }}
          >
            {size}
          </MenuItem>
        ))}
      </Menu>

      {/* Font Family Menu */}
      <Button  sx={{   maxWidth: 50,// centers text
  }} onClick={(e) => setAnchorFont(e.currentTarget)} className="FsMenu">
    <Typography
    noWrap
    sx={{
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textAlign: "center",
      width: "100%",
    }}
  >
      {textProp.fontFamily || "Arial"}
    </Typography>
        
      </Button>
      <Menu
        className="FsMenu-menu"
        anchorEl={anchorFont}
        open={Boolean(anchorFont)}
        onClose={() => setAnchorFont(null)}
        
      >
        {text.map((font) => (
          <MenuItem
            key={font}
            className="FsMenu-item"
            onClick={() => {
              handleClick(font, "fontFamily");
              setAnchorFont(null);
            }}
          >
            {font}
          </MenuItem>
        ))}
      </Menu>

      {/* Color Picker */}
      <Button onClick={(e) => setAnchorColor(e.currentTarget)} className="FsMenu">
        <Box
          sx={{
            background: hsvaToHex(hsva),
            width: 25,
            height: 25,
            borderRadius: "50%",
          }}
        />
      </Button>
      <Menu
         PaperProps={{
    sx: {
      p: 0, // remove padding
      m: 0, // remove margin
      minWidth: { xs: 220, sm: 180, md: 400}, // allow menu to shrink/expand naturally
      minHeight: { xs: 220, sm: 250, md: 400 },
      overflow: "visible",
      display: "flex", 
      justifyContent: "center",
      alignItems: "center",
    },
  }}
  MenuListProps={{
    sx: {
      p: 1,
      m: 0,
      minHeight:{ xs: 220, sm: 250, md: 400 },
      overflow: "visible",
      justifyContent:'center',
      alignItems:'center'
    },
  }}
        anchorEl={anchorColor}
        open={Boolean(anchorColor)}
        onClose={() => setAnchorColor(null)}
      >
        <Box sx={{ p: 1  }} >
          <ColorWheel setHsva={setHsva} hsva={hsva} />
        </Box>
      </Menu>

      {/* Alignment Menu */}
      <Button onClick={(e) => setAnchorAlign(e.currentTarget)} className="FsMenu">
        Align
      </Button>
      <Menu
        className="FsMenu-menu"
        anchorEl={anchorAlign}
        open={Boolean(anchorAlign)}
        onClose={() => setAnchorAlign(null)}
      >
        {fontAlign.map((align) => (
          <MenuItem
            key={align}
            className="FsMenu-item"
            onClick={() => {
              handleClick(align, "x");
              setAnchorAlign(null);
            }}
          >
            {align}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TextMenu;
