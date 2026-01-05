import React, { useState, Fragment } from 'react';
import Wheel from '@uiw/react-color-wheel';
import { hsvaToHex } from '@uiw/color-convert';
type props={
    setHsva: React.Dispatch<React.SetStateAction<{ h: number, s: number, v: number, a: number }>>
    hsva: { h: number, s: number, v: number, a: number }
}
function Demo({setHsva, hsva}:props) {
  return (
    <Fragment>
      <Wheel  width={window.innerWidth < 900 ? 150 : 300} height={window.innerWidth < 900 ? 150 : 300} color={hsva} onChange={(color) => setHsva({ ...hsva, ...color.hsva })} />
      <div style={{ width: '100%', height: 34, marginTop: 20, background: hsvaToHex(hsva) }}></div>
    </Fragment>
  );
}


export default Demo;