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
import { ChevronDown, MoreHorizontal, RefreshCw } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

export default function UsersGrid() {
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

  // For user management
  const [selectedUser, setSelectedUser] = useState(null)
  const [userRoles, setUserRoles] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])
  const [isSubmittingRoles, setIsSubmittingRoles] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const users = await response.json()
        setData(users)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles")
      if (response.ok) {
        const roles = await response.json()
        setAvailableRoles(roles)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch roles",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleRoleToggle = (roleId) => {
    setUserRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const handleRolesSubmit = async () => {
    if (!selectedUser) return

    setIsSubmittingRoles(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/roles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleIds: userRoles,
        }),
      })

      if (response.ok) {
        toast({
          title: "Roles Updated",
          description: "User roles have been updated successfully",
        })

        // Update the user in the data array
        setData((prevData) =>
          prevData.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  roles: availableRoles.filter((role) => userRoles.includes(role.id)),
                }
              : user,
          ),
        )

        // Close dialog and reset form
        setIsDialogOpen(false)
        setUserRoles([])
        setSelectedUser(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update roles",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating roles:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
    setIsSubmittingRoles(false)
  }

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="truncate max-w-[80px]">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                row.original.avatar
                  ? `https://cdn.discordapp.com/avatars/${row.original.discordId}/${row.original.avatar}.png`
                  : ""
              }
              alt={row.getValue("username")}
            />
            <AvatarFallback className="bg-[#473f14] text-[#e0d8c0]">
              {row.getValue("username").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{row.getValue("username")}</span>
        </div>
      ),
    },
    {
      accessorKey: "mcUuid",
      header: "Minecraft",
      cell: ({ row }) => <div>{row.getValue("mcUuid") ? "✓" : "✗"}</div>,
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => {
        const roles = row.getValue("roles") || []
        return (
          <div className="flex flex-wrap gap-1">
            {roles.length > 0 ? (
              roles.map((role) => (
                <Badge key={role.id} variant="outline" className="border-[#473f14] text-[#e0d8c0]">
                  {role.name}
                </Badge>
              ))
            ) : (
              <span className="text-[#e0d8c0]/60 text-sm">No roles</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original

        return (
          <Dialog
            open={isDialogOpen && selectedUser?.id === user.id}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setSelectedUser(null)
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
                      setSelectedUser(user)
                      setUserRoles(user.roles?.map((role) => role.id) || [])
                    }}
                  >
                    Manage Roles
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem
                  onClick={() => {
                    // Copy user ID to clipboard
                    navigator.clipboard.writeText(user.id)
                    toast({
                      title: "Copied",
                      description: "User ID copied to clipboard",
                    })
                  }}
                >
                  Copy ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="bg-[#241c14] border-[#473f14] text-[#e0d8c0]">
              <DialogHeader>
                <DialogTitle>Manage User Roles</DialogTitle>
                <DialogDescription className="text-[#e0d8c0]/70">
                  Assign or remove roles for this user
                </DialogDescription>
              </DialogHeader>

              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedUser.avatar
                            ? `https://cdn.discordapp.com/avatars/${selectedUser.discordId}/${selectedUser.avatar}.png`
                            : ""
                        }
                        alt={selectedUser.username}
                      />
                      <AvatarFallback className="bg-[#473f14] text-[#e0d8c0]">
                        {selectedUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedUser.username}</p>
                      <p className="text-sm text-[#e0d8c0]/70">Discord ID: {selectedUser.discordId}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="space-y-2 border border-[#473f14]/50 rounded-md p-3 bg-[#0c0c0c]/30">
                      {availableRoles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={userRoles.includes(role.id)}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                            className="data-[state=checked]:bg-[#473f14] data-[state=checked]:border-[#473f14]"
                          />
                          <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
                            {role.name}
                          </Label>
                        </div>
                      ))}

                      {availableRoles.length === 0 && <p className="text-sm text-[#e0d8c0]/60">No roles available</p>}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedUser(null)
                  }}
                  className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRolesSubmit}
                  disabled={isSubmittingRoles}
                  className="bg-[#473f14] hover:bg-[#5a4f1c] text-[#e0d8c0] border border-[#3b3414]"
                >
                  {isSubmittingRoles ? "Saving..." : "Save Changes"}
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
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("username")?.setFilterValue(event.target.value)}
            className="max-w-sm bg-[#0c0c0c]/50 border-[#473f14] text-[#e0d8c0] placeholder:text-[#e0d8c0]/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#473f14] text-[#e0d8c0] hover:bg-[#473f14]/20"
            onClick={fetchUsers}
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
                      {column.id}
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
                  {isLoading ? "Loading..." : "No users found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#e0d8c0]/60">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} users
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

