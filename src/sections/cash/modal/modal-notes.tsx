import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { MdClose, MdNoteAlt } from "react-icons/md";

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
  notes: string;
  customerName?: string;
  amount?: number;
}

export default function NotesModal({
  open,
  onClose,
  notes,
  customerName,
  amount,
}: NotesModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MdNoteAlt size={24} color="var(--palette-primary-main)" />
          <Typography variant="h6" component="span">
            To'lov izohi
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <MdClose />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        {customerName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Mijoz:
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {customerName}
            </Typography>
          </Box>
        )}

        {amount && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Summa:
            </Typography>
            <Typography variant="h6" color="primary.main">
              ${amount.toLocaleString()}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" color="text.secondary" gutterBottom>
          Izoh:
        </Typography>
        <Box
          sx={{
            bgcolor: "background.neutral",
            p: 2,
            borderRadius: 0,
            maxHeight: "400px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
          <Typography variant="body2">{notes || "Izoh yo'q"}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
