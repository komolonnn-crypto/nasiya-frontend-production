import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { RouterLink } from "@/routes/components";

import { SimpleLayout } from "@/layouts/simple";

export function NotFoundView() {
  return (
    <SimpleLayout content={{ compact: true }}>
      <Container>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Kechirasiz, sahifa topilmadi!
        </Typography>

        <Typography sx={{ color: "text.secondary" }}>
          Kechirasiz, siz qidirayotgan sahifani topa olmadik. Ehtimol siz URL
          manzilini noto&lsquo;g&lsquo;ri kiritgandirsiz? Imlo xatolarni
          tekshirib ko&lsquo;ring
        </Typography>

        <Box
          component="img"
          src="/assets/illustrations/illustration-404.svg"
          sx={{
            width: 320,
            height: "auto",
            my: { xs: 5, sm: 10 },
          }}
        />

        <Button
          component={RouterLink}
          href="/"
          size="large"
          variant="contained"
          color="inherit">
          Asosiy sahigaqa qaytish
        </Button>
      </Container>
    </SimpleLayout>
  );
}
