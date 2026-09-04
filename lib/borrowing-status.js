export function getBorrowingStatusMeta(status) {
  switch (status) {
    case "BORROWING":
      return { label: "借出", variant: "default" }
    case "RETURNED":
      return { label: "已还", variant: "secondary" }
    case "OVERDUE":
      return { label: "逾期", variant: "destructive" }
    default:
      return { label: status, variant: "outline" }
  }
}
