import type { FC } from "react";
import { Box, Card, Chip, Stack, Avatar, Typography } from "@mui/material";
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineOppositeContent,
} from "@mui/lab";
import { MdEdit, MdPerson } from "react-icons/md";

interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

interface EditHistoryItem {
  date: Date | string;
  editedBy:
    | {
        _id: string;
        firstName: string;
        lastName: string;
      }
    | string;
  changes: Change[];
}

interface EditHistoryTimelineProps {
  history: EditHistoryItem[];
  title?: string;
}

const EditHistoryTimeline: FC<EditHistoryTimelineProps> = ({
  history,
  title = "Tahrirlash Tarixi",
}) => {
  if (!history || history.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hali tahrirlash tarixi yo'q
        </Typography>
      </Card>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Ha" : "Yo'q";
    if (value instanceof Date)
      return new Date(value).toLocaleDateString("uz-UZ");
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString("uz-UZ");
    }
    if (typeof value === "string" && value.match(/^[0-9a-fA-F]{24}$/)) {
      return "ID: " + value.substring(0, 8) + "...";
    }
    return String(value);
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      monthlyPayment: "Oylik to'lov",
      initialPayment: "Boshlang'ich to'lov",
      totalPrice: "Umumiy narx",
      productName: "Mahsulot nomi",
      period: "Muddat",
      percentage: "Foiz",
      startDate: "Boshlanish sanasi",
      endDate: "Tugash sanasi",
      status: "Holat",
      price: "Narx",
      originalPrice: "Asl narx",

      firstName: "Ism",
      lastName: "Familiya",
      phoneNumber: "Telefon",
      passportSeries: "Passport",
      address: "Manzil",
      birthDate: "Tug'ilgan sana",
      telegramName: "Telegram",
      Manager: "Meneger",

      "Passport fayli": "Passport fayli",
      "Shartnoma fayli": "Shartnoma fayli",
      Foto: "Foto",
    };
    return fieldNames[field] || field;
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Timeline position="right">
        {history.map((item, index) => {
          const editor =
            typeof item.editedBy === "string" ||
            !item.editedBy ||
            !item.editedBy.firstName
              ? { firstName: "Noma'lum", lastName: "", _id: "" }
              : item.editedBy;

          return (
            <TimelineItem key={index}>
              <TimelineOppositeContent
                color="text.secondary"
                sx={{ flex: 0.3 }}
              >
                <Typography variant="caption" display="block">
                  {new Date(item.date).toLocaleDateString("uz-UZ")}
                </Typography>
                <Typography variant="caption" display="block">
                  {new Date(item.date).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color="primary">
                  <MdEdit />
                </TimelineDot>
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Box sx={{ mb: 2 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: "0.875rem" }}
                    >
                      <MdPerson />
                    </Avatar>
                    <Typography variant="subtitle2">
                      {editor.firstName} {editor.lastName}
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    {item.changes.map((change, changeIndex) => (
                      <Box
                        key={changeIndex}
                        sx={{
                          p: 1.5,
                          bgcolor: "background.neutral",
                          borderRadius: 0,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {formatFieldName(change.field)}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          <Chip
                            label={formatValue(change.oldValue)}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                          <Typography variant="caption">→</Typography>
                          <Chip
                            label={formatValue(change.newValue)}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Card>
  );
};

export default EditHistoryTimeline;
