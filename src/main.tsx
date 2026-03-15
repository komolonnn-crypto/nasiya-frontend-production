import { Suspense } from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import "dayjs/locale/en";

import App from "@/app";
import { store } from "@/store";
import { ThemeProvider } from "@/theme/theme-provider";

dayjs.locale("en");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <Provider store={store}>
        <SnackbarProvider
          maxSnack={5}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Suspense>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </Suspense>
          </LocalizationProvider>
        </SnackbarProvider>
      </Provider>
    </BrowserRouter>
  </HelmetProvider>,
);
