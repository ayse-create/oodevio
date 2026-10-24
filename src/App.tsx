import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AppState } from "./state/AppState";
import { NotebookLayout } from "./layouts/NotebookLayout";
import {
  CoverPage,
  RolePage,
  StudentEntry,
  LoginPage,
  RegisterPage,
} from "./pages/EntryPages";
import { Dashboard } from "./pages/Dashboard";
import { HomeworkPage, HomeworkDetail } from "./pages/HomeworkPages";
import { WrongsPage } from "./pages/WrongsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { ExamsPage } from "./pages/ExamsPage";
import { PlanPage } from "./pages/PlanPage";
import { NotesPage } from "./pages/NotesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeacherPage, TeacherStudentPage } from "./pages/TeacherPages";
import { Empty } from "./components/ui";
export default function App() {
  return (
    <ThemeProvider>
      <AppState>
        <HashRouter>
          <Routes>
            <Route path="/" element={<CoverPage />} />
            <Route path="/giris" element={<RolePage />} />
            <Route path="/giris/ogrenci" element={<StudentEntry />} />
            <Route path="/giris/ogrenci/kod" element={<LoginPage />} />
            <Route path="/giris/ogretmen" element={<LoginPage teacher />} />
            <Route path="/kayit" element={<RegisterPage />} />
            <Route path="/ogrenci" element={<NotebookLayout role="student" />}>
              <Route index element={<Dashboard />} />
              <Route path="odevler" element={<HomeworkPage />} />
              <Route path="odevler/:id" element={<HomeworkDetail />} />
              <Route path="yanlislar" element={<WrongsPage />} />
              <Route path="hedefler" element={<GoalsPage />} />
              <Route path="denemeler" element={<ExamsPage />} />
              <Route path="plan" element={<PlanPage />} />
              <Route path="notlar" element={<NotesPage />} />
              <Route path="ayarlar" element={<SettingsPage />} />
            </Route>
            <Route path="/ogretmen" element={<NotebookLayout role="teacher" />}>
              <Route index element={<TeacherPage />} />
              <Route path="ogrenci" element={<TeacherStudentPage />} />
              <Route path="ogrenci/:id" element={<TeacherStudentPage />} />
              <Route path="ayarlar" element={<SettingsPage teacher />} />
            </Route>
            <Route
              path="*"
              element={
                <div className="entry-page">
                  <Empty
                    title="Bu sayfa defterinde yok."
                    description="Aradığın sayfa taşınmış veya adres yanlış yazılmış olabilir."
                    action="Defterime dön"
                    to="/"
                  />
                </div>
              }
            />
          </Routes>
        </HashRouter>
      </AppState>
    </ThemeProvider>
  );
}
