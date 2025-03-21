"use client"

import { useState, useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Filter, MoreHorizontal, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApplicationsGrid() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // For application review
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewStatus, setReviewStatus] = useState("PENDING")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/applications")
      if (response.ok) {
        const applications = await response.json()
        setData(applications)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleReviewSubmit = async () => {
    if (!selectedApplication) return

    setIsSubmittingReview(true)
    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: reviewStatus,
          comment: reviewComment,
        }),
      })

      if (response.ok) {
        toast({
          title: "Review Submitted",
          description: `Application ${reviewStatus === "ACCEPTED" ? "accepted" : reviewStatus === "REJECTED" ? "rejected" : "updated"} successfully`,
        })

        // Update the application in the data array
        setData((prevData) =>
          prevData.map((app) => (app.id === selectedApplication.id ? { ...app, status: reviewStatus } : app)),
        )

        // Close dialog and reset form
        setIsDialogOpen(false)
        setReviewComment("")
        setReviewStatus("PENDING")
        setSelectedApplication(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to submit review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsSubmittingReview(false)
  }

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="truncate max-w-[80px]">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "user.username",
      header: "Username",
      cell: ({ row }) => <div>{row.original.user?.username || "Unknown"}</div>,
    },
    {
      accessorKey: "user.mcUuid",
      header: "Minecraft",
      cell: ({ row }) => <div>{row.original.user?.mcUuid ? "✓" : "✗"}</div>,
    },
    {
      accessorKey: "village.name",
      header: "Village",
      cell: ({ row }) => <div>{row.original.village?.name || "Unknown"}</div>,
    },
    {
      accessorKey: "clan.name",
      header: "Clan",
      cell: ({ row }) => <div>{row.original.clan?.name || "None"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Badge
            variant="outline"
            className={
              status === "ACCEPTED"
                ? "border-green-500 text-green-500"
                : status === "REJECTED"
                  ? "border-red-500 text-red-500"
                  : status === "INTERVIEW"
                    ? "border-blue-500 text-blue-500"
                    : "border-yellow-500 text-yellow-500"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const application = row.original

        return (
          <Dialog
            open={isDialogOpen && selectedApplication?.id === application.id}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setSelectedApplication(null)
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#473f14]/50" />
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedApplication(application)
                      setReviewStatus(application.status)
                    }}
                  >
                    Review Application
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem
                  onClick={() => {
                    // Copy application ID to clipboard
                    navigator.clipboard.writeText(application.id)
                    toast({
                      title: "Copied",
                      description: "Application ID copied to clipboard",
                    })
                  }}
                >
                  Copy ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
              <DialogHeader>
                <DialogTitle>Review Application</DialogTitle>
                <DialogDescription className="text-[#e0d8c0]/70">
                  Review and update the status of this application
                </DialogDescription>
              </DialogHeader>

              {selectedApplication && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Applicant</Label>
                      <p className="text-sm text-[#e0d8c0]">{selectedApplication.user?.username}</p>
                    </div>
                    <div>
                      <Label>Minecraft Account</Label>
                      <p className="text-sm text-[#e0d8c0]">
                        {selectedApplication.user?.mcUuid ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                    <div>
                      <Label>Village</Label>
                      <p className="text-sm text-[#e0d8c0]">{selectedApplication.village?.name}</p>
                    </div>
                    <div>
                      <Label>Clan</Label>
                      <p className="text-sm text-[#e0d8c0]">{selectedApplication.clan?.name || "None"}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Biography</Label>
                    <div className="mt-1 p-3 bg-[#0c0c0c]/50 rounded-md border border-[#473f14]/50 text-sm text-[#e0d8c0]/90 max-h-32 overflow-y-auto">
                      {selectedApplication.biography || "No biography provided"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Update Status</Label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger id="status" className="bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                        <SelectItem value="ACCEPTED">Accept</SelectItem>
                        <SelectItem value="REJECTED">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add a comment about this application..."
                      className="min-h-[100px] bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedApplication(null)
                  }}
                  className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview}
                  className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by username..."
            value={(table.getColumn("user.username")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("user.username")?.setFilterValue(event.target.value)}
            className="max-w-sm bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#473f14]/50" />
              <DropdownMenuCheckboxItem
                checked={table.getColumn("status")?.getFilterValue() === "PENDING"}
                onCheckedChange={() => {
                  table
                    .getColumn("status")
                    ?.setFilterValue(table.getColumn("status")?.getFilterValue() === "PENDING" ? null : "PENDING")
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("status")?.getFilterValue() === "INTERVIEW"}
                onCheckedChange={() => {
                  table
                    .getColumn("status")
                    ?.setFilterValue(table.getColumn("status")?.getFilterValue() === "INTERVIEW" ? null : "INTERVIEW")
                }}
              >
                Interview
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("status")?.getFilterValue() === "ACCEPTED"}
                onCheckedChange={() => {
                  table
                    .getColumn("status")
                    ?.setFilterValue(table.getColumn("status")?.getFilterValue() === "ACCEPTED" ? null : "ACCEPTED")
                }}
              >
                Accepted
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("status")?.getFilterValue() === "REJECTED"}
                onCheckedChange={() => {
                  table
                    .getColumn("status")
                    ?.setFilterValue(table.getColumn("status")?.getFilterValue() === "REJECTED" ? null : "REJECTED")
                }}
              >
                Rejected
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
            onClick={fetchApplications}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "user.username"
                        ? "Username"
                        : column.id === "user.mcUuid"
                          ? "Minecraft"
                          : column.id === "village.name"
                            ? "Village"
                            : column.id === "clan.name"
                              ? "Clan"
                              : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border border-[#473f14] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#0c0c0c]/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-[#473f14]/50 hover:bg-[#473f14]/10">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[#e0d8c0]">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-[#473f14]/50 hover:bg-[#473f14]/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[#e0d8c0]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#e0d8c0]/60">
                  {isLoading ? "Loading..." : "No applications found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#e0d8c0]/60">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} applications
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

