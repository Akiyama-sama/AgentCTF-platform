import {  useGetDindPacketFileInfoModelsModelIdDindPacketsContainerNameDownloadPost } from "@/types/docker-manager";

export const useDind = () => {
    const dindMutation = useGetDindPacketFileInfoModelsModelIdDindPacketsContainerNameDownloadPost({
        mutation: {
            onSuccess: (res) => {
                //eslint-disable-next-line no-console
                console.log(res.data)
            },
            onError: (error) => {
                //eslint-disable-next-line no-console
                console.log(error)
            }
        }
    })

    return {
        dindMutation: dindMutation.mutate,
        dindMutationAsync: dindMutation.mutateAsync,
    }
}