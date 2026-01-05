import { CSSProperties } from "react";
const width = '16px'
const height = '16px'
const radius = 8
const circleHandle: CSSProperties = {
  width: width,
  height: height,
  borderRadius: "50%",
  background: "#00b1be",
  border: "2px solid white",
  position: "absolute",
};

export const SelectionCircle: Record<string, CSSProperties> = {
  topLeft: { 
    ...circleHandle, 
    top: "0%", 
    left: "0%", 
    transform: `translate(calc(-${radius}px), calc(-${radius}px))` 
  },
  topRight: { 
    ...circleHandle, 
    top: "0%", 
    left: "100%", 
    transform: `translate(calc(-100% + ${radius}px), -${radius}px)` 
  },
  bottomLeft: { 
    ...circleHandle, 
    top: "100%", 
    left: "0%", 
    transform: `translate(-5px, calc(-100% + ${radius}px))` 
  },
  bottomRight: { 
    ...circleHandle, 
    top: "100%", 
    left: "100%", 
    transform: `translate(calc(-100% + ${radius}px), calc(-100% + ${radius}px))` 
  },
  top: { 
    ...circleHandle, 
    top: 0, 
    left: "50%", 
    transform: `translate(-50%, -${radius}px)` 
  },
  bottom: { 
    ...circleHandle, 
    top: "100%", 
    left: "50%", 
    transform: `translate(-50%, -${radius}px)` 
  },
  left: { 
    ...circleHandle, 
    top: "50%", 
    left: 0, 
    transform: `translate(-${radius}px, -50%)` 
  },
  right: { 
    ...circleHandle, 
    top: "50%", 
    left: "100%", 
    transform: `translate(-8px, -50%)` 
  },
};
