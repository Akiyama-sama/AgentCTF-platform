'use client'
import { Resizable } from 're-resizable'
import { useState } from 'react'
import  TargetDialogProvider from './context/target-context'
import { TargetsContainer } from './components/targets-container'
import { TargetLog } from './components/target-log'
import { TargetDialog } from './components/target-dialog'

export default function TargetFactoryPage() {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  return (
    <TargetDialogProvider>
      <div className='flex h-full w-full flex-row gap-4 p-4'>
        <Resizable
          defaultSize={{
            width: 400,
            height: '100%',
          }}
          minWidth={300}
          maxWidth={600}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          className='flex-none'
        >
          <TargetsContainer
            onSelectTarget={setSelectedTarget}
            selectedTarget={selectedTarget}
            className='h-full'
          />
        </Resizable>
        <div className='min-w-0 flex-1'>
          <TargetLog />
        </div>
      </div>
      <TargetDialog />
    </TargetDialogProvider>
  )
}
