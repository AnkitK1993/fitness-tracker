import type { DocumentData, Query } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import type { DependencyList } from 'react'
import { useEffect, useState } from 'react'

interface CollectionState<T> {
  data: T[]
  loading: boolean
  error: Error | null
}

/**
 * Generic realtime Firestore subscription. `getQuery` is rebuilt when `deps`
 * change; return null to skip subscribing (e.g. while a filter is unset).
 */
export function useCollection<T extends { id: string }>(
  getQuery: () => Query<DocumentData> | null,
  deps: DependencyList,
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({ data: [], loading: true, error: null })

  useEffect(() => {
    const q = getQuery()
    if (!q) {
      setState({ data: [], loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    return onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
        setState({ data, loading: false, error: null })
      },
      (error) => setState({ data: [], loading: false, error }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
