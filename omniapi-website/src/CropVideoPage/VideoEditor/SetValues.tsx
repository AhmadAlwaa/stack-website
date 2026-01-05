export const SetValues=(videoRatio: {width:number, height:number}, selectionPos:{x:number, y:number, x2: number, y2:number}, dimensions:{width:number, height:number})=>{
    let ratioX = videoRatio.width / dimensions.width
    let ratioY = videoRatio.height / dimensions.height
    const cropWidth = (selectionPos.x2 - selectionPos.x) * ratioX;
    const cropHeight = (selectionPos.y2 - selectionPos.y) * ratioY;
    const cropX = selectionPos.x * ratioX;
    const cropY = selectionPos.y * ratioY;
    
    return {
        cropWidth: Math.round(cropWidth),
        cropHeight: Math.round(cropHeight),
        cropX: Math.round(cropX),
        cropY: Math.round(cropY)
        }
    
}