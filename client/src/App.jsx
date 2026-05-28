import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ModalProvider } from "./context/ModalContext.jsx";

import { AppLayout } from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { EventsPage } from "./pages/EventsPage.jsx";
import { EventDetailPage } from "./pages/EventDetailPage.jsx";
import { MyEventsPage } from "./pages/MyEventsPage.jsx";
import { MyPassPage } from "./pages/MyPassPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { CreateEventPage } from "./pages/CreateEventPage.jsx";
import { CreateAnnouncementPage } from "./pages/CreateAnnouncementPage.jsx";
import { ApprovalsPage } from "./pages/ApprovalsPage.jsx";
import { ScannerPage } from "./pages/ScannerPage.jsx";
import { AssetsPage } from "./pages/AssetsPage.jsx";
import { VenuesPage } from "./pages/VenuesPage.jsx";
import { StudentsPage } from "./pages/StudentsPage.jsx";
import { GuestsPage } from "./pages/GuestsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/my-events" element={<MyEventsPage />} />
                <Route path="/my-pass" element={<MyPassPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-announcement"
                  element={
                    <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
                      <CreateAnnouncementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/approvals"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <ApprovalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scanner"
                  element={
                    <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
                      <ScannerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assets"
                  element={
                    <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
                      <AssetsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/venues"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <VenuesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/people"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <StudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id/guests"
                  element={
                    <ProtectedRoute roles={["ORGANIZER", "ADMIN"]}>
                      <GuestsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
