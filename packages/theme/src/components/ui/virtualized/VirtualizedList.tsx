import React, { useRef } from 'react'
import { Box, List, ListItem, Paper } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  estimatedItemHeight?: number
  height?: number | string
  overscan?: number
  enableVirtualization?: boolean
  className?: string
}

interface ItemWrapperProps<T> {
  item: T
  index: number
  renderItem: (item: T, index: number) => React.ReactNode
}

function ItemWrapperComponent<T>({ item, index, renderItem }: ItemWrapperProps<T>) {
  return <>{renderItem(item, index)}</>
}

const MemoizedItemWrapper = React.memo(ItemWrapperComponent) as typeof ItemWrapperComponent

export function VirtualizedListInner<T>({
  items,
  renderItem,
  estimatedItemHeight = 50,
  height = '600px',
  overscan = 5,
  enableVirtualization = true,
  className,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const shouldVirtualize = enableVirtualization && items.length > 50

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan,
    enabled: shouldVirtualize,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  if (!shouldVirtualize) {
    return (
      <Paper
        ref={parentRef}
        className={className}
        sx={{
          height,
          overflow: 'auto',
        }}
      >
        <List>
          {items.map((item, index) => (
            <ListItem key={index} disablePadding>
              <MemoizedItemWrapper item={item} index={index} renderItem={renderItem} />
            </ListItem>
          ))}
        </List>
      </Paper>
    )
  }

  return (
    <Paper
      ref={parentRef}
      className={className}
      sx={{
        height,
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <Box
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={rowVirtualizer.measureElement}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MemoizedItemWrapper
              item={items[virtualItem.index]}
              index={virtualItem.index}
              renderItem={renderItem}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

export const VirtualizedList = React.memo(VirtualizedListInner) as typeof VirtualizedListInner
export default VirtualizedList
