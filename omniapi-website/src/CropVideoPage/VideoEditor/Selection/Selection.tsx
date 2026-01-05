import Box from "@mui/material/Box";
import {useRef, useState, useEffect, useLayoutEffect} from "react";
import { Rnd } from "react-rnd";
import React from "react";
import {exportOptionsProps} from "../Props"
import { SelectionCircle } from "./SelectionCircle";
type Props = {
    setSelectionPos: React.Dispatch<React.SetStateAction<{ x: number; y: number, x2: number, y2:number }>>;
    selectionPos?:{x:number, y:number, x2:number, y2:number}
    dimensions: {width: number, height:number}
    exportOptions: exportOptionsProps
}


const Selection = ({setSelectionPos, selectionPos, dimensions, exportOptions}:Props) => {
            
    useEffect(()=>{
        changeSize()
    }, [dimensions])

    
    useLayoutEffect(() => {
        
        changeSize()
    }, [dimensions]);

    const changeSize = () => {
    if (!selectionPos) return;

    let newX = selectionPos.x;
    let newY = selectionPos.y;
    let newX2 = selectionPos.x2; // width
    let newY2 = selectionPos.y2; // height

    // Clamp right edge
    if (selectionPos.x + selectionPos.x2 > dimensions.width) {
        newX = dimensions.width - selectionPos.x2; // remove Math.abs
        if (newX < 0) newX = 0; // prevent negative x
    }

    // Clamp bottom edge
    if (selectionPos.y + selectionPos.y2 > dimensions.height) {
        newY = dimensions.height - selectionPos.y2;
        if (newY < 0) newY = 0; // prevent negative y
    }

    // Clamp width/height relative to new position
    newX2 = Math.min(selectionPos.x2, dimensions.width - newX);
    newY2 = Math.min(selectionPos.y2, dimensions.height - newY);

    setSelectionPos(prev => ({
        ...prev,
        x: newX,
        y: newY,
        x2: newX2,
        y2: newY2,
    }));
};
  return (
    <Rnd
    style={{visibility: exportOptions.selectState ? "visible" : "hidden", zIndex:10}}
  size={{
    width: selectionPos ? selectionPos.x2 - selectionPos.x : 0,
    height: selectionPos ? selectionPos.y2 - selectionPos.y : 0,
  }}
  position={{
    x: selectionPos?.x || 0,
    y: selectionPos?.y || 0,
  }}
  minWidth={25}
  minHeight={25}
  bounds="parent"
  
  resizeHandleStyles={SelectionCircle}
  onDragStop={(e, d) => {
    setSelectionPos(prev => ({
      ...prev,
      x: d.x,
      y: d.y,
      x2: d.x + (prev.x2 - prev.x),
      y2: d.y + (prev.y2 - prev.y),
    }));
  }}
  onResizeStop={(e, direction, ref, delta, position) => {
    setSelectionPos(prev => ({
      ...prev,
      x: position.x,
      y: position.y,
      x2: position.x + ref.offsetWidth,
      y2: position.y + ref.offsetHeight,
    }));
  }}
>
  <Box
    className="drag-handle"
    sx={{
      width: "100%",
      height: "100%",
      border: "3px dashed rgba(48, 56, 59, 1)",
      boxSizing: "border-box",
      backgroundColor: "rgba(0, 177, 190, 0.22)",
      position: "relative",
      
    }}
  />
</Rnd>

  );
};

export default Selection;
