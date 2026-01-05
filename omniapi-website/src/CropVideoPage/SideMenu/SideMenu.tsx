import { Typography, Card, CardContent, Box, Table,TableBody, TableContainer, TableRow, TableCell
    
 } from "@mui/material"
import StyledTextField from "./StyledTextField/StyledTextField"
import { useState, useRef } from "react"
import { FileProps, dimensionsProps, selectionPosProps, exportOptionsProps, textPropProps, displayValuesProps} from "../VideoEditor/Props"
import ExportButton from "../VideoEditor/ExportButton/ExportButton"
import TextMenu from "./TextMenu/TextMenu"
type SelectionPos = { x: number; y: number; x2: number; y2: number };
type Props = {
    setSelectionPos: React.Dispatch<React.SetStateAction<SelectionPos>>
    dimensions: {width: number, height:number}
    setStartExport: React.Dispatch<React.SetStateAction<boolean>>
    displayValues: {width: number, height:number, x:number, y:number}
    setTextProp: React.Dispatch<React.SetStateAction<{text: string, fontSize: number; fontFamily: string; fill: string, x:number, y:number,  textWidth:number, textHeight: number }>>;
    textProp:{text:string, fontSize: number; fontFamily: string; fill: string, x:number, y:number,  textWidth:number, textHeight: number}
    exportOptions:exportOptionsProps
    setExportOptions: React.Dispatch<React.SetStateAction<exportOptionsProps>>
    exportValues: {file:File, values: number[], textProps:textPropProps,videoRatio:dimensionsProps, selectionPos: selectionPosProps,dimesion:dimensionsProps} | null
};

const SideMenu = ({setSelectionPos, dimensions, setStartExport, 
  displayValues, setTextProp, textProp,exportOptions, setExportOptions, exportValues}: Props) => {
    const [error,setError]= useState<boolean[]>([])
    const x1Ref = useRef<HTMLInputElement>(null);
    const x2Ref = useRef<HTMLInputElement>(null);
    const widthRef = useRef<HTMLInputElement>(null);
    const heightRef = useRef<HTMLInputElement>(null);
    

    const setValues = (value: number, key: keyof SelectionPos, errorindx:number, ref?: React.RefObject<HTMLInputElement|null>) => {
        if (!setSelectionPos) return;
        let hasError = false;
        if (isNaN(value)) hasError = true;
        if (value < 0) hasError = true;
        else if (value > dimensions.width && key === 'x' ) hasError = true;
        else if (value > dimensions.height && key === 'y' ) hasError = true;
        else if (key === 'x2' && value > dimensions.width ) hasError = true;
        else if (key === 'y2' && value > dimensions.height) hasError = true;

        if (hasError) {
            setError((prev) => ({ ...prev, [errorindx]: true }));
            ref?.current?.blur(); // remove focus from the field
            return;
        }

        setSelectionPos((prev) => ({ ...prev, [key]: value }));
        setError((prev) => ({ ...prev, [errorindx]: false }));
    };

    
  return (
    <Box
      sx={{
        position: "absolute",
        right: { md: 0, sm: 0, xs: '%50%' },
        bottom: { md: "25%", sm: "35%", xs: 15 },
        minWidth: { md: "20vw", sm: "19vw", xs: "90vw" },
        
        '@media (orientation: landscape)': {
                bottom: {sm:0, md: '25%'},
                height:{sm:220, md:'auto'}
            },
        backgroundColor: "rgba(31, 55, 96, 0.38)",
        border: "2px solid rgba(45, 135, 155, 0.78)",
        borderRadius: 2,
        padding: 1,
      }}
    >
      <TableContainer >
        <Table>
          <TableBody >
            <TableRow
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row", md: "row" },
                justifyContent: "space-between",
                gap:{xs:1}
              }}
            >
              {/* TextMenu Cell */}
              <TableCell
                sx={{
                  borderBottom: "none",
                  display: "flex",
                  justifyContent: "center",
                  padding:0,
                 
                }}
              >
                <TextMenu textProp={textProp} setTextProp={setTextProp} dimensions = {dimensions} 
                exportOptions = {exportOptions}
                setExportOptions = {setExportOptions}
                />
              </TableCell>

              {/* Inputs Cell */}
              <TableCell
                sx={{
                  borderBottom: "none",
                  padding:1,
                  display: "flex",
                  flexDirection: { xs: "row", sm: "column", md: "column" },
                  gap: 3,
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <StyledTextField
                  inputRef={x1Ref}
                  error={error[0]}
                  label="x :"
                  value={exportOptions.selectState ? displayValues.x : ""}
                  onChange={(e) => setValues(Number(e.target.value), "x", 0, x1Ref)}
                />
                <StyledTextField
                  inputRef={x2Ref}
                  error={error[1]}
                  label="y :"
                  value={exportOptions.selectState ? displayValues.y : ""}
                  onChange={(e) => setValues(Number(e.target.value), "y", 1, x2Ref)}
                />
                <StyledTextField
                  inputRef={widthRef}
                  error={error[2]}
                  label="width :"
                  value={exportOptions.selectState  ? displayValues.width : ""}
                  onChange={(e) =>
                    setValues(Number(e.target.value), "x2", 2, widthRef)
                  }
                />
                <StyledTextField
                  inputRef={heightRef}
                  error={error[3]}
                  label="height :"
                  value={exportOptions.selectState ? displayValues.height : ""}
                  onChange={(e) =>
                    setValues(Number(e.target.value), "y2", 3, heightRef)
                  }
                />
                <Box sx={{display:'none', '@media (orientation: landscape)': {
                  display: {xs:'block', md:'none'}
                }
                }}>
                <ExportButton setStartExport={setStartExport} exportValues = {exportValues} exportOptions = {exportOptions} />
                </Box>
              </TableCell>
              
            </TableRow>

            {/* Export Button Row */}
            <TableRow>
              <TableCell sx={{borderBottom: "none",}}colSpan={2}>
                <Box sx={{ display: "flex", justifyContent: "center",
                  '@media (orientation: landscape)': {
                  display: {xs:'none', md:'flex'}
                }
                 }}>
                  <ExportButton setStartExport={setStartExport} exportValues = {exportValues} exportOptions = {exportOptions}  />
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
export default SideMenu