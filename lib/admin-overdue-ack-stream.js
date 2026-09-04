export function parseSseChunk(buffer, chunk) {
  const normalized = `${buffer}${chunk}`.replace(/\r\n/g, "\n")
  const frames = normalized.split("\n\n")
  const nextBuffer = frames.pop() ?? ""

  return {
    buffer: nextBuffer,
    messages: frames.map(parseSseFrame).filter(Boolean),
  }
}

function parseSseFrame(frame) {
  let event = "message"
  const dataLines = []

  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim()
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  return {
    event,
    data: dataLines.join("\n"),
  }
}

export function buildAdminOverdueAckStreamHeaders(token) {
  return {
    Accept: "text/event-stream",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
