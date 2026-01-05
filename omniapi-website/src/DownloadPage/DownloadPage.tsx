import DownloadTable from "./DownloadTable/DownloadTable";
import MenuBar from "../MenuBar/MenuBar";
import { useNavigate } from "react-router-dom";
import ShareButton from "../ShareFile/ShareButton";
import { useState,useContext } from "react";
import { createDownloadTable, itemPortalFile, itemPortalSetFiles } from "../App";
import ShareLinkMenu from "../ShareFile/FileTable/ShareLinkMenu/ShareLinkMenu";
type Props = {
    steps:string[]
}
export default function DownloadPage({steps}:Props){
    const navigate = useNavigate()
    return(
        <>
            <MenuBar/>
            <div>
                <DownloadTable steps = {steps}/>
            </div>
        </>
    )
}