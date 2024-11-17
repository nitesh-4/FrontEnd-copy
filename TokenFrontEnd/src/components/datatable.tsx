import { useState, useEffect } from "react";
import { database, ref, get } from "@/hooks/firebase";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";



interface User {
  id: string;
  fullName: string;
  address: string;
  walletAddress: string;
  idURL: string;
}

interface Asset {
  id: string;
  name: string;
  description: string;
  ownershipDocumentURL: string;
  pricePerShare: number;
  totalShares: string;
  type: string;
  value: string;
  createdAt: string;
  assetImages: string[];
  user: User; 
}

const DataTableDemo = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Fetch user data
  async function fetchAllData() {
    const dbRef = ref(database)
    try {
      const snapshot = await get(dbRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const usersData: User[] = Object.entries(data.users || {}).map(([id, user]: [string, any]) => ({
          id,
          fullName: user.fullName || "",
          address: user.address || "",
          walletAddress: user.walletAddress || "",
          idURL: user.idURL || "",
        }))
        console.log(usersData)
        setUsers(usersData)
        
        // Fetching assets data
        const assetsData: Asset[] = Object.entries(data.assets || {}).flatMap(
          ([userId, assets]: [string, any]) =>
            Object.entries(assets).map(([assetId, asset]: [string, any]) => ({
              id: assetId, // Use the asset ID as the asset's unique identifier
              name: asset.name,
              description: asset.description,
              ownershipDocumentURL: asset.ownershipDocumentURL,
              pricePerShare: asset.pricePerShare,
              totalShares: asset.totalShares,
              type: asset.type,
              value: asset.value,
              createdAt: asset.createdAt,
              assetImages: asset.assetImages, // Include images if needed
              user: data.users[userId] || {}, // Link the user data
            }))
        );
        console.log("Assets Data:", assetsData);
        setAssets(assetsData);

      } else {
        console.error("No data available")
        setUsers([])
        setAssets([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setUsers([])
      setAssets([]);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const filterAssetsByUserId = (userId: string) => {
    return assets.filter((asset) => asset.user.id === userId);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => <div>{row.getValue("fullName")}</div>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <div>{row.getValue("address")}</div>,
    },
    {
      accessorKey: "walletAddress",
      header: "Wallet Address",
      cell: ({ row }) => <div>{row.getValue("walletAddress")}</div>,
    },
    {
      accessorKey: "idURL",
      header: "ID Document",
      cell: ({ row }) => (
        <a href={row.getValue("idURL")} target="_blank" rel="noopener noreferrer">
          View Document
        </a>
      ),
    },
  ];

  // Initialize the React Table
  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter users..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button variant="outline" className="ml-auto">
          Columns <ChevronDown />
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTableDemo;
