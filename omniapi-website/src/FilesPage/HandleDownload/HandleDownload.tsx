import { ConvertBlob } from "../../DownloadPage/DownloadTable/DownloadProgressBar/blob/convertBlob"
import { GetFileFromServer } from "../../ServerLink/getFileFromServer"

const HandleDownload = async(file_id:string, file_name:string)=>{
    const response = await GetFileFromServer(file_id,"share")
    if (!response) {
        return false
    }
    const blob = await response.blob()
    ConvertBlob(blob, file_name)
}
export default HandleDownload