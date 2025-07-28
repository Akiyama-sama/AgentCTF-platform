import { create } from "zustand";

type ContainerStore={
    containerName:string,
    setContainerName:(name:string)=>void
}

export const useContainerStore=create<ContainerStore>((set)=>({
    containerName:'',
    setContainerName:(name)=>set({containerName:name})
}))




