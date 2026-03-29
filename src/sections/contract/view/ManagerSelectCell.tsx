import type { RootState } from "@/store";
import type { SelectChangeEvent } from "@mui/material";

import React from "react";
import { useSelector } from "react-redux";

import { Select, MenuItem } from "@mui/material";

interface ManagerSelectCellProps {
  row: any;
  onManagerChange: (contractId: string, newManager: string) => void;
}

export const ManagerSelectCell = React.memo(
  ({ row, onManagerChange }: ManagerSelectCellProps) => {
    const { managers } = useSelector((state: RootState) => state.employee);

    const { profile } = useSelector((state: RootState) => state.auth);
    const canEditManager =
      profile?.role === "admin" || profile?.role === "moderator";

    const selectedManagerId = React.useMemo(() => {
      if (!row.manager || !managers.length) return "";
      const targetName = row.manager.trim().toLowerCase();
      return (
        managers.find((m) => {
          const fullName = `${m.firstName} ${m.lastName}`.trim().toLowerCase();
          return (
            fullName === targetName ||
            (m.fullName && m.fullName.trim().toLowerCase() === targetName)
          );
        })?._id || ""
      );
    }, [row.manager, managers]);

    const handleChange = (event: SelectChangeEvent<string>) => {
      const newManager = event.target.value as string;
      onManagerChange(row._id, newManager);
    };

    if (!canEditManager) {
      return (
        <span style={{ fontSize: "14px" }}>
          {row.manager || "Tayinlanmagan"}
        </span>
      );
    }

    if (!managers || managers.length === 0) {
      return (
        <span
          style={{ fontSize: "14px", color: "var(--palette-text-disabled)" }}>
          Yuklanmoqda...
        </span>
      );
    }

    return (
      <Select
        value={selectedManagerId}
        onChange={handleChange}
        displayEmpty
        size="small"
        sx={{
          minWidth: "100px",
          width: "100%",
          height: "30px",
          fontSize: "13px",
          "& .MuiSelect-select": {
            py: 0,
            height: "22px",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "1px solid rgba(var(--palette-grey-500Channel) / 0.3)",
          },
        }}
        onClick={(e) => e.stopPropagation()}>
        <MenuItem value="" sx={{ fontSize: "13px" }}>
          <em>Manager tanlang</em>
        </MenuItem>
        {managers.map((manager) => (
          <MenuItem
            key={manager._id}
            value={manager._id}
            sx={{ fontSize: "13px" }}>
            {manager.fullName || `${manager.firstName} ${manager.lastName}`}
          </MenuItem>
        ))}
      </Select>
    );
  },
);

ManagerSelectCell.displayName = "ManagerSelectCell";
