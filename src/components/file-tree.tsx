import  { useEffect, useState } from "react"
import {
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
  TreeState,
} from "@headless-tree/core"
import { useTree } from "@headless-tree/react"
import { FolderIcon, FolderOpenIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"  
import { Input } from "@/components/ui/input"
import { Tree, TreeItem, TreeItemLabel } from "@/components/tree"

export interface Item {
  name: string
  children?: string[]
}

interface FileTreeProps {
  items: Record<string, Item>
  rootItemId: string
  initialExpandedItems?: string[]
  className?: string
  onSelectionChange?: (selectedId: string | null) => void
}

const indent = 20

export default function FileTree({
  items,
  rootItemId,
  initialExpandedItems = [],
  className,
  onSelectionChange,
}: FileTreeProps) {
  // Store the initial expanded items to reset when search is cleared
  const [state, setState] = useState<Partial<TreeState<Item>>>({})

  useEffect(() => {
    if (onSelectionChange) {
      const selectedId = state.selectedItems?.[0]
      onSelectionChange(selectedId ?? null)
    }
  }, [state.selectedItems, onSelectionChange])

  const tree = useTree<Item>({
    state,
    setState,
    initialState: {
      expandedItems: initialExpandedItems,
    },
    indent,
    rootItemId: rootItemId,
    getItemName: (item) => item.getItemData()?.name ?? '',
    isItemFolder: (item) => item.getItemData()?.children != null,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      searchFeature,
      expandAllFeature,
    ],
  })

  return (
    <div className={cn("flex h-full flex-col gap-2 *:nth-2:grow min-h-0 ", className)}>
      <div className="relative">
        <Input
          className="peer ps-9"
          {...{
            ...tree.getSearchInputElementProps(),
            onChange: (e) => {
              // First call the original onChange handler from getSearchInputElementProps
              const originalProps = tree.getSearchInputElementProps()
              if (originalProps.onChange) {
                originalProps.onChange(e)
              }

              // Then handle our custom logic
              const value = e.target.value

              if (value.length > 0) {
                // If input has at least one character, expand all items
                tree.expandAll()
              } else {
                // If input is cleared, reset to initial expanded state
                setState((prevState) => {
                  return {
                    ...prevState,
                    expandedItems: initialExpandedItems,
                  }
                })
              }
            },
          }}
          type="search"
          placeholder="搜索文件关键词..."
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon className="size-4" aria-hidden="true" />
        </div>
      </div>

      <Tree
        indent={indent}
        tree={tree}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {tree.getItems().map((item) => {
          return (
            <TreeItem key={item.getId()} item={item} className="group">
              <TreeItemLabel>
                <span className="flex items-center gap-2 group-hover:text-primary-foreground">
                  {item.isFolder() &&
                    (item.isExpanded() ? (
                      <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4" />
                    ) : (
                      <FolderIcon className="text-muted-foreground pointer-events-none size-4" />
                    ))}
                  {item.getItemName()}
                </span>
              </TreeItemLabel>
            </TreeItem>
          )
        })}
      </Tree>
    </div>
  )
}
