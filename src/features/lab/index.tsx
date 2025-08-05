import { LogController } from "../scenario/components/container-log-controller";

export function LabComponents(){
    return(
        <div className="lab-container h-screen flex justify-center items-center border-8 m-10 ">
            <LogController/>
        </div>
    )
}