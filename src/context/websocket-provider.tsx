import { SharedClient } from "@/hooks/use-rpc2"
import { getKomariNodes, komariToNezhaWebsocketResponse } from "@/lib/utils"
import React, { useCallback, useEffect, useRef, useState } from "react"

import { WebSocketContext, WebSocketContextType } from "./websocket-context"

interface WebSocketProviderProps {
  url: string
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [lastMessage, setLastMessage] = useState<{ data: string } | null>(null)
  const [messageHistory, setMessageHistory] = useState<{ data: string }[]>([])
  const [connected, setConnected] = useState(false)
  const [needReconnect, setNeedReconnect] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestInFlightRef = useRef(false)

  const getData = useCallback(async () => {
    if (requestInFlightRef.current) return
    requestInFlightRef.current = true

    try {
      const response = await SharedClient().call("common:getNodesLatestStatus")
      const normalized = komariToNezhaWebsocketResponse(response)
      const message = { data: JSON.stringify(normalized) }

      setLastMessage(message)
      setMessageHistory((previous) => [message, ...previous].slice(0, 30))
      setConnected(true)
    } catch (error) {
      setConnected(false)
      console.warn("getNodesLatestStatus 失败，等待下一轮:", error instanceof Error ? error.message : error)
    } finally {
      requestInFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    getKomariNodes().catch((error) => {
      console.warn("预加载节点列表失败:", error instanceof Error ? error.message : error)
    })

    void getData()
    intervalRef.current = setInterval(() => void getData(), 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [getData])

  const reconnect = useCallback(() => {
    setConnected(false)
    void getData()
  }, [getData])

  const contextValue: WebSocketContextType = {
    lastMessage,
    connected,
    messageHistory,
    reconnect,
    needReconnect,
    setNeedReconnect,
  }

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}
